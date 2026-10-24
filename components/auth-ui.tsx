import type { CSSProperties, ReactNode } from 'react'

const c = {
  bg: '#0D0A26',
  card: 'rgba(32,24,72,0.72)',
  border: '#3B2F6B',
  input: '#140F2E',
  text: '#FFFFFF',
  muted: '#B9B2DA',
  primary: '#7C3AED',
  danger: '#FFB4B4',
  dangerBg: 'rgba(220,38,38,0.14)',
  ok: '#BDF5CF',
  okBg: 'rgba(34,197,94,0.14)',
}

export const ui: Record<string, CSSProperties> = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    background: `radial-gradient(60% 50% at 50% 0%, rgba(124,58,237,0.35), transparent 70%), ${c.bg}`,
    color: c.text,
    fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, sans-serif',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    background: c.card,
    border: `1px solid ${c.border}`,
    borderRadius: 24,
    padding: 28,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    boxShadow: '0 18px 48px rgba(3,8,24,0.55)',
    backdropFilter: 'blur(16px)',
  },
  title: { margin: 0, fontSize: 26, fontWeight: 700 },
  subtitle: { margin: 0, color: c.muted, fontSize: 15 },
  label: { display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 500, color: c.muted },
  input: {
    height: 46,
    padding: '0 14px',
    borderRadius: 12,
    border: `1px solid ${c.border}`,
    background: c.input,
    color: c.text,
    fontSize: 16,
  },
  button: {
    height: 48,
    border: 0,
    borderRadius: 999,
    background: c.primary,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
  },
  link: { color: '#C9B8FF', fontSize: 14 },
  row: { display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' },
}

export function AuthCard({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <main style={ui.page}>
      <section style={ui.card} aria-labelledby="auth-title">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/sora-logo.webp" alt="" width={44} height={44} style={{ filter: 'drop-shadow(0 0 8px rgba(124,58,237,0.7))' }} />
          <span style={{ fontFamily: 'Cinzel, Georgia, serif', fontSize: 22, fontWeight: 700, letterSpacing: '0.1em' }}>SORA</span>
        </div>
        <h1 id="auth-title" style={ui.title}>
          {title}
        </h1>
        {subtitle ? <p style={ui.subtitle}>{subtitle}</p> : null}
        {children}
      </section>
    </main>
  )
}

export function Alert({ kind, children }: { kind: 'error' | 'success'; children: ReactNode }) {
  const isError = kind === 'error'
  return (
    <div
      role={isError ? 'alert' : 'status'}
      style={{
        padding: '10px 14px',
        borderRadius: 12,
        fontSize: 14,
        background: isError ? c.dangerBg : c.okBg,
        color: isError ? c.danger : c.ok,
      }}
    >
      {children}
    </div>
  )
}
