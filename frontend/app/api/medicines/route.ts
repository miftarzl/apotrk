import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE || ''

export async function GET() {
  try {
    if (!SUPABASE_URL || !SUPABASE_KEY) return NextResponse.json({ error: 'Supabase service role not configured' }, { status: 500 })
    const supabase = createClient(String(SUPABASE_URL), String(SUPABASE_KEY))
    const medsRes = await supabase.from('medicines').select('id, nama_obat, kategori, kandungan, kemasan, manfaat, dosis, efek_samping, deskripsi, harga, foto_url, stock').order('id', { ascending: true })
    if (medsRes.error) throw medsRes.error
    const meds = Array.isArray(medsRes.data) ? medsRes.data : []

    const catsRes = await supabase.from('categories').select('id, nama_kategori')
    if (catsRes.error) throw catsRes.error
    const cats = Array.isArray(catsRes.data) ? catsRes.data : []

    const catMap: any = {}
    cats.forEach((c:any)=> { if (c && c.id !== undefined) catMap[c.id] = c.nama_kategori })
    const mapped = meds.map((m:any)=> ({
      id: m.id,
      nama_obat: m.nama_obat,
      kategori: m.kategori,
      kategori_nama: m.kategori ? catMap[m.kategori] : null,
      kandungan: m.kandungan || null,
      kemasan: m.kemasan || null,
      manfaat: m.manfaat || null,
      dosis: m.dosis || null,
      efek_samping: m.efek_samping || null,
      deskripsi: m.deskripsi,
      harga: m.harga,
      stock: m.stock !== undefined && m.stock !== null ? Number(m.stock) : 0,
      foto_url: m.foto_url
    }))
    return NextResponse.json(mapped)
  } catch (err:any) {
    console.error(err)
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}
