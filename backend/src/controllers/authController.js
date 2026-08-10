const supabase = require('../config/supabase')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXT_PUBLIC_JWT_SECRET || 'dev-secret'

async function login(req, res) {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' })

    // Try admin (profiles) first
    let { data: adminData, error: adminErr } = await supabase.from('profiles').select('*').eq('email', email).limit(1).single()
    if (!adminErr && adminData) {
      const ok = bcrypt.compareSync(password, adminData.password_hash)
      if (!ok) return res.status(401).json({ error: 'Invalid credentials' })
      const token = jwt.sign({ id: adminData.id, email: adminData.email, role: adminData.role || 'admin' }, JWT_SECRET, { expiresIn: '7d' })
      // preserve existing admin_session cookie for compatibility, also set unified app_session
      res.cookie('admin_session', token, { httpOnly: true, maxAge: 7*24*3600*1000, path: '/', sameSite: 'lax' })
      res.cookie('app_session', token, { httpOnly: true, maxAge: 7*24*3600*1000, path: '/', sameSite: 'lax' })
      return res.json({ ok: true, user: { id: adminData.id, email: adminData.email, role: adminData.role || 'admin' } })
    }

    // Fallback to users table (regular users)
    const { data: userData, error: userErr } = await supabase.from('users').select('*').eq('email', email).limit(1).single()
    if (userErr || !userData) return res.status(401).json({ error: 'Invalid credentials' })
    const ok = bcrypt.compareSync(password, userData.password_hash)
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' })
    const token = jwt.sign({ id: userData.id, email: userData.email, role: 'user' }, JWT_SECRET, { expiresIn: '7d' })
    res.cookie('app_session', token, { httpOnly: true, maxAge: 7*24*3600*1000, path: '/', sameSite: 'lax' })
    return res.json({ ok: true, user: { id: userData.id, email: userData.email, role: 'user' } })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
}

function logout(req, res) {
  // clear both possible session cookies
  res.cookie('admin_session', '', { httpOnly: true, maxAge: 0, path: '/' })
  res.cookie('app_session', '', { httpOnly: true, maxAge: 0, path: '/' })
  return res.json({ ok: true })
}

async function me(req, res) {
  try {
    // Accept either app_session or admin_session
    const token = (req.cookies && (req.cookies.app_session || req.cookies.admin_session))
    if (!token) return res.status(200).json({ authenticated: false })
    const payload = jwt.verify(token, JWT_SECRET)
    // fetch full user record so client has username/phone/address for regular users
    try {
      if (payload.role === 'admin') {
        const { data: profile } = await supabase.from('profiles').select('id,email,role,name').eq('id', payload.id).limit(1).single()
        return res.json({ authenticated: true, user: Object.assign({}, payload, profile) })
      } else {
        const { data: user } = await supabase.from('users').select('id,username,email,phone,address').eq('id', payload.id).limit(1).single()
        return res.json({ authenticated: true, user: Object.assign({}, payload, user) })
      }
    } catch (e) {
      // fallback to token payload
      return res.json({ authenticated: true, user: payload })
    }
  } catch (err) {
    return res.status(200).json({ authenticated: false })
  }
}

async function updateProfile(req, res) {
  try {
    const token = (req.cookies && (req.cookies.app_session || req.cookies.admin_session))
    if (!token) return res.status(401).json({ error: 'Not authenticated' })
    const payload = jwt.verify(token, JWT_SECRET)
    const { username, email, phone, address } = req.body
    if (payload.role === 'admin') {
      const { data, error } = await supabase.from('profiles').update({ email }).eq('id', payload.id).select().limit(1).single()
      if (error) return res.status(500).json({ error })
      return res.json({ ok: true, user: data })
    } else {
      const upd = { username, email, phone, address }
      const { data, error } = await supabase.from('users').update(upd).eq('id', payload.id).select('id,username,email,phone,address').limit(1).single()
      if (error) return res.status(500).json({ error })
      return res.json({ ok: true, user: data })
    }
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
}

async function changePassword(req, res) {
  try {
    const token = (req.cookies && (req.cookies.app_session || req.cookies.admin_session))
    if (!token) return res.status(401).json({ error: 'Not authenticated' })
    const payload = jwt.verify(token, JWT_SECRET)
    const { oldPassword, newPassword, confirmPassword } = req.body
    if (!oldPassword || !newPassword) return res.status(400).json({ error: 'Passwords required' })
    if (newPassword.length < 8) return res.status(400).json({ error: 'New password must be at least 8 characters' })
    if (newPassword !== confirmPassword) return res.status(400).json({ error: 'Confirmation does not match' })

    // fetch stored hash
    let table = payload.role === 'admin' ? 'profiles' : 'users'
    const { data, error } = await supabase.from(table).select('password_hash').eq('id', payload.id).limit(1).single()
    if (error || !data) return res.status(400).json({ error: 'User not found' })
    const ok = bcrypt.compareSync(oldPassword, data.password_hash)
    if (!ok) return res.status(401).json({ error: 'Old password invalid' })

    const hash = bcrypt.hashSync(newPassword, 10)
    const { error: upErr } = await supabase.from(table).update({ password_hash: hash }).eq('id', payload.id)
    if (upErr) return res.status(500).json({ error: 'Failed to update password' })
    return res.json({ ok: true })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
}

// Register a new regular user into `users` table
async function register(req, res) {
  try {
    const { email, password, username, phone, address } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' })
    // check existing
    const { data: exists } = await supabase.from('users').select('id').eq('email', email).limit(1).single()
    if (exists) return res.status(400).json({ error: 'Email already registered' })
    const hash = bcrypt.hashSync(password, 10)
    const payload = { email, password_hash: hash, username: username || null, phone: phone || null, address: address || null }
    const { data, error } = await supabase.from('users').insert([payload]).select().limit(1).single()
    if (error) return res.status(500).json({ error: 'Failed to create user' })
    return res.json({ ok: true, user: { id: data.id, email: data.email } })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
}

module.exports = { login, logout, me, register, updateProfile, changePassword }
