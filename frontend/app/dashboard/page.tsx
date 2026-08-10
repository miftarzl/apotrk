"use client"
import React, { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import { supabase } from '../../lib/supabaseClient'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [favorites, setFavorites] = useState<any[]>([])

  useEffect(() => { init() }, [])

  async function init() {
    const { data } = await supabase.auth.getUser()
    const u = data.user
    if (!u) return
    setUser(u)
    const f = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/favorites?user_id=${u.id}`).then(r => r.json())
    setFavorites(f || [])
  }

  async function removeFav(id: number) {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/favorites/${id}`, { method: 'DELETE' })
    init()
  }

  return (
    <main>
      <Navbar />
      <section className="container mx-auto p-6">
        <h2 className="text-2xl font-semibold">Dashboard Saya</h2>
        {!user && <div className="mt-4">Silakan login untuk melihat favorit Anda.</div>}
        {user && (
          <div className="mt-4">
            <div className="p-4 border rounded">
              <h3 className="font-medium">Obat Favorit</h3>
              {favorites.map(f => (
                <div key={f.id} className="mt-2 p-2 border rounded flex justify-between">
                  <div>
                    <div className="font-semibold">{f.medicines?.name}</div>
                    <div className="text-sm">{f.medicines?.indication}</div>
                  </div>
                  <button className="btn" onClick={()=>removeFav(f.id)}>Hapus</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  )
}
