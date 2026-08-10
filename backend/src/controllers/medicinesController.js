const supabase = require('../config/supabase')

async function list(req, res) {
  try {
    // Ensure medicines are returned ordered by id ascending
    // include category info (categories table relates via medicines.kategori -> categories.id)
    const { data, error } = await supabase.from('medicines').select('*, categories:kategori (id, nama_kategori)').order('id', { ascending: true })
    console.log('medicines.list supabase result:', { data, error })
    if (error) return res.status(500).json({ error })
    if (error) {
      console.error('medicines.list supabase error:', error)
      return res.status(500).json({ error })
    }
    return res.json(Array.isArray(data) ? data : [])
  } catch (err) { console.error(err); return res.status(500).json({ error: 'Server error' }) }
}

async function popular(req, res) {
  try {
    const { data, error } = await supabase
      .from('medicines')
      .select(`
        *,
        categories:kategori (
          id,
          nama_kategori
        )
      `)
      .order('stock', { ascending: false })
      .limit(10)

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    return res.json(Array.isArray(data) ? data : [])

  } catch (err) {
    console.error(err)
    return res.status(500).json({
      error: 'Server error'
    })
  }
}

async function getById(req, res) {
  try {
    const id = Number(req.params.id)
    console.log('requested medicine id:', id)

    const { data, error } = await supabase
      .from('medicines')
      .select('*, categories:kategori (id, nama_kategori)')
      .eq('id', id)
      .single()

    console.log('medicines.get supabase result:', { data, error })

    if (error) {
      console.error('medicines.get supabase error:', error)
      return res.status(500).json({ error: error.message || error })
    }

    if (!data) {
      return res.status(404).json({ error: 'Medicine not found' })
    }

      console.log('category result:', data.categories)

    const kategori_nama = data.categories ? data.categories.nama_kategori : null

    const out = {
      id: data.id,
      nama_obat: data.nama_obat,
      kategori: data.kategori,
      kategori_nama,
      kandungan: data.kandungan || null,
      kemasan: data.kemasan || null,
      manfaat: data.manfaat || null,
      dosis: data.dosis || null,
      efek_samping: data.efek_samping || null,
      deskripsi: data.deskripsi,
      harga: data.harga,
      stock: data.stock !== undefined && data.stock !== null ? Number(data.stock) : 0,
      foto_url: data.foto_url,
      categories: data.categories || null
    }

    console.log('medicine result:', out)
    return res.json(out)
  } catch (err) {
    console.error('medicines.get error:', err)
    return res.status(500).json({ error: 'Server error' })
  }
}

async function create(req, res) {
  try {
    const payload = req.body
    console.log('REQ BODY:', payload)
    if (!payload || !payload.nama_obat) return res.status(400).json({ error: 'nama_obat is required' })
    // ensure kategori is numeric or null (match DB column 'kategori')
    // whitelist allowed fields to avoid kategori_id or other unexpected cols
    const toInsert = {
      nama_obat: payload.nama_obat,
      kategori: payload.kategori !== undefined ? (payload.kategori ? Number(payload.kategori) : null) : null,
      kandungan: payload.kandungan || null,
      kemasan: payload.kemasan || null,
      manfaat: payload.manfaat || null,
      dosis: payload.dosis || null,
      efek_samping: payload.efek_samping || null,
      deskripsi: payload.deskripsi || null,
      harga: payload.harga !== undefined && payload.harga !== '' ? Number(payload.harga) : null,
      foto_url: payload.foto_url || '',
      stock: payload.stock !== undefined && payload.stock !== null ? Number(payload.stock) : 20
    }
    console.log('INSERT DATA:', toInsert)
    const { data, error } = await supabase.from('medicines').insert([toInsert]).select()
    console.log('SUPABASE RESULT:', data)
    console.log('SUPABASE ERROR:', error)
    if (error) {
      console.error('SUPABASE ERROR:', error)
      console.log(error)
      console.log(error?.message)
      console.log(error?.details)
      return res.status(500).json({ error: error.message, details: error })
    }
    return res.json(data[0])
  } catch (err) { console.error(err); return res.status(500).json({ error: 'Server error' }) }
}

async function update(req, res) {
  try {
    const id = Number(req.params.id)
    const payload = req.body || {}
      // whitelist update fields
      const toUpdate = {}
      if (payload.nama_obat !== undefined) toUpdate.nama_obat = payload.nama_obat
      if (payload.kategori !== undefined) toUpdate.kategori = payload.kategori ? Number(payload.kategori) : null
      if (payload.kandungan !== undefined) toUpdate.kandungan = payload.kandungan
      if (payload.kemasan !== undefined) toUpdate.kemasan = payload.kemasan
      if (payload.manfaat !== undefined) toUpdate.manfaat = payload.manfaat
      if (payload.dosis !== undefined) toUpdate.dosis = payload.dosis
      if (payload.efek_samping !== undefined) toUpdate.efek_samping = payload.efek_samping
      if (payload.deskripsi !== undefined) toUpdate.deskripsi = payload.deskripsi
      if (payload.harga !== undefined) toUpdate.harga = payload.harga === '' ? null : Number(payload.harga)
      if (payload.foto_url !== undefined) toUpdate.foto_url = payload.foto_url
      if (payload.stock !== undefined) toUpdate.stock = Number(payload.stock)
      console.log('UPDATE PAYLOAD:', toUpdate)
      const { data, error } = await supabase.from('medicines').update(toUpdate).eq('id', id).select()
      console.log('Supabase update result:', { data, error })
      if (error) {
        console.error('SUPABASE ERROR:', error)
        console.log(error)
        console.log(error?.message)
        console.log(error?.details)
        return res.status(500).json({ error: error.message, details: error })
      }
      return res.json(data[0])
  } catch (err) { console.error(err); return res.status(500).json({ error: 'Server error' }) }
}

async function remove(req, res) {
  try {
    const id = Number(req.params.id)
    console.log('Deleting medicine', id)
      const { data, error } = await supabase.from('medicines').delete().eq('id', id).select()
      console.log('Supabase delete result:', { data, error })
      if (error) {
        console.error('SUPABASE ERROR:', error)
        console.log(error)
        console.log(error?.message)
        console.log(error?.details)
        return res.status(500).json({ error: error.message, details: error })
      }
      return res.json({ ok: true })
  } catch (err) { console.error(err); return res.status(500).json({ error: 'Server error' }) }
}

module.exports = { list, popular, getById, create, update, remove }
