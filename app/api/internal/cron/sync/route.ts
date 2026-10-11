export const runtime = 'edge'

import { NextResponse } from 'next/server'
import { SignJWT, importPKCS8 } from 'jose'
import { createAdminClient } from '@/lib/internal/supabase/admin'
import { createRuangBocahAdminClient, sendRuangBocahPush } from '@/lib/ruangbocah/admin'

const COL_NAME_INDEX = 1;
const COL_PRICE_INDEX = 2;

function jakartaDate(value: Date) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit' }).format(value)
}

export async function GET(request: Request) {
  const task = new URL(request.url).searchParams.get('task')
  if (task === 'push-health') {
    const expected = process.env.PUSH_HEALTH_SECRET
    const received = request.headers.get('x-push-health-secret') ?? ''
    if (!expected || received !== expected) {
      return NextResponse.json({ error: 'Unauthorized', configured: Boolean(expected), expectedLength: expected?.length ?? 0, receivedLength: received.length }, { status: 401 })
    }
    try {
      const push = await sendRuangBocahPush({
        userIds: [],
        title: 'Tes Push Produksi',
        message: 'Push dari Cloudflare ke OneSignal berhasil.',
        type: 'system_test',
        broadcast: true,
      })
      return NextResponse.json({ success: true, push })
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Push health-check gagal' }, { status: 500 })
    }
  }
  if (task !== 'ruangbocah-reminders') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  const expected = process.env.RUANG_BOCAH_CRON_SECRET
  if (!expected || request.headers.get('authorization') !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const client = createRuangBocahAdminClient()
    const today = jakartaDate(new Date())
    const horizon = new Date(`${today}T00:00:00Z`)
    horizon.setUTCDate(horizon.getUTCDate() + 8)
    const { data: profiles, error } = await client.from('profiles')
      .select('id, full_name, premium_valid_until').eq('is_premium', true)
      .gte('premium_valid_until', `${today}T00:00:00.000Z`).lt('premium_valid_until', horizon.toISOString())
    if (error) throw error
    let sent = 0
    for (const profile of profiles ?? []) {
      const expiryDate = jakartaDate(new Date(profile.premium_valid_until))
      const remaining = Math.round((Date.parse(`${expiryDate}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86_400_000)
      if (![7, 3, 1, 0].includes(remaining)) continue
      const marker = `premium_expiry_h${remaining}_${expiryDate}`
      const { data: existing, error: lookupError } = await client.from('notifications').select('id').eq('user_id', profile.id).eq('type', marker).maybeSingle()
      if (lookupError) throw lookupError
      if (existing) continue
      const title = remaining === 0 ? 'Masa aktif berakhir hari ini' : `Masa aktif tinggal ${remaining} hari`
      const message = `${String(profile.full_name || 'Ayah/Bunda')}, masa aktif Ruang Bocah ${remaining === 0 ? 'berakhir hari ini' : `akan berakhir pada ${expiryDate}`}. Perpanjang sekarang agar layanan tetap aktif.`
      const { data: reservation, error: insertError } = await client.from('notifications')
        .insert({ user_id: profile.id, title, message, type: marker, is_read: false }).select('id').single()
      if (insertError) throw insertError
      try {
        await sendRuangBocahPush({ userIds: [profile.id], title, message, type: 'premium_expiry' })
        sent += 1
      } catch (pushError) {
        await client.from('notifications').delete().eq('id', reservation.id)
        throw pushError
      }
    }
    return NextResponse.json({ success: true, sent, date: today })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Pengingat gagal' }, { status: 500 })
  }
}

function isCellRed(color: any) {
  if (!color) return false;
  const r = color.red || 0;
  const g = color.green || 0;
  const b = color.blue || 0;
  return r > 0.7 && g < 0.4 && b < 0.4;
}

async function getGoogleAuthToken() {
  const privateKeyEnv = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n').replace(/^"|"$/g, '');
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  
  const privateKey = await importPKCS8(privateKeyEnv!, 'RS256');
  const jwt = await new SignJWT({
    iss: clientEmail,
    scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
    aud: 'https://oauth2.googleapis.com/token',
  })
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(privateKey);
    
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`
  });
  
  const data = await res.json();
  if (!data.access_token) throw new Error('Gagal mendapatkan token Google API');
  return data.access_token;
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.INTERNAL_CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 })
    }

    const supabase = createAdminClient()

    const { data: version, error: versionError } = await supabase
      .from('askara_internal_catalog_versions')
      .insert([{ status: 'syncing' }])
      .select('id')
      .single()

    if (versionError) throw new Error(`Gagal membuat versi: ${versionError.message}`)

    const token = await getGoogleAuthToken()
    const sheetUrl = `https://sheets.googleapis.com/v4/spreadsheets/${process.env.GOOGLE_SPREADSHEET_ID}?includeGridData=true&fields=sheets(properties.title,data.rowData.values(formattedValue,effectiveFormat.backgroundColor))`
    
    const sheetRes = await fetch(sheetUrl, { headers: { Authorization: `Bearer ${token}` } })
    const responseData = await sheetRes.json()
    if (responseData.error) throw new Error(responseData.error.message)

    // PERBAIKAN UTAMA: Ambil semua data katalog lama dari Database
    // Agar kita bisa mengingat editan manual user dan tidak menimpanya
    const { data: existingDbItems } = await supabase
      .from('askara_internal_catalog_items')
      .select('*')
    
    const existingDataMap = new Map()
    if (existingDbItems) {
      existingDbItems.forEach(item => {
        if (item.sku) existingDataMap.set(item.sku, item)
      })
    }

    const parsedItems: any[] = []
    const sheetData = responseData.sheets || []

    for (const sheet of sheetData) {
      const categoryName = sheet.properties?.title || 'Uncategorized'
      const rows = sheet.data?.[0]?.rowData || []

      rows.forEach((row: any, rowIndex: number) => {
        const cells = row.values || []
        
        const nameCell = cells[COL_NAME_INDEX]
        const priceCell = cells[COL_PRICE_INDEX]
        
        if (!nameCell?.formattedValue || !priceCell?.formattedValue) return

        const itemName = String(nameCell.formattedValue).trim()
        const rawPrice = String(priceCell.formattedValue).replace(/[^0-9]/g, '')
        const basePrice = parseInt(rawPrice, 10)

        if (isNaN(basePrice) || basePrice === 0) return

        const bgColor = nameCell.effectiveFormat?.backgroundColor
        const isOutOfStock = isCellRed(bgColor)
        
        const sku = `${categoryName}-${rowIndex + 1}`
        
        // Cek apakah produk ini sudah ada di Database sebelumnya?
        const existingItem = existingDataMap.get(sku)

        if (existingItem) {
          // JIKA SUDAH ADA: Pertahankan Nama Editan, Gambar, Kategori, Deskripsi.
          // Hanya timpa (update) Harga Dasar dan Stoknya saja!
          parsedItems.push({
            ...existingItem, 
            version_id: version.id, 
            base_price: basePrice, 
            stock_status: isOutOfStock ? 'Habis' : 'Tersedia',
            stock_qty: isOutOfStock ? 0 : 5, 
          })
        } else {
          // JIKA BARANG BARU: Tambahkan apa adanya dari Spreadsheet
          parsedItems.push({
            version_id: version.id,
            sku: sku,
            name: itemName,
            category: categoryName,
            base_price: basePrice,
            stock_status: isOutOfStock ? 'Habis' : 'Tersedia',
            stock_qty: isOutOfStock ? 0 : 5,
          })
        }
      })
    }

    const chunkSize = 1000;
    for (let i = 0; i < parsedItems.length; i += chunkSize) {
      const chunk = parsedItems.slice(i, i + chunkSize);
      
      const { error: upsertError } = await supabase
        .from('askara_internal_catalog_items')
        .upsert(chunk, { 
          onConflict: 'sku', 
          ignoreDuplicates: false 
        });
        
      if (upsertError) throw new Error(`Gagal upsert data: ${upsertError.message}`);
    }

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
      message: `Sync berhasil: ${parsedItems.length} item diperbarui. Nama editan user dipertahankan!`,
      version_id: version.id 
    })

  } catch (error: any) {
    console.error('SYNC ERROR:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
