import { NextResponse } from 'next/server'
import { createRuangBocahAdminClient } from '@/lib/ruangbocah/admin'

export const runtime = 'edge'

export async function GET(request: Request) {
  try {
    const category = new URL(request.url).searchParams.get('category')
    let query = createRuangBocahAdminClient()
      .from('articles')
      .select('id,title,category,content,image_url,reading_time_minutes,is_featured,created_at')
      .order('created_at', { ascending: false })
      .limit(30)
    if (category && category !== 'Semua') query = query.eq('category', category)
    const { data, error } = await query
    if (error) throw error
    return NextResponse.json({ articles: data ?? [] })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Artikel belum dapat dimuat'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
