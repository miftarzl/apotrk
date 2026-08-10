const supabase = require('../config/supabase')

async function list(req, res) {
  try {
    const { data, error } = await supabase.from('categories').select('*').order('id', { ascending: true })
    console.log('categories.list supabase result:', { data, error })
    if (error) {
      console.error('categories.list supabase error:', error)
      return res.status(500).json({ error })
    }
    return res.json(Array.isArray(data) ? data : [])
  } catch (err) { console.error(err); return res.status(500).json({ error: 'Server error' }) }
}

async function create(req, res) {
  try {
    const payload = req.body
    if (!payload || !payload.nama_kategori) return res.status(400).json({ error: 'nama_kategori is required' })
    const toInsert = { nama_kategori: payload.nama_kategori }
    console.log('CREATE PAYLOAD:', toInsert)
    const { data, error } = await supabase.from('categories').insert([toInsert]).select()
    console.log('Supabase categories insert result:', { data, error })
    if (error) {
      console.error('SUPABASE ERROR:', error)
      console.log(error)
      console.log(error?.message)
      console.log(error?.details)
      return res.status(500).json({ error: error.message, details: error })
    }
    console.log('CREATE RESULT:', data)
    return res.json(data[0])
  } catch (err) { console.error(err); return res.status(500).json({ error: 'Server error' }) }
}

async function update(req, res) {
  try {
    const id = Number(req.params.id)
    console.log('Updating category', id, req.body)
    const toUpdate = { nama_kategori: req.body.nama_kategori }
    console.log('UPDATE PAYLOAD:', toUpdate)
    const { data, error } = await supabase.from('categories').update(toUpdate).eq('id', id).select()
    console.log('Supabase categories update result:', { data, error })
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
    console.log('Deleting category', id)
    const { data, error } = await supabase.from('categories').delete().eq('id', id).select()
    console.log('Supabase categories delete result:', { data, error })
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

module.exports = { list, create, update, remove }
