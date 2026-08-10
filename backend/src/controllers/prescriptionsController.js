const supabase = require('../config/supabase')

async function list(req, res) {
  try {
    const userId = req.user && req.user.id
    if (!userId) return res.status(401).json({ error: 'Not authenticated' })
    const { data, error } = await supabase
      .from('prescriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('prescriptions.list error', error)
      return res.status(500).json({ error: error.message || error })
    }
    return res.json(Array.isArray(data) ? data : [])
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
}

async function create(req, res) {
  try {
    const userId = req.user && req.user.id
    if (!userId) return res.status(401).json({ error: 'Not authenticated' })
    const payload = req.body || {}
    const image_url = payload.image_url || ''
    const notes = payload.notes || ''
    if (!image_url) return res.status(400).json({ error: 'image_url is required' })

    const toInsert = {
      user_id: userId,
      image_url,
      notes,
      status: 'Menunggu Verifikasi'
    }
    const { data, error } = await supabase.from('prescriptions').insert([toInsert]).select()
    if (error) {
      console.error('prescriptions.create error', error)
      return res.status(500).json({ error: error.message || error })
    }
    return res.json(data[0])
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
}

async function remove(req, res) {
  try {
    const userId = req.user && req.user.id
    if (!userId) return res.status(401).json({ error: 'Not authenticated' })
    const id = Number(req.params.id)
    if (!id) return res.status(400).json({ error: 'Invalid id' })

    const { data: existing, error: getErr } = await supabase.from('prescriptions').select('*').eq('id', id).single()
    if (getErr) {
      console.error('prescriptions.remove lookup error', getErr)
      return res.status(500).json({ error: getErr.message || getErr })
    }
    if (!existing) return res.status(404).json({ error: 'Prescription not found' })
    if (existing.user_id !== userId) return res.status(403).json({ error: 'Forbidden' })
    if (existing.status !== 'Menunggu Verifikasi') return res.status(400).json({ error: 'Cannot delete prescription in current status' })

    const { data, error } = await supabase.from('prescriptions').delete().eq('id', id).select()
    if (error) {
      console.error('prescriptions.delete error', error)
      return res.status(500).json({ error: error.message || error })
    }
    return res.json({ ok: true })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
}

module.exports = { list, create, remove }

async function detail(req, res) {
  try {
    const userId = req.user && req.user.id
    if (!userId) return res.status(401).json({ error: 'Not authenticated' })
    const id = Number(req.params.id)
    if (!id) return res.status(400).json({ error: 'Invalid id' })

    const { data: presc, error: pErr } = await supabase.from('prescriptions').select('*').eq('id', id).limit(1).maybeSingle()
    if (pErr) return res.status(500).json({ error: pErr })
    if (!presc) return res.status(404).json({ error: 'Not found' })
    if (presc.user_id !== userId) return res.status(403).json({ error: 'Forbidden' })

    const { data: items, error: itemsErr } = await supabase.from('prescription_items').select('id, prescription_id, medicine_id, quantity, medicines(*)').eq('prescription_id', id)
    if (itemsErr) return res.status(500).json({ error: itemsErr })

    res.json({ ...presc, items: items || [] })
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }) }
}

module.exports = { list, create, remove, detail }
