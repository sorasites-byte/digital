'use client'

import { passwordRules } from '@/lib/validation/auth'

const levels = [
  { label: 'Muito fraca', color: '#F87171' },
  { label: 'Fraca', color: '#FB923C' },
  { label: 'Média', color: '#FACC15' },
  { label: 'Boa', color: '#A3E635' },
  { label: 'Forte', color: '#4ADE80' },
]

export function PasswordStrength({ value }: { value: string }) {
  const passed = passwordRules.filter((r) => r.test(value)).length
  const level = levels[passed]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }} aria-live="polite">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ flexGrow: 1, height: 6, borderRadius: 999, background: '#140F2E', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${(passed / passwordRules.length) * 100}%`,
              background: level.color,
              transition: 'width .25s ease',
            }}
          />
        </div>
        <span style={{ fontSize: 12, fontWeight: 600, color: level.color, minWidth: 74, textAlign: 'right' }}>
          {value ? level.label : ''}
        </span>
      </div>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 4 }}>
        {passwordRules.map((rule) => {
          const ok = rule.test(value)
          return (
            <li key={rule.id} style={{ fontSize: 13, color: ok ? '#4ADE80' : '#B9B2DA', display: 'flex', gap: 8 }}>
              <span aria-hidden="true">{ok ? '✓' : '•'}</span>
              <span>
                {rule.label}
                <span style={{ position: 'absolute', left: -9999 }}>{ok ? ' (atendido)' : ' (pendente)'}</span>
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
