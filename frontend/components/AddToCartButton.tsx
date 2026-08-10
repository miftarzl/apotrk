"use client"

import React from 'react'
import toast from 'react-hot-toast'
import { ShoppingCart } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { useRouter } from 'next/navigation'

export default function AddToCartButton({
  medicineId,
  disabled,
  className,
}: {
  medicineId: string
  disabled?: boolean
  className?: string
}) {
  const { user } = useAuth()
  const router = useRouter()

  async function handleAdd() {
    const backend = process.env.NEXT_PUBLIC_BACKEND_URL || ''
    if (!user) return router.push('/login')
    console.log('User:', user)
    console.log('MedicineId:', medicineId)
    try {
      const payload = { medicine_id: medicineId }
      console.log('Payload:', payload)
      const res = await fetch(`${backend}/api/user/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      })
      if (res.status === 401) return router.push('/login')
      const j = await res.json().catch(()=>null)
      if (res.ok) {
        toast.success('Berhasil ditambahkan ke keranjang')
        window.dispatchEvent(new Event('cart-changed'))
        router.push('/profile?tab=cart')
      } else {
        console.error('Add to cart failed response:', j)
        toast.error(j?.error?.message || j?.error || j?.message || JSON.stringify(j) || 'Gagal menambahkan ke keranjang')
      }
    } catch (e) { console.error(e); toast.error('Gagal menambahkan ke keranjang') }
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold text-white transition ${disabled ? 'bg-slate-300 text-slate-700 cursor-not-allowed' : 'bg-sky-600 hover:bg-sky-700'} ${className ?? ''}`}
    >
      <ShoppingCart className="mr-2" /> Tambah ke Keranjang
    </button>
  )
}
