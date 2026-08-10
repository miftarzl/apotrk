import { NextResponse } from 'next/server'
import { serializeCookie } from '@/lib/serverAuth'

export async function POST() {
  const cookie = serializeCookie('', { httpOnly: true, path: '/', maxAge: 0, sameSite: 'Lax', secure: process.env.NODE_ENV === 'production' })
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Set-Cookie': cookie, 'Content-Type': 'application/json' } })
}

// use default Node runtime so server-side libraries work
