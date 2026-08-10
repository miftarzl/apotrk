const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY || ''

export async function adminFetch(path: string, opts: any = {}) {
  const headers = Object.assign({ 'x-admin-key': ADMIN_KEY, 'Content-Type': 'application/json' }, opts.headers || {})
  const res = await fetch(API + path, Object.assign({}, opts, { headers }))
  return res.json()
}
