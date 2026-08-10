//FILE KONFIGURASI MIDTRANS //
const serverKey = process.env.MIDTRANS_SERVER_KEY || ''
const clientKey = process.env.MIDTRANS_CLIENT_KEY || ''
const isProduction = String(process.env.MIDTRANS_IS_PRODUCTION || '').toLowerCase() === 'true'

const snap = new MidtransClient.Snap({
  isProduction: isProduction,
  serverKey: serverKey,
  clientKey: clientKey
})
const transaction = await snap.createTransaction(payload)
console.debug('Midtrans response', transaction)

// FILE PEMBUATAN TRANSAKSI MIDTRANS //
const payload = {
  transaction_details: {
    order_id: order.order_code,
    gross_amount: Number(order.total_amount || 0)
  },
  item_details: (items||[]).map(it => ({
    id: String(it.medicine_id),
    price: Number(it.price||0),
    quantity: Number(it.quantity||0),
    name: it.medicines?.nama_obat || 'Produk'
  })),
  customer_details: {}
}

const snap = new MidtransClient.Snap({
  isProduction: isProduction,
  serverKey: serverKey,
  clientKey: clientKey
})
const transaction = await snap.createTransaction(payload)

//FILE CALLBACK/WEBHOOK/VERIFIKASI PEMBAYARAN MIDTRANS //
router.post('/webhook', express.json({ type: '*/*' }), async (req, res) => {
  const headerSig = String(req.headers['x-callback-signature'] || req.headers['x-midtrans-signature'] || '')
  const signature = String(body.signature_key || headerSig || '')
  const orderId = String(body.order_id || '')
  const statusCode = String(body.status_code || '')
  const grossAmount = String(body.gross_amount || '')
  const toSign = `${orderId}${statusCode}${grossAmount}${MIDTRANS_SERVER_KEY}`
  const computed = crypto.createHash('sha512').update(toSign).digest('hex')

  if (!signature || computed !== signature) {
    return res.status(400).json({ error: 'Signature invalid' })
  }
})

// FILE PEMBARUAN STATUS PEMBAYARAN KE DATABASE //
const { error: updateError } = await supabase.from('orders').update(upd).eq('id', order.id)

const { data: existingTx } = await supabase
  .from('payment_transactions')
  .select('*')
  .eq('transaction_id', transactionId)
  .limit(1)
  .maybeSingle()

if (!existingTx) {
  const { error: insertError } = await supabase.from('payment_transactions').insert([{
    order_id: order.id,
    transaction_id: transactionId,
    payment_type: paymentType,
    transaction_status: txStatus,
    gross_amount: gross
  }])
}

