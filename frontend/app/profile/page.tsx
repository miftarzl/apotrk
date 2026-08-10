"use client"

import React, { useEffect, useState } from 'react'
import { Eye, EyeOff, FileText, LayoutDashboard, ShoppingCart, Package, ShieldCheck, LogOut } from 'lucide-react'
import { motion } from 'framer-motion'
import { useSearchParams, useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { useAuth } from '../../lib/AuthContext'
import Protected from '../../components/Protected'
import dynamic from 'next/dynamic'
const ProfileAddress = dynamic(() => import('../../components/ProfileAddress'), { ssr: false })
import InvoiceModal from '../../components/orders/InvoiceModal'
import { ConfirmationModal } from '../../components/ui'

function ProfileCard({ user, onSave }: any) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ username: '', email: '', phone: '', address: '' })

  useEffect(() => {
    if (user) setForm({ username: user.username || '', email: user.email || '', phone: user.phone || '', address: user.address || '' })
  }, [user])

  return (
    <div className="card p-6 top-24">
      
      {/* HEADER */}
      <div className="flex items-center gap-4 border-b pb-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">
            Informasi Pribadi
          </h2>
          <p className="text-sm text-slate-500">
            Kelola data pribadi akun Anda
          </p>
        </div>
      </div>

      <div className="mt-6">
        {!editing ? (
          <div className="space-y-4">

            <div>
              <p className="text-sm text-slate-500">Nama Lengkap</p>
              <p className="font-medium text-slate-800">
                {user?.username || '-'}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Email</p>
              <p className="font-medium text-slate-800">
                {user?.email || '-'}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Nomor Telepon</p>
              <p className="font-medium text-slate-800">
                {user?.phone || '-'}
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold rounded-lg transition"
                >
                Edit Data Diri
              </button>
            </div>

          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              onSave(form)
              setEditing(false)
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nama Lengkap
              </label>

              <input
                className="input"
                value={form.username}
                onChange={(e) =>
                  setForm({
                    ...form,
                    username: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>

              <input
                className="input"
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm({
                    ...form,
                    email: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nomor Telepon
              </label>

              <input
                className="input"
                value={form.phone}
                onChange={(e) =>
                  setForm({
                    ...form,
                    phone: e.target.value,
                  })
                }
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium rounded-lg transition"
              >
                Simpan Perubahan
              </button>

              <button
                type="button"
                onClick={() => setEditing(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition"
              >
                Batal
              </button>
            </div>
          </form>
        )}
      </div>

    </div>
  )
}

function ChangePasswordForm({ onSubmit, error, message }: any) {
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  async function submit(e:any){
    e.preventDefault()
    if (newPassword.length < 8) {
      toast.error('Password baru minimal 8 karakter')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('Konfirmasi password tidak sama')
      return
    }
    setLoading(true)
    await onSubmit(oldPassword, newPassword, confirmPassword)
    setLoading(false)
    setOldPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  return (
    <form onSubmit={submit} className="space-y-3 max-w-md">
      {error ? <div className="text-red-600">{error}</div> : null}
      {message ? <div className="text-green-600">{message}</div> : null}
      <div>
      <label className="text-sm text-slate-700">
        Password Lama
      </label>

      <div className="relative mt-1">
        <input
          type={showOldPassword ? "text" : "password"}
          className="input pr-10"
          value={oldPassword}
          onChange={e => setOldPassword(e.target.value)}
        />

        <button
          type="button"
          onClick={() => setShowOldPassword(!showOldPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
        >
          {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>

    <div>
      <label className="text-sm text-slate-700">
        Password Baru
      </label>

      <div className="relative mt-1">
        <input
          type={showNewPassword ? "text" : "password"}
          className="input pr-10"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
        />

        <button
          type="button"
          onClick={() => setShowNewPassword(!showNewPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
        >
          {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>

    <div>
      <label className="text-sm text-slate-700">
        Konfirmasi Password Baru
      </label>

      <div className="relative mt-1">
        <input
          type={showConfirmPassword ? "text" : "password"}
          className="input pr-10"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
        />

        <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
        >
          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>

    <div className="pt-2">
      <button
        className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold rounded-lg transition"
        type="submit"
        disabled={loading}
      >
        {loading ? "Menyimpan..." : "Simpan Perubahan"}
      </button>
    </div>
    </form>
  )
}

function ProfilePageContent() {
  const { user, logout } = useAuth()
  const [tab, setTab] = useState<'dashboard'|'cart'|'orders'|'security'>('dashboard')
  const [cart, setCart] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [addressData, setAddressData] = useState<any>(null)
  const [deliveryZones, setDeliveryZones] = useState<any[]>([])
  const [shippingCost, setShippingCost] = useState<number>(0)
  const [shippingNote, setShippingNote] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [invoiceOpen, setInvoiceOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [pwErr, setPwErr] = useState('')
  const [pwMsg, setPwMsg] = useState('')
  const [cancelOrderId, setCancelOrderId] = useState<number | null>(null)
  const [cancelConfirm, setCancelConfirm] = useState(false)

  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(()=>{
    // sync tab from query param
    const q = searchParams?.get('tab')
    if (q === 'cart' || q === 'orders' || q === 'security' || q === 'dashboard') setTab(q)

    async function load() {
      setLoading(true)
      try{
        const backend = process.env.NEXT_PUBLIC_BACKEND_URL || ''
        const cRes = await fetch(`${backend}/api/user/cart`, { credentials: 'include' })
        const oRes = await fetch(`${backend}/api/orders`, { credentials: 'include' })
        const aRes = await fetch(`${backend}/api/user/address`, { credentials: 'include' })
        const zRes = await fetch(`${backend}/api/user/delivery_zones`)
        const c = await cRes.json().catch(()=>[])
        const o = await oRes.json().catch(()=>[])
        const a = await aRes.json().catch(()=>null)
        const z = await zRes.json().catch(()=>[])
        setCart(Array.isArray(c) ? c : [])
        // ensure orders show oldest first (created_at ASC)
        const ords = Array.isArray(o) ? o.slice().sort((a:any,b:any) => {
          const da = new Date(a.created_at || a.createdAt || 0).getTime()
          const db = new Date(b.created_at || b.createdAt || 0).getTime()
          return da - db
        }) : []
        setOrders(ords)
        setAddressData(a)
        setDeliveryZones(Array.isArray(z) ? z : [])
        // compute shipping
        const subtotal = (Array.isArray(c) ? c : []).reduce((s:any, it:any) => {
          const q = it.quantity ?? it.qty ?? 0
          const p = Number(it.medicines?.harga ?? it.price ?? 0)
          return s + (p * q)
        }, 0)
        if (!a || !a.village) {
          setShippingCost(0)
          setShippingNote('Silakan lengkapi alamat pengiriman terlebih dahulu.')
        } else {
          const found = (Array.isArray(z) ? z : []).find((zz:any)=> (zz.village||'').toLowerCase() === (a.village||'').toLowerCase())
          if (!found) {
            setShippingCost(0)
            setShippingNote('Maaf, layanan pengiriman saat ini hanya tersedia untuk wilayah Kecamatan Babelan. Silakan hubungi admin untuk pemesanan.')
          } else {
            setShippingCost(Number(found.shipping_cost) || 0)
            setShippingNote(found.village)
          }
        }
      }catch(e){ console.error(e) }
      finally{ setLoading(false) }
    }
    load()
  },[searchParams])

  async function saveProfile(data:any) {
    try{
      const backend = process.env.NEXT_PUBLIC_BACKEND_URL || ''
      const res = await fetch(`${backend}/api/auth/profile`, { method: 'PUT', headers: {'Content-Type':'application/json'}, credentials: 'include', body: JSON.stringify(data) })
      if (res.ok) {
        // reload to refresh auth/user info
        window.location.reload()
      }
    }catch(e){ console.error(e) }
  }

  async function changePassword(oldPassword:string, newPassword:string, confirmPassword:string){
    setPwErr('')
    setPwMsg('')
    try{
      const backend = process.env.NEXT_PUBLIC_BACKEND_URL || ''
      const res = await fetch(`${backend}/api/auth/change-password`, { method: 'POST', headers: {'Content-Type':'application/json'}, credentials: 'include', body: JSON.stringify({ oldPassword, newPassword, confirmPassword }) })
      const j = await res.json().catch(()=>({}))
      if (res.ok) { setPwMsg('Password berhasil diubah') } else { setPwErr(j?.error || 'Gagal mengganti password') }
    }catch(e){ console.error(e); setPwErr('Server error') }
  }

  async function cancelOrder(orderId:number) {
    try {
      const backend = process.env.NEXT_PUBLIC_BACKEND_URL || ''
      const r = await fetch(`${backend}/api/orders/${orderId}/cancel`, {
        method: 'POST',
        credentials: 'include'
      })
      const j = await r.json().catch(()=>({}))
      if (r.ok) {
        const updated = j
        setOrders((prev) => prev.map((p) => p.id === orderId ? updated : p))
        toast.success('Pesanan dibatalkan')
      } else {
        toast.error(j?.error || 'Gagal membatalkan pesanan')
      }
    } catch (e) {
      console.error(e)
      toast.error('Server error')
    } finally {
      setCancelOrderId(null)
      setCancelConfirm(false)
    }
  }

  async function updateQty(itemId:string, qty:number){
    try{
      const backend = process.env.NEXT_PUBLIC_BACKEND_URL || ''
      await fetch(`${backend}/api/user/cart/${itemId}`, { method: 'PUT', headers:{'Content-Type':'application/json'}, credentials: 'include', body: JSON.stringify({ qty }) })
      setCart(prev=>prev.map(p=>p.id===itemId?{...p, quantity: qty}:p))
    }catch(e){ console.error(e) }
  }

  async function removeItem(itemId:string){
    try{
      const backend = process.env.NEXT_PUBLIC_BACKEND_URL || ''
      const res = await fetch(`${backend}/api/user/cart/${itemId}`, { method: 'DELETE', credentials: 'include' })
      if (!res.ok) return
      setCart(prev=>prev.filter(p=>p.id!==itemId))
      window.dispatchEvent(new Event('cart-changed'))
    }catch(e){ console.error(e) }
  }

  // Load Midtrans snap script dynamically
  function loadMidtrans() {
    return new Promise<void>((resolve, reject) => {
      if (typeof window === 'undefined') return reject(new Error('No window'))
      if ((window as any).snap) return resolve()
      const isProd = String(process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION || '').toLowerCase() === 'true'
      const src = isProd ? 'https://app.midtrans.com/snap/snap.js' : 'https://app.sandbox.midtrans.com/snap/snap.js'
      const existing = document.querySelector(`script[src="${src}"]`)
      if (existing) return resolve()
      const s = document.createElement('script')
      s.src = src
      s.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '')
      s.onload = () => resolve()
      s.onerror = () => reject(new Error('Failed to load snap.js'))
      document.body.appendChild(s)
    })
  }

  function getPaymentErrorMessage(payload:any) {
    const details = payload?.details
    if (details && typeof details === 'object') {
      if (Array.isArray(details.error_messages)) return details.error_messages.join('\n')
      if (typeof details.message === 'string' && details.message) return details.message
      if (typeof details.error === 'string' && details.error) return details.error
    }
    if (typeof details === 'string' && details) return details
    if (typeof payload?.error === 'string' && payload.error) return payload.error
    if (typeof payload?.message === 'string' && payload.message) return payload.message
    return 'Terjadi kesalahan pembayaran.'
  }

  async function payOrder(orderId:number){
    try{
      const backend = process.env.NEXT_PUBLIC_BACKEND_URL || ''
      const res = await fetch(`${backend}/api/orders/pay`, { method: 'POST', headers: {'Content-Type':'application/json'}, credentials: 'include', body: JSON.stringify({ order_id: orderId }) })
      const j = await res.json().catch(()=>({} as any))
      if (!res.ok) {
        console.error('Pay order failed', j)
        toast.error(getPaymentErrorMessage(j))
        return
      }

      if (j?.paid || j?.alreadyPaid) {
        toast.success('Pembayaran sudah lunas')
        window.location.reload()
        return
      }

      if (j?.pending && !j?.token) {
        toast('Pembayaran masih menunggu penyelesaian. Silakan selesaikan pembayaran menggunakan Virtual Account atau QRIS yang sebelumnya dibuat.', { duration: 5000 })
        return
      }

      if (j?.expired || j?.cancelled || j?.denied) {
        toast.error(j?.message || 'Transaksi pembayaran sudah berakhir. Silakan coba lagi.')
        return
      }

      if (j?.reused) {
        toast('Melanjutkan pembayaran sebelumnya...', { duration: 4000 })
      }

      const token = j.token
      if (!token) {
        console.error('No snap token', j)
        toast.error(getPaymentErrorMessage(j))
        return
      }

      await loadMidtrans()
      ;(window as any).snap.pay(token, {
        onSuccess: function(result:any){ window.location.reload() },
        onPending: function(result:any){ window.location.reload() },
        onError: function(result:any){ console.error('Midtrans snap error', result); toast.error('Pembayaran gagal: ' + (result && result.status_message ? result.status_message : 'Terjadi kesalahan')) }
      })
    }catch(e){ console.error(e); toast.error('Server error') }
  }

  function setTabAndPush(t: 'dashboard'|'cart'|'orders'|'security'){
    setTab(t)
    router.push(`/profile?tab=${t}`)
  }

  function formatRupiah(v:any){
    if (!v && v !== 0) return '-'
    return Number(v).toLocaleString('id-ID')
  }

  return (
    <Protected>
    <div className="container-page py-4 pt-[100px]">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          {/* Header */}
          <div className="pb-2 mb-1 border-b">
            <div>
              <div className="text-lg font-bold text-slate-900">Profile.</div>
              <div className="text-sm text-slate-500">Pusat Akun Pelanggan</div>
            </div>
          </div>
            
          <div className="card px-4 pt-3 pb-4 sticky top-24 flex flex-col">
            <nav className="flex-1 flex flex-col gap-2">
              <button onClick={()=>setTabAndPush('dashboard')} className={`flex items-center justify-between px-3 py-2 rounded ${tab==='dashboard' ? 'bg-sky-100 text-sky-600 font-medium' : 'text-slate-600 hover:bg-slate-100'}`}>
                <div className="flex items-center gap-3">
                  <LayoutDashboard size={18} className={`${tab==='dashboard' ? 'text-sky-600' : 'text-slate-400'}`} />
                  <span>Dashboard</span>
                </div>
              </button>

              {/* compute unique medicine types in cart */}
              {(() => {
                const ids = Array.isArray(cart)
                  ? cart
                      .map((it:any) => it.medicine_id ?? it.medicines?.id ?? it.medicines?.medicine_id ?? it.id ?? null)
                      .filter(Boolean)
                  : []
                const uniqueCount = new Set(ids).size
                return (
                  <button onClick={()=>setTabAndPush('cart')} className={`flex items-center justify-between px-3 py-2 rounded ${tab==='cart' ? 'bg-sky-100 text-sky-600 font-medium' : 'text-slate-600 hover:bg-slate-100'}`}>
                    <div className="flex items-center gap-3">
                      <ShoppingCart size={18} className={`${tab==='cart' ? 'text-sky-600' : 'text-slate-400'}`} />
                      <span>Keranjang</span>
                    </div>
                    <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-sky-500 text-white text-xs font-semibold flex items-center justify-center">{uniqueCount > 99 ? '99+' : uniqueCount}</span>
                  </button>
                )
              })()}

              <button onClick={()=>setTabAndPush('orders')} className={`flex items-center justify-between px-3 py-2 rounded ${tab==='orders' ? 'bg-sky-100 text-sky-600 font-medium' : 'text-slate-600 hover:bg-slate-100'}`}>
                <div className="flex items-center gap-3">
                  <Package size={18} className={`${tab==='orders' ? 'text-sky-600' : 'text-slate-400'}`} />
                  <span>Pesanan Saya</span>
                </div>
                <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-sky-500 text-white text-xs font-semibold flex items-center justify-center">{orders.length > 99 ? '99+' : orders.length}</span>
              </button>

              <button onClick={()=>setTabAndPush('security')} className={`flex items-center justify-between px-3 py-2 rounded ${tab==='security' ? 'bg-sky-100 text-sky-600 font-medium' : 'text-slate-600 hover:bg-slate-100'}`}>
                <div className="flex items-center gap-3">
                  <ShieldCheck size={18} className={`${tab==='security' ? 'text-sky-600' : 'text-slate-400'}`} />
                  <span>Keamanan Akun</span>
                </div>
              </button>
            </nav>

            <div className="mt-4 pt-3 border-t">
              <button onClick={() => { if (typeof logout === 'function') logout() }} className="w-full flex items-center gap-3 px-3 py-2 rounded text-slate-600 hover:bg-slate-100">
                <LogOut size={18} />
                <span>Keluar</span>
              </button>
            </div>
          </div>
        </div>

        <div className="md:col-span-3">
          {loading ? <div>Loading...</div> : (
            <motion.div key={tab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              {tab==='dashboard' && (
                <div className="space-y-4">
                  <div>
                    <ProfileCard user={user} onSave={saveProfile} />
                  </div>
                  <div>
                    <ProfileAddress user={user} onSaved={(a:any)=>setAddressData(a)} />
                  </div>
                </div>
              )}

              {tab==='cart' && (
                <div className="card p-6 top-24 ">
                  <h2 className="text-lg font-semibold mb-4">Keranjang Belanja</h2>

                  {cart.length === 0 ? (
                    <p className="text-sm text-slate-600">
                      Keranjang masih kosong
                    </p>
                  ) : (
                    <div className="space-y-4">

                      {cart.map(item => {
                        const qty = item.quantity ?? item.qty ?? 0
                        const price = Number(item.medicines?.harga ?? item.price ?? 0)
                        const subtotal = price * qty

                        return (
                          <div
                            key={item.id}
                            className="flex items-center justify-between border rounded-xl p-4 bg-white shadow-sm"
                          >

                            {/* KIRI */}
                            <div className="flex items-center gap-4">

                              {/* FOTO */}
                              <img
                                src={
                                  item.medicines?.foto_url ||
                                  "/images/no-image.png"
                                }
                                alt={item.medicines?.nama_obat}
                                className="w-20 h-20 object-cover rounded-lg border"
                              />

                              {/* INFO OBAT */}
                              <div>
                                <h3 className="font-semibold text-lg">
                                  {item.medicines?.nama_obat || item.name}
                                </h3>

                                <p className="font-medium">
                                  Rp {formatRupiah(price)}
                                </p>
                              </div>

                            </div>

                            {/* KANAN */}
                            <div className="flex items-center gap-6">

                              {/* QUANTITY */}
                              <div className="flex items-center gap-2">

                                <button
                                  className="w-9 h-9 rounded-lg border hover:bg-slate-100"
                                  onClick={() => updateQty(item.id, qty - 1)}
                                >
                                  -
                                </button>

                                <input
                                  type="number"
                                  value={qty}
                                  onChange={(e) =>
                                    updateQty(item.id, Number(e.target.value))
                                  }
                                  className="w-16 text-center border rounded-lg"
                                />

                                <button
                                  className="w-9 h-9 rounded-lg border hover:bg-slate-100"
                                  onClick={() => updateQty(item.id, qty + 1)}
                                >
                                  +
                                </button>

                              </div>

                              {/* SUBTOTAL */}
                              <div className="text-right min-w-[140px]">
                                <div className="text-sm text-slate-500">
                                  Subtotal
                                </div>

                                <div className="font-semibold">
                                  Rp {formatRupiah(subtotal)}
                                </div>
                              </div>

                              {/* HAPUS */}
                              <button
                                onClick={() => removeItem(item.id)}
                                className="text-red-600 font-semibold hover:text-red-700"
                              >
                                Hapus
                              </button>

                            </div>

                          </div>
                        )
                      })}

                      {/* TOTAL + CHECKOUT */}
                      <div className="border-t pt-5 mt-5">
                        <div className="mb-3">
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-slate-500">Subtotal</div>
                            <div className="font-semibold">Rp {formatRupiah(cart.reduce((s, it) => { const q = it.quantity ?? it.qty ?? 0; const p = Number(it.medicines?.harga ?? it.price ?? 0); return s + (p * q) }, 0))}</div>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="text-sm text-slate-500">Ongkir {shippingNote ? `(${shippingNote})` : ''}</div>
                            <div className="font-semibold">Rp {formatRupiah(shippingCost)}</div>
                          </div>
                        </div>

                        {/** warnings */}
                        {!addressData || !addressData.village ? (
                          <div className="text-yellow-700 bg-yellow-50 p-3 rounded mb-3">
                            Silakan lengkapi alamat pengiriman terlebih dahulu.
                          </div>
                        ) : shippingNote?.toLowerCase().includes('hubungi admin') ? (
                          <div className="text-red-700 bg-red-50 p-3 rounded mb-3">
                            {shippingNote}
                          </div>
                        ) : null}

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-slate-500">Total Belanja</p>
                            <h3 className="text-2xl font-bold">Rp {formatRupiah(cart.reduce((s, it) => { const q = it.quantity ?? it.qty ?? 0; const p = Number(it.medicines?.harga ?? it.price ?? 0); return s + (p * q) }, 0) + Number(shippingCost || 0))}</h3>
                          </div>

                          <button onClick={async()=>{
                            try{
                              const backend = process.env.NEXT_PUBLIC_BACKEND_URL || ''
                              const res = await fetch(`${backend}/api/orders`, { method: 'POST', credentials: 'include' })
                              if (res.ok) {
                                // redirect to orders tab
                                router.push('/profile?tab=orders')
                              } else {
                                const j = await res.json().catch(()=>({})); toast.error(j?.error || 'Gagal membuat pesanan')
                              }
                            }catch(e){ console.error(e); toast.error('Server error') }
                          }} className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold rounded-lg transition">
                            Checkout & Bayar
                          </button>
                        </div>
                      </div>

                    </div>
                  )}
                </div>
              )}

              {tab==='orders' && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">Pesanan Saya</h2>
                  {orders.length===0 ? (
                    <p className="text-sm text-slate-600">Belum ada pesanan</p>
                  ) : (
                    <div className="space-y-4">
                      {orders.map(o => {
                        const stepMap = ['Menunggu Pembayaran','Lunas','Diproses','Dikirim','Selesai']
                        const curIndex = Math.max(0, stepMap.indexOf(o.order_status || 'Menunggu Pembayaran'))

                        function badgeClass(status:any){
                          switch(status){
                            case 'Menunggu Pembayaran': return 'bg-amber-100 text-amber-800'
                            case 'Lunas': return 'bg-emerald-100 text-emerald-800'
                            case 'Diproses': return 'bg-sky-100 text-sky-800'
                            case 'Dikirim': return 'bg-indigo-100 text-indigo-800'
                            case 'Selesai': return 'bg-green-50 text-green-800'
                            case 'Dibatalkan': return 'bg-red-100 text-red-800'
                            default: return 'bg-slate-100 text-slate-700'
                          }
                        }

                        return (
                          <div
                            key={o.id}
                            className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
                          >
                            {/* Header */}
                            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">

                                <div>
                                  <div className="flex items-center gap-3">
                                    <span className="text-lg font-bold text-slate-800">
                                      {o.order_code || `#${o.id}`}
                                    </span>

                                    <span
                                      className="text-sm text-slate-800">
                                    {new Date(
                                      o.created_at || o.createdAt || Date.now()
                                    ).toLocaleString("id-ID")}
                                    </span>
                                  </div>
                                </div>

                                <div className="text-right">
                                  <span
                                      className={`px-6 py-2 rounded-full text-xs font-bold ${badgeClass(
                                        o.order_status
                                      )}`}
                                    >
                                      {o.order_status}
                                    </span>
                                </div>
                              </div>
                            </div>

                            {/* Timeline */}
                            {o.order_status !== "Dibatalkan" && (
                              <div className="px-4 py-3 border-b border-slate-100">
                                <div className="flex items-center justify-between overflow-x-auto min-w-max">

                                  {stepMap.map((s, i) => (
                                    <React.Fragment key={s}>
                                      <div className="flex flex-col items-center min-w-[70px]">

                                        <div
                                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                                            i <= curIndex
                                              ? "bg-sky-600 text-white"
                                              : "bg-slate-200 text-slate-500"
                                          }`}
                                        >
                                          {i + 1}
                                        </div>

                                        <div
                                          className={`mt-1 text-[11px] text-center leading-tight ${
                                            i <= curIndex
                                              ? "font-semibold text-slate-800"
                                              : "text-slate-400"
                                          }`}
                                        >
                                          {s}
                                        </div>
                                      </div>

                                      {i < stepMap.length - 1 && (
                                        <div
                                          className={`h-1 flex-1 rounded-full ${
                                            i < curIndex
                                              ? "bg-sky-600"
                                              : "bg-slate-200"
                                          }`}
                                        />
                                      )}
                                    </React.Fragment>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Content */}
                            <div className="p-6">

                              <div className="grid grid-cols-1 gap-3">

                                {/* Produk */}
                                <div>

                                  <div className="space-y-4">

                                    {(o.items || []).map((it: any) => (
                                      <div
                                        key={it.id}
                                        className="flex gap-4 p-4 rounded-2xl border border-slate-200 hover:border-sky-300 transition"
                                      >
                                        <img
                                          src={
                                            it.medicines?.foto_url ||
                                            "/images/no-image.png"
                                          }
                                          alt={it.medicines?.nama_obat}
                                          className="w-12 h-12 rounded-xl object-cover border"
                                        />

                                        <div className="flex-1">
                                          <div className="font-semibold text-slate-800 text-base">
                                            {it.medicines?.nama_obat || it.name}
                                          </div>

                                          <div className="text-sm text-slate-500 mt-1">
                                            Rp {formatRupiah(it.price)} •  Qty: {it.quantity}
                                          </div>
                                        </div>

                                        <div className="text-right">
                                          <div className="font-bold text-slate-800">
                                            Rp {formatRupiah(it.subtotal)}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Ringkasan */}
                                <div className="mt-0">
                                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">

                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

                                      {/* Kiri - Ringkasan */}
                                      <div className="flex-1">
                                        <h3 className="font-bold text-slate-800 mb-4">
                                          Ringkasan Pesanan
                                        </h3>

                                        <div className="space-y-3 text-sm">

                                          <div className="flex justify-between max-w-sm">
                                            <span className="text-slate-500">
                                              Subtotal: Rp {formatRupiah(o.subtotal)} • Ongkir: Rp {formatRupiah(o.shipping_cost)}
                                            </span>
                                          </div>

                                          <div className="border-t pt-3 flex justify-between max-w-sm">
                                            <span className="font-bold">
                                              Total: Rp {formatRupiah(o.total_amount)}
                                            </span>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Kanan - Tombol Aksi */}
                                      <div className="flex flex-wrap items-center gap-2">

                                        {o.order_status === "Menunggu Pembayaran" && (
                                          <>
                                            <button
                                              onClick={() => payOrder(o.id)}
                                              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-semibold transition"
                                            >
                                              Bayar Sekarang
                                            </button>

                                            <button
                                              onClick={() => {
                                                setCancelOrderId(o.id)
                                                setCancelConfirm(true)
                                              }}
                                              className="px-4 py-2 border border-red-300 text-red-600 rounded-xl text-sm hover:bg-red-50 transition"
                                            >
                                              Batalkan
                                            </button>
                                          </>
                                        )}

                                        <button
                                          onClick={() => {
                                            setSelectedOrder(o)
                                            setInvoiceOpen(true)
                                          }}
                                          className="px-4 py-2 border border-sky-200 text-sky-700 rounded-xl text-sm hover:bg-sky-50 flex items-center gap-2 transition"
                                        >
                                          <FileText size={16} />
                                          Lihat Invoice
                                        </button>

                                        {o.order_status === "Lunas" && (
                                          <span className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-sm">
                                            Menunggu Konfirmasi Admin
                                          </span>
                                        )}

                                        {o.order_status === "Diproses" && (
                                          <span className="px-4 py-2 bg-sky-50 text-sky-700 rounded-xl text-sm">
                                            Sedang Diproses
                                          </span>
                                        )}

                                        {o.order_status === "Dikirim" && (
                                          <button
                                            className="px-4 py-2 border rounded-xl text-sm hover:bg-slate-50"
                                            onClick={() =>
                                              toast.error("Fitur lacak belum tersedia")
                                            }
                                          >
                                            Lacak Pesanan
                                          </button>
                                        )}

                                        {o.order_status === "Selesai" && (
                                          <span className="px-4 py-2 bg-green-50 text-green-700 rounded-xl text-sm">
                                            Pesanan Selesai
                                          </span>
                                        )}
                                      </div>

                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {tab==='security' && (
                <div className="card p-6 top-24">
                  <h2 className="text-lg font-semibold mb-3">Keamanan Akun</h2>
                  <ChangePasswordForm onSubmit={changePassword} error={pwErr} message={pwMsg} />
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
      <InvoiceModal order={selectedOrder} open={invoiceOpen} onClose={()=>setInvoiceOpen(false)} />
      <ConfirmationModal
        open={cancelConfirm}
        title="Batalkan Pesanan"
        description="Apakah Anda yakin ingin membatalkan pesanan ini?"
        confirmText="Batalkan"
        cancelText="Batal"
        variant="warning"
        onConfirm={() => cancelOrder(cancelOrderId ?? 0)}
        onCancel={() => {
          setCancelOrderId(null)
          setCancelConfirm(false)
        }}
      />
    </Protected>
  )
}

export default function ProfilePage() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <ProfilePageContent />
    </React.Suspense>
  )
}

