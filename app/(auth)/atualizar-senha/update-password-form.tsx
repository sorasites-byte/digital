'use client'

import { useState, useTransition, type FormEvent } from 'react'
import { updatePassword } from '../actions'
import { updatePasswordSchema } from '@/lib/validation/auth'
import { Alert, AuthCard, ui } from '@/components/auth-ui'
import { PasswordStrength } from '@/components/password-strength'

export function UpdatePasswordForm() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const parsed = updatePasswordSchema.safeParse({
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword'),
    })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Dados inválidos')
      return
    }
    setError(null)
    startTransition(async () => {
      const result = await updatePassword(formData)
      if (result && !result.ok) setError(result.error)
    })
  }

  return (
    <AuthCard title="Criar nova senha" subtitle="Depois de salvar, as sessões em outros dispositivos serão encerradas.">
      {error ? <Alert kind="error">{error}</Alert> : null}
      <form onSubmit={onSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <label style={ui.label}>
          <span>Nova senha</span>
          <input
            style={ui.input}
            name="password"
            type="password"
            autoComplete="new-password"
            required
            maxLength={72}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <PasswordStrength value={password} />
        <label style={ui.label}>
          <span>Confirmar nova senha</span>
          <input style={ui.input} name="confirmPassword" type="password" autoComplete="new-password" required maxLength={72} />
        </label>
        <button type="submit" style={{ ...ui.button, opacity: pending ? 0.7 : 1 }} disabled={pending} aria-busy={pending}>
          {pending ? 'Salvando…' : 'Salvar nova senha'}
        </button>
      </form>
    </AuthCard>
  )
}
