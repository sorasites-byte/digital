import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase-server'

/**
 * Segunda camada de proteção (defesa em profundidade): mesmo que o middleware
 * seja contornado, nenhuma página de /dashboard renderiza sem usuário válido.
 */
export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return <>{children}</>
}
