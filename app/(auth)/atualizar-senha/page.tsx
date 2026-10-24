import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase-server'
import { UpdatePasswordForm } from './update-password-form'

export const metadata: Metadata = { title: 'Nova senha | Sora', robots: { index: false } }

export default async function AtualizarSenhaPage() {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Só chega aqui quem abriu um link de recuperação válido (sessão criada em /auth/confirm).
  if (!user) redirect('/login?erro=link')

  return <UpdatePasswordForm />
}
