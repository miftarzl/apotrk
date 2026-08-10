import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/serverAuth'

export async function GET(req: Request) {
  try {
    const cookie = req.headers.get('cookie') || ''
    const match = cookie.split(';').map(s=>s.trim()).find(s=>s.startsWith('admin_session='))
    const token = match ? match.split('=')[1] : null
    if (!token) return NextResponse.json({ authenticated: false })
    const payload = verifyToken(token as string)
    if (!payload) return NextResponse.json({ authenticated: false })
    return NextResponse.json({ authenticated: true, user: payload })
  } catch (err:any) {
    console.error(err)
    return NextResponse.json({ authenticated: false })
  }
}

// use default Node runtime so server-side libraries work
