'use client'

import Link from 'next/link'
import { useState, useTransition, type FormEvent } from 'react'
import { requestPasswordReset } from '../actions'
import { resetRequestSchema } from '@/lib/validation/auth'
import { Alert, AuthCard, ui } from '@/components/auth-ui'

export default function RecuperarSenhaPage() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const parsed = resetRequestSchema.safeParse({ email: formData.get('email') })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'E-mail inválido')
      return
    }
    setError(null)
    startTransition(async () => {
      const result = await requestPasswordReset(formData)
      if (result.ok) setSuccess(result.message ?? 'Verifique seu e-mail.')
      else setError(result.error)
    })
  }

  return (
    <AuthCard title="Recuperar senha" subtitle="Enviaremos um link para você criar uma nova senha.">
      {error ? <Alert kind="error">{error}</Alert> : null}
      {success ? (
        <Alert kind="success">{success}</Alert>
      ) : (
        <form onSubmit={onSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <label style={ui.label}>
            <span>E-mail</span>
            <input style={ui.input} name="email" type="email" autoComplete="email" inputMode="email" required maxLength={254} />
          </label>
          <button type="submit" style={{ ...ui.button, opacity: pending ? 0.7 : 1 }} disabled={pending} aria-busy={pending}>
            {pending ? 'Enviando…' : 'Enviar link'}
          </button>
        </form>
      )}
      <Link href="/login" style={ui.link}>
        Voltar para o login
      </Link>
    </AuthCard>
  )
}
