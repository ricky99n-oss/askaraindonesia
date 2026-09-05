// middleware.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          supabaseResponse = NextResponse.next({
            request: { headers: request.headers },
          })
          supabaseResponse.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          supabaseResponse = NextResponse.next({
            request: { headers: request.headers },
          })
          supabaseResponse.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const isInternalRoute = request.nextUrl.pathname.startsWith('/internal')
  const isLoginRoute = request.nextUrl.pathname === '/internal/login'

  // Jika mencoba akses /internal (selain login) tanpa sesi -> Lempar ke login
  if (isInternalRoute && !isLoginRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/internal/login'
    return NextResponse.redirect(url)
  }

  // Jika sudah login tapi mencoba buka halaman login -> Lempar ke dashboard
  if (isLoginRoute && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/internal/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    // Lewati rute statis, image, dan API Cron (akan diproteksi secret key, bukan session)
    '/((?!_next/static|_next/image|favicon.ico|api/internal/cron|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}