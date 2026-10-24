import { NextResponse, type NextRequest } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

async function signOut(request: NextRequest) {
  const supabase = await createServerSupabase()
  await supabase.auth.signOut()
  return NextResponse.redirect(new URL('/login', request.url), { status: 303 })
}

export async function POST(request: NextRequest) {
  return signOut(request)
}

// Permite um link simples "Sair" dentro do app (ex.: <a href="/logout">).
export async function GET(request: NextRequest) {
  return signOut(request)
}
