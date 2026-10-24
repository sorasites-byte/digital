import { z } from 'zod'

/** Mensagem única para qualquer falha de login (evita enumeração de usuários). */
export const GENERIC_LOGIN_ERROR = 'E-mail ou senha inválidos'

export const emailSchema = z
  .string({ required_error: 'Informe o e-mail' })
  .trim()
  .toLowerCase()
  .min(1, 'Informe o e-mail')
  .max(254, 'E-mail inválido')
  .email('E-mail inválido')

/** Regras de força: 8+ caracteres, maiúscula, número e símbolo. 72 = limite do bcrypt. */
export const passwordRules = [
  { id: 'length', label: 'Pelo menos 8 caracteres', test: (v: string) => v.length >= 8 },
  { id: 'upper', label: 'Uma letra maiúscula', test: (v: string) => /[A-Z]/.test(v) },
  { id: 'number', label: 'Um número', test: (v: string) => /[0-9]/.test(v) },
  { id: 'symbol', label: 'Um símbolo (ex.: ! @ # $ %)', test: (v: string) => /[^A-Za-z0-9]/.test(v) },
] as const

export const strongPasswordSchema = z
  .string({ required_error: 'Informe a senha' })
  .max(72, 'A senha pode ter no máximo 72 caracteres')
  .superRefine((value, ctx) => {
    for (const rule of passwordRules) {
      if (!rule.test(value)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: `A senha precisa ter: ${rule.label.toLowerCase()}` })
        return
      }
    }
  })

export const loginSchema = z.object({
  email: emailSchema,
  // No login não revelamos regras de senha: só limites de tamanho.
  password: z.string({ required_error: 'Informe a senha' }).min(1, 'Informe a senha').max(72, GENERIC_LOGIN_ERROR),
})

export const signupSchema = z
  .object({
    email: emailSchema,
    password: strongPasswordSchema,
    confirmPassword: z.string({ required_error: 'Confirme a senha' }),
    acceptTerms: z.literal('on', { errorMap: () => ({ message: 'Aceite os termos e a política de privacidade' }) }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

export const resetRequestSchema = z.object({ email: emailSchema })

export const updatePasswordSchema = z
  .object({
    password: strongPasswordSchema,
    confirmPassword: z.string({ required_error: 'Confirme a senha' }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

/**
 * Aceita só caminhos internos sob /dashboard ou /app (bloqueia open redirect como
 * "//evil.com", "https://..." ou "/\\evil.com").
 */
export const safeNextSchema = z
  .string()
  .regex(/^\/(dashboard|app)(\/[A-Za-z0-9\-_/]*)?$/)
  .catch('/app/')

export function safeNext(value: unknown): string {
  return safeNextSchema.parse(typeof value === 'string' ? value : '')
}

/** Destinos permitidos após confirmar um link de e-mail. */
export const confirmNextSchema = z.enum(['/dashboard', '/atualizar-senha']).catch('/dashboard')

export type ActionResult = { ok: true; message?: string } | { ok: false; error: string }
