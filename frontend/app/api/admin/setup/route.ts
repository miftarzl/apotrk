import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const username = body.username || 'apotekadmin'
    const password = body.password || 'admin12321'

    const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE
    if (!SUPABASE_SERVICE_ROLE) return NextResponse.json({ error: 'Missing SUPABASE_SERVICE_ROLE' }, { status: 500 })

    const supabase = createClient(SUPABASE_URL as string, SUPABASE_SERVICE_ROLE)

    const email = `${username}@local`

    // create auth user via admin API
    const { data: createData, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { username, name: 'Apotek Admin', role: 'admin' }
    })

    if (createError) {
      // if user already exists, return ok (only one admin allowed)
      const msg = String(createError.message || createError)
      if (msg.toLowerCase().includes('already') || msg.toLowerCase().includes('registered')) {
        return NextResponse.json({ ok: true, note: 'admin already exists' })
      }
      return NextResponse.json({ error: createError.message }, { status: 500 })
    }

    const user = (createData as any).user || (createData as any)

    // upsert into profiles table if present
    try {
      await supabase.from('profiles').upsert([{ id: user.id, name: 'Apotek Admin', role: 'admin' }])
    } catch (e) {
      // ignore if table missing
    }

    return NextResponse.json({ ok: true, user: { id: user.id, email } })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}
