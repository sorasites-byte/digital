/** @type {import('next').NextConfig} */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseHost = supabaseUrl.replace(/^https?:\/\//, '')
const isDev = process.env.NODE_ENV !== 'production'

const cspFor = (allowEval) =>
  [
    "default-src 'self'",
    // O app do Sora (/app) monta a tela com new Function, por isso só ele recebe 'unsafe-eval'.
    `script-src 'self' 'unsafe-inline'${allowEval || isDev ? " 'unsafe-eval'" : ''}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    `img-src 'self' data: blob: ${supabaseUrl}`,
    `connect-src 'self' ${supabaseUrl} wss://${supabaseHost}`,
    "frame-ancestors 'none'",
    "form-action 'self'",
    "base-uri 'self'",
    "object-src 'none'",
  ].join('; ')

const common = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
]

const noStore = [{ key: 'Cache-Control', value: 'private, no-store, max-age=0' }]
const noStorePaths = ['/login', '/cadastro', '/recuperar-senha', '/atualizar-senha', '/dashboard', '/auth', '/logout']

const nextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  // O middleware cuida de /app -> /app/ (o app usa caminhos relativos).
  skipTrailingSlashRedirect: true,
  async headers() {
    return [
      { source: '/:path((?!app).*)', headers: [...common, { key: 'Content-Security-Policy', value: cspFor(false) }] },
      { source: '/app', headers: [...common, { key: 'Content-Security-Policy', value: cspFor(true) }] },
      { source: '/app/:path*', headers: [...common, { key: 'Content-Security-Policy', value: cspFor(true) }] },
      ...noStorePaths.flatMap((path) => [
        { source: path, headers: noStore },
        { source: `${path}/:rest*`, headers: noStore },
      ]),
    ]
  },
}

module.exports = nextConfig
