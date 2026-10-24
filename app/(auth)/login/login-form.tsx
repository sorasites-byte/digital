'use client'

import Link from 'next/link'
import { useState, useTransition, type FormEvent } from 'react'
import { login } from '../actions'
import { GENERIC_LOGIN_ERROR, loginSchema } from '@/lib/validation/auth'
import { Alert, AuthCard, ui } from '@/components/auth-ui'

export function LoginForm({ next, linkError }: { next: string; linkError: boolean }) {
  const [error, setError] = useState<string | null>(
    linkError ? 'O link expirou ou é inválido. Faça login ou peça um novo link.' : null
  )
  const [pending, startTransition] = useTransition()

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    // Validação no cliente só para UX; o servidor valida de novo com o mesmo schema.
    const parsed = loginSchema.safeParse({
      email: formData.get('email'),
      password: formData.get('password'),
    })
    if (!parsed.success) {
      setError(GENERIC_LOGIN_ERROR)
      return
    }

    setError(null)
    startTransition(async () => {
      const result = await login(formData)
      if (result && !result.ok) setError(result.error)
    })
  }

  return (
    <AuthCard title="Entrar na Sora" subtitle="Acesse seu painel de vendas e a Academia.">
      {error ? <Alert kind="error">{error}</Alert> : null}
      <form onSubmit={onSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <input type="hidden" name="next" value={next} />
        <label style={ui.label}>
          <span>E-mail</span>
          <input style={ui.input} name="email" type="email" autoComplete="email" inputMode="email" required maxLength={254} />
        </label>
        <label style={ui.label}>
          <span>Senha</span>
          <input style={ui.input} name="password" type="password" autoComplete="current-password" required maxLength={72} />
        </label>
        <button type="submit" style={{ ...ui.button, opacity: pending ? 0.7 : 1 }} disabled={pending} aria-busy={pending}>
          {pending ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
      <div style={ui.row}>
        <Link href="/recuperar-senha" style={ui.link}>
          Esqueci minha senha
        </Link>
        <Link href="/cadastro" style={ui.link}>
          Criar conta
        </Link>
      </div>
    </AuthCard>
  )
}
