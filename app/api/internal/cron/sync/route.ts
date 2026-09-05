// app/api/internal/cron/sync/route.ts
import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import { createAdminClient } from '@/lib/internal/supabase/admin'

// --- KONFIGURASI KOLOM SUPPLIER ---
// Sesuaikan angka index ini dengan posisi kolom di file Google Sheets supplier.
// Ingat: Index dimulai dari 0 (Kolom A = 0, Kolom B = 1, dst).
const COL_NAME_INDEX = 1; // Contoh: Kolom B untuk Nama Barang
const COL_PRICE_INDEX = 2; // Contoh: Kolom C untuk Harga Modal

// Fungsi deteksi warna merah pada sel (Google API mereturn nilai RGB 0.0 - 1.0)
function isCellRed(color: any) {
  if (!color) return false;
  const r = color.red || 0;
  const g = color.green || 0;
  const b = color.blue || 0;
  // Rentang logika untuk warna merah dominan
  return r > 0.7 && g < 0.4 && b < 0.4;
}

export async function POST(request: Request) {
  try {
    // 1. Verifikasi Keamanan (Cegah akses publik)
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.INTERNAL_CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 })
    }

    const supabase = createAdminClient()

    // 2. Buat Record Versi Sync Baru di Supabase
    const { data: version, error: versionError } = await supabase
      .from('askara_internal_catalog_versions')
      .insert([{ status: 'syncing' }])
      .select('id')
      .single()

    if (versionError) throw new Error(`Gagal membuat versi: ${versionError.message}`)

    // 3. Inisialisasi Google Sheets API
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        // Replace wajib dilakukan agar format private key multi-line terbaca benar di Cloudflare/Vercel
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n').replace(/^"|"$/g, ''),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    })

    const sheets = google.sheets({ version: 'v4', auth })

    // 4. Tarik Data Spreadsheet beserta Format Warna
    const response = await sheets.spreadsheets.get({
      spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
      includeGridData: true,
      // Membatasi field untuk menghemat memori & mempercepat respons
      fields: 'sheets(properties.title,data.rowData.values(formattedValue,effectiveFormat.backgroundColor))',
    })

    const parsedItems: any[] = []
    const sheetData = response.data.sheets || []

    // 5. Ekstraksi Data per Baris
    for (const sheet of sheetData) {
      const categoryName = sheet.properties?.title || 'Uncategorized'
      const rows = sheet.data?.[0]?.rowData || []

      rows.forEach((row: any, rowIndex: number) => {
        const cells = row.values || []
        
        // Lewati baris jika sel nama barang atau harga kosong
        const nameCell = cells[COL_NAME_INDEX]
        const priceCell = cells[COL_PRICE_INDEX]
        
        if (!nameCell?.formattedValue || !priceCell?.formattedValue) return

        const itemName = String(nameCell.formattedValue).trim()
        // Bersihkan format harga (misal "Rp 1.000.000" jadi angka murni)
        const rawPrice = String(priceCell.formattedValue).replace(/[^0-9]/g, '')
        const basePrice = parseInt(rawPrice, 10)

        // Lewati jika ini adalah baris header (harga bukan angka valid)
        if (isNaN(basePrice) || basePrice === 0) return

        // Cek status stok dari warna latar sel Nama Barang
        const bgColor = nameCell.effectiveFormat?.backgroundColor
        const isOutOfStock = isCellRed(bgColor)

        parsedItems.push({
          version_id: version.id,
          sku: `${categoryName}-${rowIndex + 1}`, // Generate SKU unik berbasis baris
          name: itemName,
          category: categoryName,
          base_price: basePrice,
          stock_status: isOutOfStock ? 'out_of_stock' : 'available',
        })
      })
    }

    // 6. Bulk Insert ke Supabase (Batching per 1000 item agar tidak timeout)
    const chunkSize = 1000;
    for (let i = 0; i < parsedItems.length; i += chunkSize) {
      const chunk = parsedItems.slice(i, i + chunkSize);
      const { error: insertError } = await supabase
        .from('askara_internal_catalog_items')
        .insert(chunk);
      
      if (insertError) throw new Error(`Gagal insert data: ${insertError.message}`);
    }

    // 7. Update Status Versi Menjadi Selesai
    await supabase
      .from('askara_internal_catalog_versions')
      .update({ 
        status: 'completed', 
        total_items: parsedItems.length,
        completed_at: new Date().toISOString()
      })
      .eq('id', version.id)

    return NextResponse.json({ 
      success: true, 
      message: `Sync berhasil: ${parsedItems.length} item diperbarui.`,
      version_id: version.id 
    })

  } catch (error: any) {
    console.error('SYNC ERROR:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}