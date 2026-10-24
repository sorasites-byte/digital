import 'server-only'
import { createServerClient } from '@supabase/ssr'
import { cookies, headers } from 'next/headers'
import { getSupabaseEnv, secureCookieOptions } from '@/lib/supabase'

/**
 * Cliente Supabase do servidor (Server Components, Server Actions, Route Handlers).
 * Para checar quem está logado use SEMPRE supabase.auth.getUser().
 */
export async function createServerSupabase() {
  const { url, anonKey } = getSupabaseEnv()
  const cookieStore = await cookies()

  return createServerClient(url, anonKey, {
    cookieOptions: secureCookieOptions,
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, { ...options, ...secureCookieOptions })
          )
        } catch {
          // Server Components não gravam cookies; o middleware renova a sessão.
        }
      },
    },
  })
}

/** Endereço do próprio site (para os links dos e-mails), sem precisar de outra variável de ambiente. */
export async function getSiteOrigin(): Promise<string> {
  const h = await headers()
  const origin = h.get('origin')
  if (origin && /^https?:\/\/[^/]+$/.test(origin)) return origin
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000'
  const proto = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https')
  return `${proto}://${host}`
}
