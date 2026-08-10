import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE)

function isAdmin(headers) {
  const key = headers.get('x-admin-key') || headers.get('authorization')
  if (!key) return false
  return key === process.env.ADMIN_API_KEY
}

export async function GET(req) {
  try {
    if (!isAdmin(req.headers)) return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { 'Content-Type': 'application/json' } })
    const { data, error } = await supabase.from('medicines').select('*')
    if (error) throw error
    return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}

export async function POST(req) {
  try {
    if (!isAdmin(req.headers)) return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { 'Content-Type': 'application/json' } })
    const payload = await req.json()
    const { data, error } = await supabase.from('medicines').insert([payload]).select()
    if (error) throw error
    return new Response(JSON.stringify(data[0]), { status: 201, headers: { 'Content-Type': 'application/json' } })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}

export async function PUT(req) {
  try {
    if (!isAdmin(req.headers)) return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { 'Content-Type': 'application/json' } })
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    const body = await req.json()
    const { data, error } = await supabase.from('medicines').update(body).eq('id', id).select()
    if (error) throw error
    return new Response(JSON.stringify(data[0]), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}

export async function DELETE(req) {
  try {
    if (!isAdmin(req.headers)) return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { 'Content-Type': 'application/json' } })
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    const { error } = await supabase.from('medicines').delete().eq('id', id)
    if (error) throw error
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}
