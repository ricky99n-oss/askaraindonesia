'use server'

import { supabase } from '@/lib/supabaseClient'
import { revalidatePath } from 'next/cache'

export async function saveProduct(formData: FormData) {
  const id = formData.get('id') as string
  const sku = formData.get('sku') as string
  const name = formData.get('name') as string
  const category = formData.get('category') as string
  const description = formData.get('description') as string
  
  // PERBAIKAN: Mencegah masuknya NaN jika user mengosongkan input
  const rawPrice = formData.get('base_price') as string
  const base_price = rawPrice && !isNaN(Number(rawPrice)) ? parseFloat(rawPrice) : 0
  
  const rawStock = formData.get('stock_qty') as string
  const stock_qty = rawStock && !isNaN(Number(rawStock)) ? parseInt(rawStock) : 0
  
  const isActive = formData.get('is_active') === 'on'
  const applyMargin = formData.get('apply_margin') === 'true'
  const isBestseller = formData.get('is_bestseller') === 'on'

  const files = formData.getAll('images') as File[]
  let uploadedUrls: string[] = []

  for (const file of files) {
    if (file.size === 0) continue;

    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`
    const { data, error } = await supabase.storage
      .from('products')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false
      })

    if (error) throw new Error(`Upload gambar gagal: ${error.message}`)

    if (data) {
      const { data: publicUrlData } = supabase.storage.from('products').getPublicUrl(data.path)
      uploadedUrls.push(publicUrlData.publicUrl)
    }
  }

  let finalImageUrl = formData.get('existing_image_url') as string
  let finalGalleryRaw = formData.get('existing_gallery_urls') as string
  let finalGalleryUrls: string[] = []
  
  try {
    finalGalleryUrls = finalGalleryRaw ? JSON.parse(finalGalleryRaw) : []
  } catch (e) {
    finalGalleryUrls = []
  }

  if (uploadedUrls.length > 0) {
    if (!finalImageUrl) finalImageUrl = uploadedUrls[0] 
    finalGalleryUrls = [...finalGalleryUrls, ...uploadedUrls] 
  }

  const payload = {
    sku,
    name,
    category,
    description,
    base_price,
    stock_qty,
    image_url: finalImageUrl,
    gallery_urls: finalGalleryUrls,
    is_active: isActive,
    apply_margin: applyMargin,
    is_bestseller: isBestseller,
    stock_status: stock_qty > 0 ? 'Tersedia' : 'Habis'
  }

  // Menangkap error spesifik jika database menolak update
  try {
    if (id) {
      const { error } = await supabase.from('askara_internal_catalog_items').update(payload).match({ id })
      if (error) throw new Error(error.message)
    } else {
      const { error } = await supabase.from('askara_internal_catalog_items').insert([payload])
      if (error) throw new Error(error.message)
    }
  } catch (dbError: any) {
    throw new Error(`Database Error: ${dbError.message}`)
  }

  revalidatePath('/internal/marketplace')
  revalidatePath('/marketplace')
}

export async function deleteProduct(id: string) {
  const { error } = await supabase.from('askara_internal_catalog_items').delete().match({ id })
  if (error) throw new Error(`Gagal hapus data: ${error.message}`)
  revalidatePath('/internal/marketplace')
  revalidatePath('/marketplace')
}