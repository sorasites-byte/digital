import type { Metadata } from 'next'
import { safeNext } from '@/lib/validation/auth'
import { LoginForm } from './login-form'

export const metadata: Metadata = { title: 'Entrar | Sora', robots: { index: false } }

type SearchParams = Promise<Record<string, string | string[] | undefined>>

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const next = safeNext(params.next)
  const linkError = params.erro === 'link'

  return <LoginForm next={next} linkError={linkError} />
}
