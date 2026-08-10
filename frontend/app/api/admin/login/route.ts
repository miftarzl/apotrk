import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { signToken, comparePassword, serializeCookie } from '@/lib/serverAuth'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE || ''

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password } = body
    if (!email || !password) return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    if (!SUPABASE_URL || !SUPABASE_KEY) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
    const { data, error } = await supabase.from('profiles').select('*').eq('email', email).limit(1).single()
    if (error) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    const profile = data as any
    const ok = comparePassword(password, profile.password_hash)
    if (!ok) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

    const token = signToken({ id: profile.id, email: profile.email, role: profile.role })
    const cookie = serializeCookie(token, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7, sameSite: 'Lax', secure: process.env.NODE_ENV === 'production' })

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Set-Cookie': cookie, 'Content-Type': 'application/json' } })
  } catch (err:any) {
    console.error(err)
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}

// use default Node runtime so server-side libraries like jsonwebtoken work
