"use client"
import React, { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import toast from 'react-hot-toast'

export default function AdminOrderDetail(){
  const auth = useAuth()
  const router = useRouter()
  const params: any = useParams()
  const id = params?.id
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    let mounted = true
    async function load(){
      try{
        const backend = process.env.NEXT_PUBLIC_BACKEND_URL || ''
        const r = await fetch(`${backend}/api/admin/orders/${id}`, { credentials: 'include' })
        const j = await r.json()
        if (!mounted) return
        if (r.ok) setOrder(j)
      }catch(e){ console.error(e) }
      finally{ if (mounted) setLoading(false) }
    }
    if (id) load()
    return ()=>{ mounted = false }
  }, [id])

  if (auth.loading) return <div>Checking session...</div>
  if (!auth.user) return null
  if (auth.user.role !== 'admin') return <div>Access denied</div>

  if (loading) return <div>Loading...</div>
  if (!order) return <div>Order not found</div>

  function formatRupiah(v:any){ return Number(v||0).toLocaleString('id-ID') }

  async function changeStatus(nextStatus:any){
    try{
      const backend = process.env.NEXT_PUBLIC_BACKEND_URL || ''
      const r = await fetch(`${backend}/api/admin/orders/${order.id}/status`, { method: 'PUT', headers: {'Content-Type':'application/json'}, credentials: 'include', body: JSON.stringify({ status: nextStatus }) })
      if (r.ok) {
        const updated = await r.json()
        setOrder(updated)
      } else {
        const j = await r.json().catch(()=>({})); toast.error(j?.error || 'Gagal update status')
      }
    }catch(e){ console.error(e); toast.error('Server error') }
  }

  const seq = ['Menunggu Pembayaran','Lunas','Diproses','Dikirim','Selesai']
  const currentIndex = seq.indexOf(order.order_status || 'Menunggu Pembayaran')
  const next = seq[currentIndex+1]

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold">Detail Pesanan</h1>
          <div className="text-sm text-slate-500">{order.order_code} • {new Date(order.created_at || order.createdAt || Date.now()).toLocaleString()}</div>
        </div>
        <div>
          <span className="px-3 py-1 rounded bg-sky-100 text-sky-700 font-semibold">{order.order_status}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="space-y-3">
            {(order.items || []).map((it:any)=> (
              <div key={it.id} className="flex items-center gap-3 p-3 border rounded">
                <img src={it.medicines?.foto_url || '/images/no-image.png'} alt={it.medicines?.nama_obat} className="w-20 h-20 object-cover rounded" />
                <div>
                  <div className="font-semibold">{it.medicines?.nama_obat}</div>
                  <div className="text-sm text-slate-600">{it.quantity} x Rp {formatRupiah(it.price)}</div>
                </div>
                <div className="ml-auto font-semibold">Rp {formatRupiah(it.subtotal)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="md:col-span-1">
          <div className="p-4 border rounded space-y-3">
            <div>
              <div className="text-sm text-slate-500">Subtotal</div>
              <div className="font-semibold">Rp {formatRupiah(order.subtotal)}</div>
            </div>
            <div>
              <div className="text-sm text-slate-500">Ongkir</div>
              <div className="font-semibold">Rp {formatRupiah(order.shipping_cost)}</div>
            </div>
            <div>
              <div className="text-sm text-slate-500">Total</div>
              <div className="text-2xl font-bold">Rp {formatRupiah(order.total_amount)}</div>
            </div>

            <div className="pt-2">
              {next ? (
                <button onClick={()=>changeStatus(next)} className="w-full px-3 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded">{next === 'Diproses' ? 'Proses Pesanan' : next === 'Dikirim' ? 'Kirim Pesanan' : next === 'Selesai' ? 'Selesaikan Pesanan' : (`Set to ${next}`)}</button>
              ) : (
                <div className="text-sm text-slate-500">Tidak ada aksi tersedia</div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
