import { NextResponse, type NextRequest } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'
import { z } from 'zod'
import { createServerSupabase } from '@/lib/supabase-server'
import { confirmNextSchema } from '@/lib/validation/auth'

const otpTypeSchema = z.enum(['email', 'signup', 'recovery', 'invite', 'email_change', 'magiclink'])

const paramsSchema = z.object({
  token_hash: z.string().min(10).max(512).optional(),
  code: z.string().min(10).max(512).optional(),
  type: otpTypeSchema.optional(),
  next: confirmNextSchema,
})

/**
 * Destino dos links de e-mail (confirmação de cadastro e recuperação de senha).
 * Aceita o formato token_hash (recomendado, funciona em outro dispositivo)
 * e o formato code (PKCE).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const parsed = paramsSchema.safeParse({
    token_hash: searchParams.get('token_hash') ?? undefined,
    code: searchParams.get('code') ?? undefined,
    type: searchParams.get('type') ?? undefined,
    next: searchParams.get('next') ?? undefined,
  })

  const fail = NextResponse.redirect(new URL('/login?erro=link', origin))
  if (!parsed.success) return fail

  const { token_hash, code, type, next } = parsed.data
  const supabase = await createServerSupabase()

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type: type as EmailOtpType, token_hash })
    if (error) return fail
    // Link de recuperação sempre leva para a troca de senha.
    return NextResponse.redirect(new URL(type === 'recovery' ? '/atualizar-senha' : next, origin))
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) return fail
    return NextResponse.redirect(new URL(next, origin))
  }

  return fail
}
