'use server'

import { redirect } from 'next/navigation'
import { createServerSupabase, getSiteOrigin } from '@/lib/supabase-server'
import {
  GENERIC_LOGIN_ERROR,
  loginSchema,
  resetRequestSchema,
  safeNext,
  signupSchema,
  updatePasswordSchema,
  type ActionResult,
} from '@/lib/validation/auth'

const TOO_MANY = 'Muitas tentativas. Aguarde alguns minutos e tente novamente.'

function firstIssue(error: { issues: { message: string }[] }): string {
  return error.issues[0]?.message ?? 'Dados inválidos'
}

export async function login(formData: FormData): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })
  // Qualquer entrada inválida recebe a mesma mensagem genérica.
  if (!parsed.success) return { ok: false, error: GENERIC_LOGIN_ERROR }

  const supabase = await createServerSupabase()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)
  if (error) {
    if (error.status === 429) return { ok: false, error: TOO_MANY }
    return { ok: false, error: GENERIC_LOGIN_ERROR }
  }

  redirect(safeNext(formData.get('next')))
}

export async function signup(formData: FormData): Promise<ActionResult> {
  const parsed = signupSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
    acceptTerms: formData.get('acceptTerms'),
  })
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) }

  const supabase = await createServerSupabase()
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${await getSiteOrigin()}/auth/confirm?next=/dashboard`,
      data: { lgpd_consent_at: new Date().toISOString() },
    },
  })

  // Senha vazada (HIBP) ou fraca segundo o Supabase: único erro que mostramos,
  // pois não revela se o e-mail existe.
  if (error && error.code === 'weak_password') {
    return { ok: false, error: 'Essa senha é fraca ou já apareceu em vazamentos. Escolha outra.' }
  }

  // Sucesso ou e-mail já cadastrado recebem a MESMA resposta (sem enumeração).
  return {
    ok: true,
    message: 'Se o e-mail puder ser usado, enviamos um link de confirmação. Verifique sua caixa de entrada.',
  }
}

export async function requestPasswordReset(formData: FormData): Promise<ActionResult> {
  const parsed = resetRequestSchema.safeParse({ email: formData.get('email') })
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) }

  const supabase = await createServerSupabase()
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${await getSiteOrigin()}/auth/confirm?next=/atualizar-senha`,
  })

  // Resposta idêntica exista ou não a conta.
  return {
    ok: true,
    message: 'Se existir uma conta com esse e-mail, enviamos um link para redefinir a senha. O link expira em 1 hora.',
  }
}

export async function updatePassword(formData: FormData): Promise<ActionResult> {
  const parsed = updatePasswordSchema.safeParse({
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  })
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) }

  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Link expirado ou inválido. Solicite uma nova redefinição de senha.' }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password })
  if (error) {
    if (error.code === 'same_password') return { ok: false, error: 'A nova senha precisa ser diferente da atual.' }
    if (error.code === 'weak_password') return { ok: false, error: 'Essa senha é fraca ou já apareceu em vazamentos. Escolha outra.' }
    return { ok: false, error: 'Não foi possível atualizar a senha. Solicite um novo link.' }
  }

  // Derruba as sessões em outros dispositivos após trocar a senha.
  await supabase.auth.signOut({ scope: 'others' })
  redirect('/dashboard')
}

export async function logout(): Promise<void> {
  const supabase = await createServerSupabase()
  await supabase.auth.signOut()
  redirect('/login')
}
