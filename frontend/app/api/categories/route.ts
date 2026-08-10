import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE || ''

export async function GET(){
  try{
    if (!SUPABASE_URL || !SUPABASE_KEY) return NextResponse.json({ error: 'Supabase service role not configured' }, { status: 500 })
    const supabase = createClient(String(SUPABASE_URL), String(SUPABASE_KEY))
    const res = await supabase.from('categories').select('id, nama_kategori').order('id', { ascending: true })
    if (res.error) throw res.error
    const cats = Array.isArray(res.data) ? res.data : []
    return NextResponse.json(cats)
  }catch(err:any){
    console.error(err)
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}
