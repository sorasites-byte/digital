import { createBrowserClient } from '@supabase/ssr'

/**
 * Configuração do Supabase. As chaves vêm SÓ do ambiente (.env.local na sua
 * máquina, Environment Variables na Vercel). Nunca coloque chaves no código.
 */
export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  // https obrigatório; http só para o Supabase local (supabase start).
  if (!url || !anonKey || !/^(https:\/\/.+|http:\/\/(127\.0\.0\.1|localhost)(:\d+)?\/?$)/.test(url)) {
    throw new Error(
      'Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no arquivo .env.local (veja .env.local.example).'
    )
  }
  return { url, anonKey }
}

/** Cookies de sessão: httpOnly (o JavaScript da página não lê), secure em produção, sameSite=lax. */
export const secureCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
}

/**
 * Cliente Supabase para o navegador. Como a sessão fica em cookies httpOnly,
 * login, cadastro, senha e logout passam pelo servidor (app/(auth)/actions.ts).
 */
export function createClient() {
  const { url, anonKey } = getSupabaseEnv()
  return createBrowserClient(url, anonKey)
}
