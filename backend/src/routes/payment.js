const express = require('express')
const router = express.Router()
const { createClient } = require('@supabase/supabase-js')
const crypto = require('crypto')

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE
const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || ''
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE)

router.post('/webhook', express.json({ type: '*/*' }), async (req, res) => {
  try {
    const body = req.body || {}
    console.info('Webhook received', {
      order_id: body.order_id,
      transaction_status: body.transaction_status,
      transaction_id: body.transaction_id,
      payment_type: body.payment_type
    })

    const isProduction = String(process.env.MIDTRANS_IS_PRODUCTION || '').toLowerCase() === 'true'
    const masked = (process.env.MIDTRANS_SERVER_KEY || '') ? `${process.env.MIDTRANS_SERVER_KEY.slice(0,6)}...${process.env.MIDTRANS_SERVER_KEY.slice(-4)}` : '(not set)'
    console.info('Midtrans webhook env', { MIDTRANS_SERVER_KEY: masked, MIDTRANS_IS_PRODUCTION: isProduction })

    const headerSig = String(req.headers['x-callback-signature'] || req.headers['x-midtrans-signature'] || '')
    const signature = String(body.signature_key || headerSig || '')
    const orderId = String(body.order_id || '')
    const statusCode = String(body.status_code || '')
    const grossAmount = String(body.gross_amount || '')
    const toSign = `${orderId}${statusCode}${grossAmount}${MIDTRANS_SERVER_KEY}`
    const computed = crypto.createHash('sha512').update(toSign).digest('hex')

    if (!signature || computed !== signature) {
      console.warn('Signature invalid', { orderId, statusCode, grossAmount, computed, signature, headerSig })
      return res.status(400).json({ error: 'Signature invalid' })
    }

    const txStatus = String(body.transaction_status || '')
    const paymentType = body.payment_type || null
    const transactionId = String(body.transaction_id || '') || null
    const gross = Number(body.gross_amount || 0)
    const orderCode = orderId || null

    let order = null
    if (orderCode) {
      const { data, error } = await supabase.from('orders').select('*').eq('order_code', orderCode).limit(1).maybeSingle()
      if (error) {
        console.error('Order lookup failed by order_code', { orderCode, error })
      } else {
        order = data
      }
    }

    if (!order && transactionId) {
      const { data, error } = await supabase.from('orders').select('*').eq('midtrans_order_id', transactionId).limit(1).maybeSingle()
      if (error) {
        console.error('Order lookup failed by midtrans_order_id', { transactionId, error })
      } else {
        order = data
      }
    }

    if (!order) {
      console.warn('Order tidak ditemukan', { orderCode, transactionId })
      return res.status(404).json({ error: 'Order not found' })
    }

    console.info('Order ditemukan', { order_id: order.id, order_code: order.order_code, transactionId })

    let payment_status = 'pending'
    let order_status = null
    if (txStatus === 'settlement' || txStatus === 'capture') {
      payment_status = 'paid'
      order_status = 'Lunas'
    } else if (txStatus === 'pending') {
      payment_status = 'pending'
      order_status = 'Menunggu Pembayaran'
    } else if (txStatus === 'expire') {
      payment_status = 'expired'
      order_status = 'Dibatalkan'
    } else if (txStatus === 'cancel' || txStatus === 'deny') {
      payment_status = 'failed'
      order_status = 'Dibatalkan'
    }

    const upd = {}
    if (payment_status) upd.payment_status = payment_status
    if (order_status) upd.order_status = order_status
    // Do NOT write Midtrans transaction_id into orders.midtrans_order_id.
    // orders.midtrans_order_id must remain as the original order_code (set at Snap creation).

    const { error: updateError } = await supabase.from('orders').update(upd).eq('id', order.id)
    if (updateError) {
      console.error('Update orders gagal', { order_id: order.id, error: updateError })
    } else {
      console.info('Update orders berhasil', { order_id: order.id, payment_status, order_status })
    }

    if (transactionId) {
      const { data: existingTx, error: lookupError } = await supabase.from('payment_transactions').select('*').eq('transaction_id', transactionId).limit(1).maybeSingle()
      if (lookupError) {
        console.error('Payment transaction lookup failed', { transactionId, error: lookupError })
      } else if (!existingTx) {
        console.info('Inserting payment_transactions', { order_id: order.id, transactionId, txStatus, gross })
        const { error: insertError } = await supabase.from('payment_transactions').insert([{
          order_id: order.id,
          transaction_id: transactionId,
          payment_type: paymentType,
          transaction_status: txStatus,
          gross_amount: gross
        }])
        if (insertError) {
          console.error('Insert payment_transactions gagal', { order_id: order.id, transactionId, error: insertError })
        } else {
          console.info('Insert payment_transactions berhasil', { order_id: order.id, transactionId })
        }

        try {
          const { data: items } = await supabase.from('order_items').select('*').eq('order_id', order.id)
          for (const it of (items || [])) {
            const medId = it.medicine_id
            const qty = Number(it.quantity || 0)
            if (!medId || qty <= 0) continue
            const { data: med } = await supabase.from('medicines').select('id, stock').eq('id', medId).limit(1).maybeSingle()
            const current = med && med.stock !== undefined && med.stock !== null ? Number(med.stock) : 0
            const newStock = Math.max(0, current - qty)
            const { error: stockError } = await supabase.from('medicines').update({ stock: newStock }).eq('id', medId)
            if (stockError) {
              console.error('Failed to reduce stock after payment', { medId, qty, current, error: stockError })
            } else {
              console.info('Reduced stock for medicine', { medId, from: current, by: qty, to: newStock })
            }
          }
        } catch (e) {
          console.error('Failed to reduce stock after payment', e)
        }
      } else {
        console.info('Payment transaction exists, skipping insert', { transactionId })
      }
    }

    if (payment_status === 'paid') {
      console.info('Payment succeeded, clearing cart items for order', { order_id: order.id, user_id: order.user_id })
      const { data: items, error: itemsError } = await supabase.from('order_items').select('*').eq('order_id', order.id)
      if (itemsError) {
        console.error('Cart cleanup lookup failed', { order_id: order.id, error: itemsError })
      } else {
        const medicineIds = (items||[]).map(i => i.medicine_id).filter(Boolean)
        if (medicineIds.length > 0) {
          const { error: deleteError } = await supabase.from('cart').delete().eq('user_id', order.user_id).in('medicine_id', medicineIds)
          if (deleteError) {
            console.error('Cart gagal dibersihkan', { user_id: order.user_id, medicineIds, error: deleteError })
          } else {
            console.info('Cart berhasil dibersihkan', { user_id: order.user_id, medicineIds })
          }
        } else {
          console.info('Tidak ada item cart yang perlu dibersihkan', { order_id: order.id })
        }
      }
    }

    return res.json({ ok: true })
  } catch (err) {
    console.error('Webhook processing failed', err)
    return res.status(500).json({ error: 'Webhook processing failed' })
  }
})

module.exports = router
