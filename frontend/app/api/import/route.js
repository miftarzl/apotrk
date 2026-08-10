import { createClient } from '@supabase/supabase-js'
import Papa from 'papaparse'
import { z } from 'zod'

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE)

const rowSchema = z.object({
  nama_obat: z.string(),
  kategori: z.string().optional(),
  indikasi: z.string().optional(),
  keluhan: z.string().optional(),
  riwayat_penyakit: z.string().optional(),
  deskripsi: z.string().optional(),
  bentuk_sediaan: z.string().optional(),
  harga: z.string().optional(),
  stok: z.string().optional(),
  gambar: z.string().optional()
})

function mapRow(row) {
  const parsed = rowSchema.safeParse(row)
  if (!parsed.success) throw new Error('Validation failed for row: ' + JSON.stringify(parsed.error.errors))
  const r = parsed.data
  return {
    name: r.nama_obat,
    indication: r.indikasi || '',
    symptoms: r.keluhan || '',
    disease_history: r.riwayat_penyakit || '',
    description: r.deskripsi || '',
    dosage_form: r.bentuk_sediaan || '',
    price: Number((r.harga || '').replace(/[^0-9.-]+/g, '')) || 0,
    stock: Number(r.stok || 0) || 0,
    image_url: r.gambar || null
  }
}

export async function POST(req) {
  try {
    const headers = req.headers
    const key = headers.get('x-admin-key') || headers.get('authorization')
    if (!key || key !== process.env.ADMIN_API_KEY) return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { 'Content-Type': 'application/json' } })
    const { csv } = await req.json()
    if (!csv) return new Response(JSON.stringify({ error: 'csv required in body' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    const parsed = Papa.parse(csv, { header: true, skipEmptyLines: true })
    const rows = parsed.data
    const mapped = []
    const errors = []
    for (let i = 0; i < rows.length; i++) {
      try {
        mapped.push(mapRow(rows[i]))
      } catch (e) {
        errors.push({ row: i + 1, error: e.message })
      }
    }
    // duplicate detection based on name
    const names = mapped.map(m => m.name.toLowerCase())
    const dupes = names.filter((v, i) => names.indexOf(v) !== i)
    // insert non-duplicates
    const unique = mapped.filter(m => !dupes.includes(m.name.toLowerCase()))
    const inserted = []
    for (const item of unique) {
      const { data, error } = await supabase.from('medicines').insert([item]).select()
      if (error) errors.push({ item, error: error.message })
      else inserted.push(data[0])
    }
    // TODO: trigger TF-IDF rebuild (can be background job)
    return new Response(JSON.stringify({ insertedCount: inserted.length, errors, duplicates: dupes }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}
