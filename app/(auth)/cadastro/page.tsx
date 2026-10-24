'use client'

import Link from 'next/link'
import { useState, useTransition, type FormEvent } from 'react'
import { signup } from '../actions'
import { signupSchema } from '@/lib/validation/auth'
import { Alert, AuthCard, ui } from '@/components/auth-ui'
import { PasswordStrength } from '@/components/password-strength'

export default function CadastroPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)

    const parsed = signupSchema.safeParse({
      email: formData.get('email'),
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword'),
      acceptTerms: formData.get('acceptTerms'),
    })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Dados inválidos')
      return
    }

    setError(null)
    startTransition(async () => {
      const result = await signup(formData)
      if (result.ok) {
        setSuccess(result.message ?? 'Verifique seu e-mail.')
        form.reset()
        setPassword('')
      } else {
        setError(result.error)
      }
    })
  }

  if (success) {
    return (
      <AuthCard title="Confira seu e-mail">
        <Alert kind="success">{success}</Alert>
        <Link href="/login" style={ui.link}>
          Voltar para o login
        </Link>
      </AuthCard>
    )
  }

  return (
    <AuthCard title="Criar conta na Sora" subtitle="Leva menos de um minuto.">
      {error ? <Alert kind="error">{error}</Alert> : null}
      <form onSubmit={onSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <label style={ui.label}>
          <span>E-mail</span>
          <input style={ui.input} name="email" type="email" autoComplete="email" inputMode="email" required maxLength={254} />
        </label>
        <label style={ui.label}>
          <span>Senha</span>
          <input
            style={ui.input}
            name="password"
            type="password"
            autoComplete="new-password"
            required
            maxLength={72}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-describedby="password-rules"
          />
        </label>
        <div id="password-rules">
          <PasswordStrength value={password} />
        </div>
        <label style={ui.label}>
          <span>Confirmar senha</span>
          <input style={ui.input} name="confirmPassword" type="password" autoComplete="new-password" required maxLength={72} />
        </label>
        <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13, color: '#B9B2DA', cursor: 'pointer' }}>
          <input type="checkbox" name="acceptTerms" required style={{ width: 18, height: 18, marginTop: 1, accentColor: '#7C3AED' }} />
          <span>
            Li e aceito os{' '}
            <Link href="/termos" style={ui.link}>
              Termos de Uso
            </Link>{' '}
            e a{' '}
            <Link href="/privacidade" style={ui.link}>
              Política de Privacidade
            </Link>
            , incluindo o tratamento dos meus dados conforme a LGPD.
          </span>
        </label>
        <button type="submit" style={{ ...ui.button, opacity: pending ? 0.7 : 1 }} disabled={pending} aria-busy={pending}>
          {pending ? 'Criando conta…' : 'Criar conta'}
        </button>
      </form>
      <Link href="/login" style={ui.link}>
        Já tenho conta
      </Link>
    </AuthCard>
  )
}
