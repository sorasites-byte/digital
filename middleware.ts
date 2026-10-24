import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseEnv, secureCookieOptions } from '@/lib/supabase'

const PROTECTED = ['/dashboard', '/app']
const AUTH_PAGES = ['/login', '/cadastro']

const isProtected = (path: string) => PROTECTED.some((p) => path === p || path.startsWith(p + '/'))

// Redireciona com o endereço exato (o Next reescreve barras finais em NextResponse.redirect).
const redirectExact = (request: NextRequest, path: string) =>
  new NextResponse(null, { status: 307, headers: { Location: request.nextUrl.origin + path } })

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // O app do Sora fica em public/app; os caminhos relativos dele precisam da barra no fim.
  if (pathname === '/app') {
    return redirectExact(request, '/app/' + request.nextUrl.search)
  }

  let response = pathname === '/app/'
    ? NextResponse.rewrite(new URL('/app/index.html', request.url), { request })
    : NextResponse.next({ request })
  const cacheHeaders: Record<string, string> = {}

  const { url, anonKey } = getSupabaseEnv()
  const supabase = createServerClient(url, anonKey, {
    cookieOptions: secureCookieOptions,
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = pathname === '/app/'
          ? NextResponse.rewrite(new URL('/app/index.html', request.url), { request })
          : NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, { ...options, ...secureCookieOptions })
        )
        Object.entries(headers).forEach(([key, value]) => {
          cacheHeaders[key] = value
          response.headers.set(key, value)
        })
      },
    },
  })

  // getUser() valida o token no servidor do Supabase (getSession() não valida).
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const redirectTo = (location: string) => {
    const redirect = redirectExact(request, location)
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie))
    Object.entries(cacheHeaders).forEach(([key, value]) => redirect.headers.set(key, value))
    return redirect
  }

  if (!user && isProtected(pathname)) {
    const next = pathname.startsWith('/app') ? '/app/' : pathname
    return redirectTo('/login?next=' + encodeURIComponent(next))
  }

  if (user && AUTH_PAGES.includes(pathname)) {
    return redirectTo('/app/')
  }

  if (isProtected(pathname)) response.headers.set('Cache-Control', 'private, no-store, max-age=0')
  return response
}

export const config = {
  matcher: [
    // Tudo, exceto arquivos internos do Next e os arquivos estáticos do app (imagens e scripts,
    // sem dados de ninguém). A página do Sora em /app/ continua protegida.
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sora-logo.webp|app/assets/|app/vendor/|app/support\\.js).*)',
  ],
}
