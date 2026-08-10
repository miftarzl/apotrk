require('dotenv').config()
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const authRoutes = require('./routes/auth')
const adminRoutes = require('./routes/admin')
const medicinesRoutes = require('./routes/medicines')
const categoriesRoutes = require('./routes/categories')
const uploadRoutes = require('./routes/upload')
const statsRoutes = require('./routes/stats')
const userRoutes = require('./routes/user')
const prescriptionsRoutes = require('./routes/prescriptions')
const ordersRoutes = require('./routes/orders')
const paymentRoutes = require('./routes/payment')
const chatbotRoutes = require('./routes/chatbot')

const app = express()
app.use(express.json())
app.use(cookieParser())

const FRONTEND = process.env.FRONTEND_URL || 'http://localhost:3000'
app.use(cors({ origin: FRONTEND, credentials: true }))

app.use('/api/auth', authRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/medicines', medicinesRoutes)
app.use('/api/categories', categoriesRoutes)
app.use('/api/admin/upload', uploadRoutes)
app.use('/api/admin/stats', statsRoutes)
app.use('/api/user', userRoutes)
app.use('/api/prescriptions', prescriptionsRoutes)
app.use('/api/orders', ordersRoutes)
app.use('/api/payment', paymentRoutes)
app.use('/api/chatbot', chatbotRoutes)

// Debug: show Midtrans env status (masked)
const midKey = process.env.MIDTRANS_SERVER_KEY || ''
const midMasked = midKey ? `${midKey.slice(0,6)}...${midKey.slice(-4)}` : '(not set)'
const midIsProd = String(process.env.MIDTRANS_IS_PRODUCTION || '').toLowerCase() === 'true'
console.info('Midtrans env', { MIDTRANS_SERVER_KEY: midMasked, MIDTRANS_IS_PRODUCTION: midIsProd })

app.get('/health', (req, res) => res.json({ ok: true }))

const PORT = process.env.PORT || 4000
app.listen(PORT, () => console.log(`Backend listening on ${PORT}`))

