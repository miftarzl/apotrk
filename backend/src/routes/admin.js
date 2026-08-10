const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const auth = require('../middleware/authMiddleware')

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

// Medicines CRUD
router.get('/medicines', async (req, res) => {
  const { data, error } = await supabase.from('medicines').select('*');
  if (error) return res.status(500).json({ error });
  res.json(data);
});

router.post('/medicines', async (req, res) => {
  const payload = req.body;
  const { data, error } = await supabase.from('medicines').insert([payload]).select();
  if (error) return res.status(500).json({ error });
  res.json(data[0]);
});

router.put('/medicines/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('medicines').update(req.body).eq('id', id).select();
  if (error) return res.status(500).json({ error });
  res.json(data[0]);
});

router.delete('/medicines/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('medicines').delete().eq('id', id);
  if (error) return res.status(500).json({ error });
  res.json({ ok: true });
});

// Categories CRUD
router.get('/categories', async (req, res) => {
  const { data, error } = await supabase.from('categories').select('*');
  if (error) return res.status(500).json({ error });
  res.json(data);
});

router.post('/categories', async (req, res) => {
  const payload = req.body;
  const { data, error } = await supabase.from('categories').insert([payload]).select();
  if (error) return res.status(500).json({ error });
  res.json(data[0]);
});

router.put('/categories/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('categories').update(req.body).eq('id', id).select();
  if (error) return res.status(500).json({ error });
  res.json(data[0]);
});

router.delete('/categories/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) return res.status(500).json({ error });
  res.json({ ok: true });
});

// Admins (profiles) management
router.get('/admins', async (req, res) => {
  const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: true });
  if (error) return res.status(500).json({ error });
  res.json(data || []);
});

router.post('/admins', async (req, res) => {
  const { email, password, confirmPassword } = req.body || {};

  if (!email || !String(email).trim()) return res.status(400).json({ error: 'Email wajib diisi.' });
  if (!password || String(password).length < 8) return res.status(400).json({ error: 'Password minimal 8 karakter.' });
  if (String(password) !== String(confirmPassword ?? password)) return res.status(400).json({ error: 'Konfirmasi password tidak sama.' });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const normalizedEmail = String(email).trim().toLowerCase();
  if (!emailRegex.test(normalizedEmail)) return res.status(400).json({ error: 'Format email tidak valid.' });

  try {
    const { data: existing, error: existErr } = await supabase.from('profiles').select('id').eq('email', normalizedEmail).limit(1).maybeSingle();
    if (existErr) return res.status(500).json({ error: 'Gagal menambahkan admin.' });
    if (existing) return res.status(409).json({ error: 'Email sudah digunakan.' });

    const password_hash = bcrypt.hashSync(String(password), 10);
    const { data, error } = await supabase.from('profiles').insert([{ email: normalizedEmail, password_hash, role: 'admin' }]).select('*').limit(1).maybeSingle();
    if (error) return res.status(500).json({ error: 'Gagal menambahkan admin.' });

    res.status(201).json(data || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal menambahkan admin.' });
  }
});

router.put('/admins/:id', async (req, res) => {
  const { id } = req.params;
  const update = {};
  if (req.body.email !== undefined) update.email = req.body.email;
  if (req.body.password_hash !== undefined) update.password_hash = req.body.password_hash;
  try {
    const { data, error } = await supabase.from('profiles').update(update).eq('id', id).select().limit(1).maybeSingle();
    if (error) return res.status(500).json({ error });
    res.json(data || null);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }) }
});

router.delete('/admins/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('profiles').delete().eq('id', id);
  if (error) return res.status(500).json({ error });
  res.json({ ok: true });
});

// Users management
router.get('/users', async (req, res) => {
  const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: true });
  if (error) return res.status(500).json({ error });
  res.json(data || []);
});

router.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  const update = {};
  if (req.body.username !== undefined) update.username = req.body.username;
  if (req.body.email !== undefined) update.email = req.body.email;
  if (req.body.password_hash !== undefined) update.password_hash = req.body.password_hash;
  if (req.body.phone !== undefined) update.phone = req.body.phone;
  if (req.body.address !== undefined) update.address = req.body.address;
  try {
    const { data, error } = await supabase.from('users').update(update).eq('id', id).select().limit(1).maybeSingle();
    if (error) return res.status(500).json({ error });
    res.json(data || null);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }) }
});

router.delete('/users/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('users').delete().eq('id', id);
  if (error) return res.status(500).json({ error });
  res.json({ ok: true });
});

// Delivery zones management
router.get('/delivery_zones', async (req, res) => {
  const { data, error } = await supabase.from('delivery_zones').select('*').order('village', { ascending: true });
  if (error) return res.status(500).json({ error });
  res.json(data || []);
});

router.post('/delivery_zones', async (req, res) => {

  const { village, shipping_cost } = req.body;
  if (!village) return res.status(400).json({ error: 'village required' });
  const parsedCost = Number(shipping_cost || 0);
  if (isNaN(parsedCost) || parsedCost < 0) return res.status(400).json({ error: 'shipping_cost must be a number >= 0' });

  // prevent duplicate village
  const { data: exists, error: existsErr } = await supabase.from('delivery_zones').select('*').eq('village', village).limit(1).maybeSingle();
  if (existsErr) return res.status(500).json({ error: existsErr });
  if (exists) return res.status(400).json({ error: 'Village already exists' });

  const { data, error } = await supabase.from('delivery_zones').insert([{ village, shipping_cost: parsedCost }]).select().limit(1).maybeSingle();
  if (error) return res.status(500).json({ error });
  res.json(data || null);
});

router.put('/delivery_zones/:id', async (req, res) => {
  const { id } = req.params;
  const update = {};
  if (req.body.village !== undefined) update.village = req.body.village;
  if (req.body.shipping_cost !== undefined) {
    const parsed = Number(req.body.shipping_cost);
    if (isNaN(parsed) || parsed < 0) return res.status(400).json({ error: 'shipping_cost must be a number >= 0' });
    update.shipping_cost = parsed;
  }

  // if changing village, ensure unique
  if (update.village) {
    const { data: exists, error: existsErr } = await supabase.from('delivery_zones').select('*').eq('village', update.village).neq('id', id).limit(1).maybeSingle();
    if (existsErr) return res.status(500).json({ error: existsErr });
    if (exists) return res.status(400).json({ error: 'Village already exists' });
  }

  const { data, error } = await supabase.from('delivery_zones').update(update).eq('id', id).select().limit(1).maybeSingle();
  if (error) return res.status(500).json({ error });
  res.json(data || null);
});

router.delete('/delivery_zones/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('delivery_zones').delete().eq('id', id);
  if (error) return res.status(500).json({ error });
  res.json({ ok: true });
});

// Prescriptions (admin)
router.get('/prescriptions', async (req, res) => {
  try {
    // list all prescriptions with basic user info
    const { data: prescriptions, error: pErr } = await supabase.from('prescriptions').select('*').order('created_at', { ascending: false });
    if (pErr) return res.status(500).json({ error: pErr });

    // load users for prescriptions
    const userIds = Array.from(new Set((prescriptions || []).map(p => p.user_id).filter(Boolean)));
    const { data: users } = await supabase.from('users').select('id, email, username, phone').in('id', userIds);
    const usersMap = {};
    (users || []).forEach(u => usersMap[u.id] = u);

    const enriched = (prescriptions || []).map(p => ({ ...p, user: usersMap[p.user_id] || null }));
    res.json(enriched);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }) }
});

router.get('/prescriptions/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (!id) return res.status(400).json({ error: 'Invalid id' })
    const { data: presc, error: pe } = await supabase.from('prescriptions').select('*').eq('id', id).single()
    if (pe) return res.status(500).json({ error: pe })
    if (!presc) return res.status(404).json({ error: 'Not found' })

    const { data: user } = await supabase.from('users').select('id, email, username, phone').eq('id', presc.user_id).single()
    const { data: items } = await supabase.from('prescription_items').select('id, prescription_id, medicine_id, quantity, created_at, medicines(*)').eq('prescription_id', id)

    res.json({ ...presc, user: user || null, items: items || [] })
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }) }
})

router.put('/prescriptions/:id/status', async (req, res) => {
  try {
    const id = Number(req.params.id)
    const { status, rejection_reason, admin_notes } = req.body || {}
    if (!id) return res.status(400).json({ error: 'Invalid id' })
    if (!status && admin_notes === undefined) return res.status(400).json({ error: 'status or admin_notes required' })

    // If marking as Siap Dibeli, ensure there are prescription items and insert into user's cart
    if (status === 'Siap Dibeli') {
      // fetch prescription
      const { data: presc, error: prescErr } = await supabase.from('prescriptions').select('*').eq('id', id).limit(1).maybeSingle()
      if (prescErr) return res.status(500).json({ error: prescErr })
      if (!presc) return res.status(404).json({ error: 'Prescription not found' })

      // fetch items
      const { data: items, error: itemsErr } = await supabase.from('prescription_items').select('*').eq('prescription_id', id)
      if (itemsErr) return res.status(500).json({ error: itemsErr })
      if (!items || items.length === 0) return res.status(400).json({ error: 'Belum ada obat yang dipilih' })

      const user_id = presc.user_id
      if (!user_id) return res.status(400).json({ error: 'Prescription has no user' })

      // For each item, insert or update cart
      for (const it of items) {
        const medicine_id = it.medicine_id
        const qtyToAdd = Number(it.quantity || 0)
        if (!medicine_id || qtyToAdd <= 0) continue

        const { data: exists, error: existErr } = await supabase.from('cart').select('*').eq('user_id', user_id).eq('medicine_id', medicine_id).limit(1).maybeSingle()
        if (existErr) return res.status(500).json({ error: existErr })
        if (exists) {
          const newQty = (exists.quantity || 0) + qtyToAdd
          // ensure we also record the prescription relation on cart items created/updated from a prescription
          const { error: upErr } = await supabase.from('cart').update({ quantity: newQty, prescriptions_id: id }).eq('id', exists.id)
          if (upErr) return res.status(500).json({ error: upErr })
        } else {
          const { error: insErr } = await supabase.from('cart').insert([{ user_id, medicine_id, quantity: qtyToAdd, prescriptions_id: id }])
          if (insErr) return res.status(500).json({ error: insErr })
        }
      }

      // finally update prescription status and optional admin notes
      const update = { status }
      if (admin_notes !== undefined) update.admin_notes = admin_notes

      const { data, error } = await supabase.from('prescriptions').update(update).eq('id', id).select().single()
      if (error) return res.status(500).json({ error })
      return res.json(data)
    }

    const update = {}
    if (status) update.status = status
    if (status === 'Ditolak') update.rejection_reason = rejection_reason || null
    if (admin_notes !== undefined) update.admin_notes = admin_notes

    if (Object.keys(update).length === 0) return res.status(400).json({ error: 'Nothing to update' })

    const { data, error } = await supabase.from('prescriptions').update(update).eq('id', id).select().single()
    if (error) return res.status(500).json({ error })
    res.json(data)
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }) }
})

// Admin: delete prescription and related records
router.delete('/prescriptions/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (!id) return res.status(400).json({ error: 'Invalid id' })

    // delete prescription_items
    const { error: itemsErr } = await supabase.from('prescription_items').delete().eq('prescription_id', id)
    if (itemsErr) return res.status(500).json({ error: itemsErr })

    // delete cart items that originate from this prescription
    const { error: cartErr } = await supabase.from('cart').delete().eq('prescriptions_id', id)
    if (cartErr) return res.status(500).json({ error: cartErr })

    // finally delete prescription itself
    const { data, error } = await supabase.from('prescriptions').delete().eq('id', id).select()
    if (error) return res.status(500).json({ error })
    res.json({ ok: true })
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }) }
})

router.get('/prescriptions/:id/items', async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (!id) return res.status(400).json({ error: 'Invalid id' })
    const { data, error } = await supabase.from('prescription_items').select('id, prescription_id, medicine_id, quantity, created_at, medicines(*)').eq('prescription_id', id)
    if (error) return res.status(500).json({ error })
    res.json(data || [])
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }) }
})

// Admin: Orders list
router.get('/orders', async (req, res) => {
  try {
    const { data: orders, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
    if (error) return res.status(500).json({ error })
    // enrich with user basic info
    const userIds = Array.from(new Set((orders||[]).map(o => o.user_id).filter(Boolean)))
    const { data: users } = await supabase.from('users').select('id, username, email').in('id', userIds)
    const usersMap = {}
    (users || []).forEach(u => usersMap[u.id] = u)
    const enriched = (orders||[]).map(o => ({ ...o, user: usersMap[o.user_id] || null }))
    res.json(enriched)
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }) }
})

// Admin: Reports (sales)
router.get('/reports', auth, async (req, res) => {
  try {
    // ensure requester is admin
    if (!req.user || req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' })

    const { start, end } = req.query || {}
    if (!start || !end) return res.status(400).json({ error: 'start and end query parameters required' })

    // parse dates and include full end day
    const s = new Date(String(start))
    const eRaw = new Date(String(end))
    if (isNaN(s.getTime()) || isNaN(eRaw.getTime())) return res.status(400).json({ error: 'Invalid date format' })
    const e = new Date(eRaw)
    e.setHours(23,59,59,999)

    const startISO = s.toISOString()
    const endISO = e.toISOString()

    // fetch orders that are final (Selesai) in range
    const { data: orders, error: ordersErr } = await supabase
      .from('orders')
      .select('*')
      .eq('order_status', 'Selesai')
      .gte('created_at', startISO)
      .lte('created_at', endISO)
      .order('created_at', { ascending: true })

    if (ordersErr) return res.status(500).json({ error: ordersErr })

    // fetch usernames for orders
    const userIds = Array.from(new Set((orders||[]).map(o => o.user_id).filter(Boolean)))
    const { data: users } = await supabase.from('users').select('id, username').in('id', userIds)
    const usersMap = {};
    (users || []).forEach(u => usersMap[u.id] = u);

    // compute summary
    const totalTransactions = (orders || []).length
    const totalRevenue = (orders || []).reduce((s, o) => s + Number(o.total_amount || 0), 0)
    const averageTransaction = totalTransactions > 0 ? (totalRevenue / totalTransactions) : 0

    const outOrders = (orders || []).map(o => ({
      id: o.id,
      order_code: o.order_code,
      created_at: o.created_at,
      user_id: o.user_id,
      username: usersMap[o.user_id] ? usersMap[o.user_id].username : null,
      total_amount: o.total_amount,
      order_status: o.order_status
    }))

    res.json({
      summary: {
        totalTransactions,
        totalRevenue,
        averageTransaction
      },
      orders: outOrders
    })
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }) }
})

// Admin: delete order and related records (payments, items)
router.delete('/orders/:id', auth, async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (!id) return res.status(400).json({ error: 'Invalid id' })

    // ensure requester is admin
    if (!req.user || req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' })

    // delete payment transactions first
    const { error: payErr } = await supabase.from('payment_transactions').delete().eq('order_id', id)
    if (payErr) return res.status(500).json({ error: payErr })

    // delete order items
    const { error: itemsErr } = await supabase.from('order_items').delete().eq('order_id', id)
    if (itemsErr) return res.status(500).json({ error: itemsErr })

    // finally delete order
    const { data, error } = await supabase.from('orders').delete().eq('id', id).select()
    if (error) return res.status(500).json({ error })

    res.json({ ok: true })
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }) }
})

// Admin: get specific order with items and user info
router.get('/orders/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (!id) return res.status(400).json({ error: 'Invalid id' })

    const { data: order, error: oErr } = await supabase.from('orders').select('*').eq('id', id).limit(1).maybeSingle()
    if (oErr) return res.status(500).json({ error: oErr })
    if (!order) return res.status(404).json({ error: 'Order not found' })

    const { data: user } = await supabase.from('users').select('id, username, email, phone, address').eq('id', order.user_id).limit(1).maybeSingle()
    const { data: items } = await supabase.from('order_items').select('*, medicines(*)').eq('order_id', id)

    res.json({ ...order, user: user || null, items: items || [] })
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }) }
})

// Admin: change order status (must follow sequence)
router.put('/orders/:id/status', async (req, res) => {
  try {
    const id = Number(req.params.id)
    const { status } = req.body || {}
    if (!id) return res.status(400).json({ error: 'Invalid id' })
    if (!status) return res.status(400).json({ error: 'status required' })

    const { data: order, error: gErr } = await supabase.from('orders').select('*').eq('id', id).limit(1).maybeSingle()
    if (gErr) return res.status(500).json({ error: gErr })
    if (!order) return res.status(404).json({ error: 'Order not found' })

    const seq = ['Menunggu Pembayaran','Lunas','Diproses','Dikirim','Selesai']
    const currentIndex = seq.indexOf(order.order_status || 'Menunggu Pembayaran')
    const desiredIndex = seq.indexOf(status)
    if (desiredIndex === -1) return res.status(400).json({ error: 'Invalid status' })
    if (desiredIndex !== currentIndex + 1) return res.status(400).json({ error: 'Cannot skip or revert status' })

    const { data: updated, error: uErr } = await supabase.from('orders').update({ order_status: status }).eq('id', id).select().limit(1).maybeSingle()
    if (uErr) return res.status(500).json({ error: uErr })
    res.json(updated)
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }) }
})

router.post('/prescriptions/:id/items', async (req, res) => {
  try {
    const id = Number(req.params.id)
    const { medicine_id, quantity } = req.body || {}
    if (!id) return res.status(400).json({ error: 'Invalid id' })
    if (!medicine_id) return res.status(400).json({ error: 'medicine_id required' })
    const qty = Number(quantity || 1)
    if (isNaN(qty) || qty <= 0) return res.status(400).json({ error: 'quantity must be positive' })

    const toInsert = { prescription_id: id, medicine_id, quantity: qty }
    const { data, error } = await supabase.from('prescription_items').insert([toInsert]).select()
    if (error) return res.status(500).json({ error })
    res.json(data[0])
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }) }
})

  // Update a prescription item (quantity)
  router.put('/prescriptions/items/:id', async (req, res) => {
    try {
      const id = Number(req.params.id)
      const { quantity } = req.body || {}
      if (!id) return res.status(400).json({ error: 'Invalid id' })
      const qty = Number(quantity || 0)
      if (isNaN(qty) || qty <= 0) return res.status(400).json({ error: 'quantity must be positive' })

      // fetch existing item
      const { data: existing, error: getErr } = await supabase.from('prescription_items').select('*').eq('id', id).limit(1).maybeSingle()
      if (getErr) return res.status(500).json({ error: getErr })
      if (!existing) return res.status(404).json({ error: 'Item not found' })

      // update prescription_items
      const { data: updated, error: updErr } = await supabase.from('prescription_items').update({ quantity: qty }).eq('id', id).select().limit(1).maybeSingle()
      if (updErr) return res.status(500).json({ error: updErr })

      // if prescription is already Siap Dibeli, sync cart quantity
      const prescId = existing.prescription_id
      const { data: presc } = await supabase.from('prescriptions').select('id, status, user_id').eq('id', prescId).limit(1).maybeSingle()
      if (presc && presc.status === 'Siap Dibeli') {
        // update cart row that matches this prescription and medicine
        const { error: cartErr } = await supabase.from('cart').update({ quantity: qty }).eq('prescriptions_id', prescId).eq('medicine_id', existing.medicine_id)
        if (cartErr) return res.status(500).json({ error: cartErr })
      }

      res.json(updated || existing)
    } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }) }
  })

  // Delete a prescription item and, if needed, remove it from cart when prescription was added to cart
  router.delete('/prescriptions/items/:id', async (req, res) => {
    try {
      const id = Number(req.params.id)
      if (!id) return res.status(400).json({ error: 'Invalid id' })

      // fetch existing item to know prescription and medicine
      const { data: existing, error: getErr } = await supabase.from('prescription_items').select('*').eq('id', id).limit(1).maybeSingle()
      if (getErr) return res.status(500).json({ error: getErr })
      if (!existing) return res.status(404).json({ error: 'Item not found' })

      // delete the prescription_item
      const { error: delErr } = await supabase.from('prescription_items').delete().eq('id', id)
      if (delErr) return res.status(500).json({ error: delErr })

      // if prescription was marked Siap Dibeli, also remove corresponding cart entry for this prescription and medicine
      const prescId = existing.prescription_id
      const { data: presc } = await supabase.from('prescriptions').select('id, status').eq('id', prescId).limit(1).maybeSingle()
      if (presc && presc.status === 'Siap Dibeli') {
        const { error: cartErr } = await supabase.from('cart').delete().eq('prescriptions_id', prescId).eq('medicine_id', existing.medicine_id)
        if (cartErr) return res.status(500).json({ error: cartErr })
      }

      res.json({ ok: true })
    } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }) }
  })

module.exports = router;
