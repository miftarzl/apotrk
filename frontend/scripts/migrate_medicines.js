const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

async function main(){
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE
  if(!SUPABASE_URL || !SUPABASE_KEY){
    console.error('Missing SUPABASE_SERVICE_ROLE or SUPABASE_URL. Set them in env before running.')
    process.exit(1)
  }

  const supabase = createClient(String(SUPABASE_URL), String(SUPABASE_KEY))

  const samplePath = path.resolve(__dirname, '../../backend/src/sample_medicines.json')
  if(!fs.existsSync(samplePath)){
    console.error('Sample file not found at', samplePath)
    process.exit(1)
  }

  const raw = JSON.parse(fs.readFileSync(samplePath, 'utf8'))
  if(!Array.isArray(raw) || raw.length===0){
    console.error('No sample medicines found in', samplePath)
    process.exit(1)
  }

  const rows = raw.map(r=>({
    id: r.id,
    nama_obat: r.name || r.nama_obat,
    kategori: r.category_id ?? r.kategori ?? null,
    gejala: r.symptoms || r.gejala || r.indication || null,
    deskripsi: r.description || r.deskripsi || null,
    harga: r.price ?? r.harga ?? null,
    stock: r.stock ?? null,
    foto_url: r.foto_url || null
  }))

  console.log('Uploading', rows.length, 'rows to Supabase (medicines table) via service role...')
  const { data, error } = await supabase.from('medicines').upsert(rows, { onConflict: 'id' })
  if(error){
    console.error('Upsert error:', error)
    process.exit(1)
  }
  console.log('Upsert completed. Rows in response:', Array.isArray(data)?data.length:0)
}

main().catch(err=>{ console.error(err); process.exit(1) })
