const express = require('express')
const router = express.Router()
const { createClient } = require('@supabase/supabase-js')
const jwt = require('jsonwebtoken')
const fetch = global.fetch || require('node-fetch')
const crypto = require('crypto')

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE
const SUPABASE_JWT = process.env.JWT_SECRET || process.env.NEXT_PUBLIC_JWT_SECRET || 'dev-secret'
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE)

// Create order (checkout) - creates orders and order_items but DOES NOT clear cart
router.post('/', async (req, res) => {
  try {
    const token = (req.cookies && (req.cookies.app_session || req.cookies.admin_session))
    let user_id = req.body.user_id
    if (!user_id && token) {
      const payload = jwt.verify(token, SUPABASE_JWT)
      user_id = payload.id
    }
    if (!user_id) return res.status(400).json({ error: 'user_id required' })

    // fetch cart items
    const { data: cartItems, error: cartErr } = await supabase.from('cart').select('*, medicines(*)').eq('user_id', user_id)
    if (cartErr) return res.status(500).json({ error: cartErr })
    if (!cartItems || cartItems.length === 0) return res.status(400).json({ error: 'Cart is empty' })

      // validate stock for each cart item
      for (const ci of (cartItems || [])) {
        const avail = ci.medicines && ci.medicines.stock !== undefined && ci.medicines.stock !== null ? Number(ci.medicines.stock) : 0
        const qty = Number(ci.quantity || 0)
        if (avail <= 0) return res.status(400).json({ error: `Obat sedang habis.` })
        if (qty > avail) return res.status(400).json({ error: `Stok tidak mencukupi.` })
      }

    // compute subtotal
    const subtotal = cartItems.reduce((s, it) => {
      const qty = Number(it.quantity || 0)
      const price = Number(it.medicines?.harga || 0)
      return s + (qty * price)
    }, 0)

    // get user address to determine shipping cost
    const { data: addr } = await supabase.from('user_addresses').select('*').eq('user_id', user_id).limit(1).maybeSingle()
    let shipping_cost = 0
    if (addr && addr.village) {
      const { data: zone } = await supabase.from('delivery_zones').select('*').eq('village', addr.village).limit(1).maybeSingle()
      shipping_cost = Number(zone?.shipping_cost || 0)
    }

    const total_amount = Number(subtotal) + Number(shipping_cost || 0)

    // generate order_code ORD-YYYYMMDD-XXXX
    const now = new Date()
    const y = now.getFullYear()
    const m = String(now.getMonth()+1).padStart(2,'0')
    const d = String(now.getDate()).padStart(2,'0')
    const rnd = String(Math.floor(1000 + Math.random() * 9000))
    const order_code = `ORD-${y}${m}${d}-${rnd}`

    // insert into orders
    const orderPayload = {
      order_code,
      user_id,
      subtotal: subtotal,
      shipping_cost: shipping_cost,
      total_amount: total_amount,
      payment_status: 'pending',
      order_status: 'Menunggu Pembayaran'
    }
    // copy address snapshot from user_addresses into orders (so order keeps permanent address)
    if (addr) {
      orderPayload.recipient_name = addr.recipient_name || null
      orderPayload.recipient_phone = addr.phone || null
      orderPayload.address_detail = addr.address_detail || null
      orderPayload.village = addr.village || null
      orderPayload.district = addr.district || null
      orderPayload.city = addr.city || null
      orderPayload.postal_code = addr.postal_code || null
      orderPayload.latitude = addr.latitude || null
      orderPayload.longitude = addr.longitude || null
    }

    const { data: orderData, error: orderErr } = await supabase.from('orders').insert([orderPayload]).select().limit(1).maybeSingle()
    if (orderErr) return res.status(500).json({ error: orderErr })
    const order = orderData

    // insert order_items
    const itemsToInsert = cartItems.map(ci => ({
      order_id: order.id,
      medicine_id: ci.medicine_id,
      quantity: Number(ci.quantity || 0),
      price: Number(ci.medicines?.harga || 0),
      subtotal: Number(ci.quantity || 0) * Number(ci.medicines?.harga || 0)
    }))

    const { data: oiData, error: oiErr } = await supabase.from('order_items').insert(itemsToInsert).select()
    if (oiErr) return res.status(500).json({ error: oiErr })

    res.json({ ok: true, order })
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }) }
})

// List orders for current user (or all if admin via query admin=1)
router.get('/', async (req, res) => {
  try {
    const token = (req.cookies && (req.cookies.app_session || req.cookies.admin_session))
    let user_id = req.query.user_id
    if (!user_id && token) {
      try { const payload = jwt.verify(token, SUPABASE_JWT); user_id = payload.id } catch(e){}
    }
    const isAdmin = req.query.admin === '1'
    if (isAdmin) {
      // return all orders with user info and items (including medicine brief)
      const { data: orders, error: ordErr } = await supabase.from('orders').select('*').order('created_at', { ascending: true })
      if (ordErr) return res.status(500).json({ error: ordErr })

      const orderIds = (orders||[]).map(o=>o.id).filter(Boolean)
      // fetch items for these orders with medicines relation
      const { data: items } = await supabase.from('order_items').select('id, order_id, medicine_id, quantity, price, subtotal, medicines(id, nama_obat, foto_url)').in('order_id', orderIds)

      // fetch users for orders
      const userIds = Array.from(new Set((orders||[]).map(o => o.user_id).filter(Boolean)))
      const { data: users } = userIds.length ? await supabase.from('users').select('id, username, email, phone').in('id', userIds) : { data: [] }
      const usersMap = {}
      ;(users || []).forEach(u => usersMap[u.id] = u)

      // attach items and user to each order
      const enriched = (orders||[]).map(o=>{
        const its = (items||[]).filter(i=>i.order_id===o.id).map(it=>{
          const mapped = { ...it }
          if (mapped.medicines) {
            mapped.medicine = { nama_obat: mapped.medicines.nama_obat, foto_url: mapped.medicines.foto_url, id: mapped.medicines.id }
          } else mapped.medicine = null
          delete mapped.medicines
          return mapped
        })
        return { ...o, items: its, user: usersMap[o.user_id] || null }
      })
      return res.json(enriched)
    }
    if (!user_id) return res.status(400).json({ error: 'user_id required' })
    const { data: orders } = await supabase.from('orders').select('*').eq('user_id', user_id).order('created_at', { ascending: false })
    const orderIds = (orders||[]).map(o=>o.id)
    const { data: items } = await supabase.from('order_items').select('*, medicines(*)').in('order_id', orderIds)
    const enriched = (orders||[]).map(o=>({ ...o, items: (items||[]).filter(i=>i.order_id===o.id) }))
    res.json(enriched)
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }) }
})

const MidtransClient = require('midtrans-client')

// Pay endpoint - generate Midtrans Snap token
router.post('/pay', async (req, res) => {
  try {
    const { order_id } = req.body
    console.info('Pay request received', { order_id, body: req.body })
    if (!order_id) return res.status(400).json({ error: 'order_id required' })

    const token = (req.cookies && (req.cookies.app_session || req.cookies.admin_session))
    let user_id = req.body.user_id
    if (!user_id && token) {
      const payload = jwt.verify(token, SUPABASE_JWT)
      user_id = payload.id
    }
    if (!user_id) return res.status(400).json({ error: 'user_id required' })

    // fetch order
    const { data: order } = await supabase.from('orders').select('*').eq('id', order_id).limit(1).maybeSingle()
    if (!order) return res.status(404).json({ error: 'Order not found' })
    if (String(order.user_id) !== String(user_id)) return res.status(403).json({ error: 'Not your order' })
    if (order.payment_status === 'paid') return res.status(200).json({ ok: true, alreadyPaid: true, paid: true, message: 'Order already paid' })

    if (order.payment_status === 'pending' && order.snap_token) {
      return res.status(200).json({
        ok: true,
        token: order.snap_token,
        redirect_url: order.snap_redirect_url || null,
        reused: true
      })
    }

    // fetch items
    const { data: items } = await supabase.from('order_items').select('*, medicines(*)').eq('order_id', order_id)

    const serverKey = process.env.MIDTRANS_SERVER_KEY || ''
    const clientKey = process.env.MIDTRANS_CLIENT_KEY || ''
    const isProduction = String(process.env.MIDTRANS_IS_PRODUCTION || '').toLowerCase() === 'true'
    // debug logs (mask server key)
    const maskedKey = serverKey ? `${serverKey.slice(0,6)}...${serverKey.slice(-4)}` : '(not set)'
    const midUrl = isProduction ? 'https://app.midtrans.com/snap/v1/transactions' : 'https://app.sandbox.midtrans.com/snap/v1/transactions'
    console.info('Midtrans config', { MIDTRANS_SERVER_KEY: maskedKey, MIDTRANS_IS_PRODUCTION: isProduction, MIDTRANS_URL: midUrl })

    if (!serverKey) {
      console.error('MIDTRANS server key not configured')
      return res.status(500).json({ error: 'Payment provider not configured' })
    }

    // validate amount
    if (!order.total_amount || Number(order.total_amount) <= 0) {
      console.error('Invalid total_amount for order', { order_id, total: order.total_amount })
      return res.status(400).json({ error: 'Invalid order amount' })
    }
    // prepare payload
    const payload = {
      transaction_details: {
        order_id: order.order_code,
        gross_amount: Number(order.total_amount || 0)
      },
      item_details: (items||[]).map(it=>({ id: String(it.medicine_id), price: Number(it.price||0), quantity: Number(it.quantity||0), name: it.medicines?.nama_obat || 'Produk' })),
      customer_details: {}
    }

    // If configured, explicitly set notification_url so Midtrans sends callbacks
    // to our backend. Prefer explicit MIDTRANS_NOTIFICATION_URL, otherwise derive
    // from BACKEND_URL if provided.
    const notificationBase = process.env.MIDTRANS_NOTIFICATION_URL || process.env.BACKEND_URL || null
    const isLocalhostNotification = notificationBase && /localhost|127\.0\.0\.1/.test(String(notificationBase))
    if (notificationBase) {
      const base = String(notificationBase).replace(/\/$/, '')
      payload.notification_url = `${base}/api/payment/webhook`
      console.info('Midtrans notification_url set in payload', { notification_url: payload.notification_url })
      if (isLocalhostNotification) {
        console.warn('Project masih localhost. Webhook Midtrans baru akan berjalan setelah backend memiliki URL publik.')
      }
    } else {
      console.warn('Midtrans notification_url tidak dikonfigurasi. Project masih localhost. Webhook Midtrans baru akan berjalan setelah backend memiliki URL publik.')
    }

    // populate customer details from users table if available
    try {
      const { data: u } = await supabase.from('users').select('id,username,email,phone').eq('id', order.user_id).limit(1).maybeSingle()
      if (u) {
        payload.customer_details = { first_name: u.username || undefined, email: u.email || undefined, phone: u.phone || undefined }
      }
    } catch(e){ console.warn('Failed to fetch user for customer_details', e) }

    console.debug('Midtrans request body', payload)

    // If a previous Midtrans transaction has been initialized for this order and
    // a reusable Snap token already exists, avoid creating a new one.
    if (order.midtrans_order_id && order.snap_token) {
      try {
        const core = new MidtransClient.CoreApi({ isProduction: isProduction, serverKey: serverKey })
        const statusResp = await core.transaction.status(order.order_code)
        const txStatus = String(statusResp && statusResp.transaction_status ? statusResp.transaction_status : '').toLowerCase()

        if (txStatus === 'settlement' || txStatus === 'capture') {
          await supabase.from('orders').update({ payment_status: 'paid', order_status: 'Lunas' }).eq('id', order_id)
          return res.status(200).json({ ok: true, paid: true })
        }

        if (txStatus === 'pending') {
          return res.status(200).json({
            ok: true,
            pending: true,
            transaction_status: txStatus,
            message: 'Pembayaran masih menunggu penyelesaian.'
          })
        }

        if (txStatus === 'expire' || txStatus === 'cancel' || txStatus === 'deny') {
          await supabase.from('orders').update({ midtrans_order_id: null }).eq('id', order_id)
          return res.status(200).json({
            ok: false,
            expired: txStatus === 'expire',
            cancelled: txStatus === 'cancel',
            denied: txStatus === 'deny',
            transaction_status: txStatus,
            message: 'Transaksi pembayaran telah berakhir atau dibatalkan.'
          })
        }

        return res.status(200).json({
          ok: true,
          pending: true,
          transaction_status: txStatus || 'unknown',
          message: 'Pembayaran masih menunggu penyelesaian.'
        })
      } catch (e) {
        console.warn('Failed to fetch existing Midtrans status', e)
        return res.status(200).json({ ok: false, error: 'Pembayaran sudah dimulai, tetapi status transaksi tidak bisa diperbarui saat ini.' })
      }
    }

    try {
      const snap = new MidtransClient.Snap({ isProduction: isProduction, serverKey: serverKey, clientKey: clientKey })
      const transaction = await snap.createTransaction(payload)
      console.debug('Midtrans response', transaction)

      // save midtrans_order_id using the order_code (do NOT store transaction_id here)
      console.info('Midtrans transaction created', { token: transaction.token ? 'present' : 'missing', redirect_url: transaction.redirect_url })
      try {
        await supabase.from('orders').update({
          midtrans_order_id: order.order_code,
          snap_token: transaction.token || null,
          snap_redirect_url: transaction.redirect_url || null
        }).eq('id', order_id)
      } catch (uErr) {
        console.error('Failed to update orders payment reference fields', uErr)
      }

      // Insert payment_transactions immediately so we keep the transaction_id record
      try {
        const txId = transaction.transaction_id || null
        if (txId) {
          await supabase.from('payment_transactions').insert([{
            order_id: order.id,
            transaction_id: txId,
            payment_type: null,
            transaction_status: 'pending',
            gross_amount: Number(order.total_amount || 0)
          }])
        }
      } catch (txErr) {
        console.error('Failed to insert payment_transactions at creation', txErr)
      }

      if (!transaction || !transaction.token) {
        console.error('Midtrans did not return snap token', { respBody: transaction })
        return res.status(502).json({ error: 'Tidak mendapatkan token pembayaran', details: transaction })
      }

      return res.json({ token: transaction.token, redirect_url: transaction.redirect_url || null, reused: false })
    } catch (err) {
      // midtrans-client throws; try to extract useful info
      console.error('Midtrans snap error', err && err.message ? err.message : err, { err })
      // if err.ApiResponse exists, include it
      const details = err && err.ApiResponse ? err.ApiResponse : (err && err.error_messages ? { error_messages: err.error_messages } : { message: String(err) })
      return res.status(502).json({ error: 'Payment gateway error', details })
    }
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }) }
})


// Allow user to cancel their own order when still pending
router.post('/:id/cancel', async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (!id) return res.status(400).json({ error: 'Invalid id' })

    const token = (req.cookies && (req.cookies.app_session || req.cookies.admin_session))
    let user_id = req.body.user_id
    if (!user_id && token) {
      const payload = jwt.verify(token, SUPABASE_JWT)
      user_id = payload.id
    }
    if (!user_id) return res.status(400).json({ error: 'user_id required' })

    const { data: order } = await supabase.from('orders').select('*').eq('id', id).limit(1).maybeSingle()
    if (!order) return res.status(404).json({ error: 'Order not found' })
    if (String(order.user_id) !== String(user_id)) return res.status(403).json({ error: 'Not your order' })
    if (order.order_status !== 'Menunggu Pembayaran') return res.status(400).json({ error: 'Cannot cancel this order' })

    const { data: updated, error } = await supabase.from('orders').update({ order_status: 'Dibatalkan', payment_status: 'failed' }).eq('id', id).select().limit(1).maybeSingle()
    if (error) return res.status(500).json({ error })
    res.json(updated)
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }) }
})

// Update order status endpoint (simple update, used by admin UI)
router.put('/:id/status', async (req, res) => {
  try {
    const id = Number(req.params.id)
    const { order_status } = req.body || {}
    if (!id) return res.status(400).json({ error: 'Invalid id' })
    if (!order_status) return res.status(400).json({ error: 'order_status required' })

    const { data: updated, error } = await supabase.from('orders').update({ order_status }).eq('id', id).select().limit(1).maybeSingle()
    if (error) return res.status(500).json({ error })
    res.json(updated)
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }) }
})

module.exports = router
