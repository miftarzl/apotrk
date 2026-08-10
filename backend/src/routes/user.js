const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken')

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE;
const SUPABASE_JWT = process.env.JWT_SECRET || process.env.NEXT_PUBLIC_JWT_SECRET || 'dev-secret'
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

// Favorites CRUD
router.get('/favorites', async (req, res) => {
  const user_id = req.query.user_id;
  if (!user_id) return res.status(400).json({ error: 'user_id required' });
  const { data, error } = await supabase.from('favorites').select('*, medicines(*)').eq('user_id', user_id).order('created_at', { ascending: false });
  if (error) { console.error('Supabase error (favorites):', error); return res.status(500).json({ error: error?.message || JSON.stringify(error) }); }
  res.json(data);
});

router.post('/favorites', async (req, res) => {
  const { user_id, medicine_id } = req.body;
  if (!user_id || !medicine_id) return res.status(400).json({ error: 'user_id and medicine_id required' });
  const { data, error } = await supabase.from('favorites').insert([{ user_id, medicine_id }]).select();
  if (error) { console.error('Supabase error (insert favorite):', error); return res.status(500).json({ error: error?.message || JSON.stringify(error) }); }
  res.json(data[0]);
});

router.delete('/favorites/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('favorites').delete().eq('id', id);
  if (error) { console.error('Supabase error (delete favorite):', error); return res.status(500).json({ error: error?.message || JSON.stringify(error) }); }
  res.json({ ok: true });
});


// Cart endpoints
router.get('/cart', async (req, res) => {
  try {
    // try to get user from cookie token
    const token = (req.cookies && (req.cookies.app_session || req.cookies.admin_session))
    let user_id = req.query.user_id
    if (!user_id && token) {
      const payload = jwt.verify(token, SUPABASE_JWT)
      user_id = payload.id
    }
    if (!user_id) return res.status(400).json({ error: 'user_id required' })
    const { data, error } = await supabase.from('cart').select('*, medicines(*)').eq('user_id', user_id).order('created_at', { ascending: false })
    if (error) { console.error('Supabase error (get cart):', error); return res.status(500).json({ error: error?.message || JSON.stringify(error) }) }
    res.json(data)
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }) }
})

router.post('/cart', async (req, res) => {
  try {
    const token = (req.cookies && (req.cookies.app_session || req.cookies.admin_session))
    let user_id = req.body.user_id
    if (!user_id && token) {
      const payload = jwt.verify(token, SUPABASE_JWT)
      user_id = payload.id
    }
    const { medicine_id } = req.body
    console.log('BODY:', req.body)
    console.log('USER_ID:', user_id)
    console.log('MEDICINE_ID:', medicine_id)
    console.log('SUPABASE_URL =', SUPABASE_URL)
    if (!user_id || !medicine_id) return res.status(400).json({ error: 'user_id and medicine_id required' })

    // check existing (include medicines relation to inspect stock)
    const { data: exists, error: existsErr } = await supabase.from('cart').select('*, medicines(*)').eq('user_id', user_id).eq('medicine_id', medicine_id).limit(1).maybeSingle()
    if (existsErr) { console.error('Supabase error (check existing cart):', existsErr); return res.status(500).json({ error: existsErr?.message || JSON.stringify(existsErr) }) }
    if (exists) {
      // validate stock
      const currentStock = exists.medicines?.stock !== undefined && exists.medicines?.stock !== null ? Number(exists.medicines.stock) : 0
      if (currentStock <= 0) return res.status(400).json({ error: 'Obat sedang habis.' })
      if ((exists.quantity || 0) + 1 > currentStock) return res.status(400).json({ error: 'Stok tidak mencukupi.' })

      const { data, error } = await supabase.from('cart').update({ quantity: exists.quantity + 1 }).eq('id', exists.id).select('*, medicines(*)').limit(1).single()
      if (error) { console.error('Supabase error (update cart quantity):', error); return res.status(500).json({ error: error?.message || JSON.stringify(error) }) }
      return res.json(data)
    }
    // check medicine stock before inserting
    const { data: med } = await supabase.from('medicines').select('*').eq('id', medicine_id).limit(1).maybeSingle()
    const medStock = med && med.stock !== undefined && med.stock !== null ? Number(med.stock) : 0
    if (medStock <= 0) return res.status(400).json({ error: 'Obat sedang habis.' })

    const { data, error } = await supabase.from('cart').insert([{ user_id, medicine_id, quantity: 1 }]).select('*, medicines(*)')
    if (error) { console.error('Supabase error (insert cart):', error); return res.status(500).json({ error: error?.message || JSON.stringify(error) }) }
    res.json(data[0])
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }) }
})

router.put('/cart/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { qty } = req.body
    if (typeof qty !== 'number') return res.status(400).json({ error: 'qty required' })
    if (qty <= 0) {
      const { error } = await supabase.from('cart').delete().eq('id', id)
      if (error) { console.error('Supabase error (delete cart):', error); return res.status(500).json({ error: error?.message || JSON.stringify(error) }) }
      return res.json({ ok: true })
    }
    // fetch cart row with medicine to validate stock
    const { data: row, error: rowErr } = await supabase.from('cart').select('*, medicines(*)').eq('id', id).limit(1).maybeSingle()
    if (rowErr) { console.error('Supabase error (fetch cart row):', rowErr); return res.status(500).json({ error: rowErr?.message || JSON.stringify(rowErr) }) }
    if (!row) return res.status(404).json({ error: 'Cart item not found' })
    const available = row.medicines && row.medicines.stock !== undefined && row.medicines.stock !== null ? Number(row.medicines.stock) : 0
    if (available <= 0) return res.status(400).json({ error: 'Obat sedang habis.' })
    if (qty > available) return res.status(400).json({ error: 'Stok tidak mencukupi.' })

    const { data, error } = await supabase.from('cart').update({ quantity: qty }).eq('id', id).select('*, medicines(*)').limit(1).single()
    if (error) { console.error('Supabase error (update cart qty):', error); return res.status(500).json({ error: error?.message || JSON.stringify(error) }) }
    res.json(data)
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }) }
})

router.delete('/cart/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { error } = await supabase.from('cart').delete().eq('id', id)
    if (error) { console.error('Supabase error (delete cart):', error); return res.status(500).json({ error: error?.message || JSON.stringify(error) }) }
    res.json({ ok: true })
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }) }
})

// User address endpoints
router.get('/address', async (req, res) => {
  try {
    const token = (req.cookies && (req.cookies.app_session || req.cookies.admin_session))
    let user_id = req.query.user_id
    if (!user_id && token) {
      const payload = jwt.verify(token, SUPABASE_JWT)
      user_id = payload.id
    }
    if (!user_id) return res.status(400).json({ error: 'user_id required' })
    const { data, error } = await supabase.from('user_addresses').select('*').eq('user_id', user_id).limit(1).maybeSingle()
    if (error) { console.error('Supabase error (get address):', error); return res.status(500).json({ error: error?.message || JSON.stringify(error) }) }
    res.json(data)
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }) }
})

router.post('/address', async (req, res) => {
  try {
    const token = (req.cookies && (req.cookies.app_session || req.cookies.admin_session))
    let user_id = req.body.user_id
    if (!user_id && token) {
      const payload = jwt.verify(token, SUPABASE_JWT)
      user_id = payload.id
    }
    if (!user_id) return res.status(400).json({ error: 'user_id required' })

    const {
      recipient_name, phone, address_detail, village, district, city, postal_code, latitude, longitude
    } = req.body

    const payload = {
      user_id,
      recipient_name: recipient_name || null,
      phone: phone || null,
      address_detail: address_detail || null,
      village: village || null,
      district: district || null,
      city: city || null,
      postal_code: postal_code || null,
      latitude: latitude || null,
      longitude: longitude || null
    }

    // ensure no existing address for user (user_id unique)
    const { data: exists, error: existsErr } = await supabase.from('user_addresses').select('*').eq('user_id', user_id).limit(1).maybeSingle()
    if (existsErr) { console.error('Supabase error (check address):', existsErr); return res.status(500).json({ error: existsErr?.message || JSON.stringify(existsErr) }) }
    if (exists) return res.status(400).json({ error: 'Address already exists. Use PUT to update.' })

    const { data, error } = await supabase.from('user_addresses').insert([payload]).select().limit(1).maybeSingle()
    if (error) { console.error('Supabase error (insert address):', error); return res.status(500).json({ error: error?.message || JSON.stringify(error) }) }
    res.json(data)
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }) }
})

router.put('/address', async (req, res) => {
  try {
    const token = (req.cookies && (req.cookies.app_session || req.cookies.admin_session))
    let user_id = req.body.user_id
    if (!user_id && token) {
      const payload = jwt.verify(token, SUPABASE_JWT)
      user_id = payload.id
    }
    if (!user_id) return res.status(400).json({ error: 'user_id required' })

    const {
      recipient_name, phone, address_detail, village, district, city, postal_code, latitude, longitude
    } = req.body

    const update = {}
    if (recipient_name !== undefined) update.recipient_name = recipient_name
    if (phone !== undefined) update.phone = phone
    if (address_detail !== undefined) update.address_detail = address_detail
    if (village !== undefined) update.village = village
    if (district !== undefined) update.district = district
    if (city !== undefined) update.city = city
    if (postal_code !== undefined) update.postal_code = postal_code
    if (latitude !== undefined) update.latitude = latitude
    if (longitude !== undefined) update.longitude = longitude

    const { data, error } = await supabase.from('user_addresses').update(update).eq('user_id', user_id).select().limit(1).maybeSingle()
    if (error) { console.error('Supabase error (update address):', error); return res.status(500).json({ error: error?.message || JSON.stringify(error) }) }
    res.json(data)
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }) }
})

// Delivery zones list
router.get('/delivery_zones', async (req, res) => {
  try {
    const { data, error } = await supabase.from('delivery_zones').select('*').order('village', { ascending: true })
    if (error) { console.error('Supabase error (delivery_zones):', error); return res.status(500).json({ error: error?.message || JSON.stringify(error) }) }
    res.json(data || [])
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }) }
})
module.exports = router;