"use client"
import React, { useEffect, useState } from 'react'
import { useAuth } from '@/lib/AuthContext'
import Modal from '@/components/ui/Modal'
import { ConfirmationModal } from '@/components/ui'
import toast from 'react-hot-toast'
import { Eye, ClipboardList, CalendarDays, User, Phone, MapPinned, Navigation, PackageCheck, Wallet, Package } from 'lucide-react'
export default function AdminOrdersPage(){
  const auth = useAuth()
  const [orders, setOrders] = useState<any[]>([])
  const [detail, setDetail] = useState<any|null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [error, setError] = useState<string|null>(null)
  const [actionModal, setActionModal] = useState<{
    type: 'status' | 'delete'
    id: number
    message: string
    confirmText: string
    newStatus?: string
  } | null>(null)

  useEffect(()=>{ let mounted = true
    async function load(){
      setLoading(true); setError(null)
      try{
        const api = process.env.NEXT_PUBLIC_API_URL || ''
        const r = await fetch(`${api}/orders?admin=1`, { credentials: 'include' })
        const j = await r.json().catch(()=>null)
        if (!mounted) return
        if (r.ok && Array.isArray(j)) setOrders(j)
        else setError(j?.error || 'Gagal memuat pesanan')
      }catch(e){ console.error(e); if (mounted) setError('Server error') }
      finally{ if (mounted) setLoading(false) }
    }
    load()
    return ()=>{ mounted = false }
  }, [])

  if (auth.loading) return <div>Checking session...</div>
  if (!auth.user) return null
  if (auth.user.role !== 'admin') return <div>Access denied</div>

  function formatRp(n:any){ return `Rp ${Number(n||0).toLocaleString('id-ID')}` }

  function openDetailFromList(id:number){
    const o = orders.find(x=>x.id===id) || null
    setDetail(o)
  }

  function askUpdateStatus(id:number, newStatus:string){
    setActionModal({
      type: 'status',
      id,
      message: `Ubah status menjadi ${newStatus}?`,
      confirmText: 'Ubah Status',
      newStatus
    })
  }

  async function updateStatus(id:number, newStatus:string){
    try{
      const api = process.env.NEXT_PUBLIC_API_URL || ''
      const r = await fetch(`${api}/orders/${id}/status`, { method: 'PUT', headers: {'Content-Type':'application/json'}, credentials: 'include', body: JSON.stringify({ order_status: newStatus }) })
      const j = await r.json().catch(()=>({}))
      if (!r.ok) { toast.error(j?.error || 'Gagal update status'); return }
      toast.success('Status diperbarui')
      // refresh list
      const r2 = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/orders?admin=1`, { credentials: 'include' })
      const j2 = await r2.json().catch(()=>null)
      if (r2.ok && Array.isArray(j2)) setOrders(j2)
      // refresh detail from updated list
      const updated = Array.isArray(j2) ? (j2.find((x:any)=>x.id===id) || null) : null
      if (updated) setDetail(updated)
    }catch(e){ console.error(e); toast.error('Server error') }
  }

  function askDeleteOrder(id:number){
    setActionModal({
      type: 'delete',
      id,
      message: 'Apakah Anda yakin ingin menghapus pesanan ini?\n\nData order, item pesanan, dan transaksi pembayaran akan dihapus permanen.',
      confirmText: 'Hapus Pesanan'
    })
  }

  async function deleteOrder(id:number){
    try{
      const api = process.env.NEXT_PUBLIC_API_URL || ''
      const r = await fetch(`${api}/admin/orders/${id}`, { method: 'DELETE', credentials: 'include' })
      const j = await r.json().catch(()=>null)
      if (!r.ok) { toast.error(j?.error || 'Gagal menghapus pesanan'); return }
      toast.success('Pesanan berhasil dihapus')

      // refresh list
      const r2 = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/orders?admin=1`, { credentials: 'include' })
      const j2 = await r2.json().catch(()=>null)
      if (r2.ok && Array.isArray(j2)) setOrders(j2)
      else setOrders(prev => prev.filter(x => x.id !== id))

      setDetail(null)
    }catch(e){ console.error(e); toast.error('Server error') }
  }

  async function handleActionConfirm(){
    if (!actionModal) return
    const current = actionModal
    setActionModal(null)
    if (current.type === 'status' && current.newStatus) {
      await updateStatus(current.id, current.newStatus)
      return
    }
    if (current.type === 'delete') {
      await deleteOrder(current.id)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4">
      <h2 className="text-2xl font-semibold mb-4">Kelola Pesanan</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="text-sm text-slate-200">Total Pesanan</div>
          <div className="text-2xl font-semibold text-slate-200">{orders.length}</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="text-sm text-slate-200">Menunggu Pembayaran</div>
          <div className="text-2xl font-semibold text-slate-200">{orders.filter(o=>o.order_status==='Menunggu Pembayaran').length}</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="text-sm text-slate-200">Diproses</div>
          <div className="text-2xl font-semibold text-slate-200">{orders.filter(o=>o.order_status==='Diproses').length}</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="text-sm text-slate-200">Selesai</div>
          <div className="text-2xl font-semibold text-slate-200">{orders.filter(o=>o.order_status==='Selesai').length}</div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl bg-white/5 border border-white/6 p-2">
        {loading ? (
          <div className="py-6 text-center text-slate-200">Memuat data pesanan...</div>
        ) : error ? (
          <div className="py-6 text-center text-red-400">{error}</div>
        ) : (
          (() => {
            const sorted = orders.slice().sort((a:any,b:any)=> new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
            if (!sorted || sorted.length === 0) return <div className="py-8 text-center text-slate-200">Belum ada pesanan.</div>
            return (
              <table className="min-w-full table-auto">
                <thead className="bg-white/3 sticky top-0 backdrop-blur-sm">
                  <tr>
                    <th className="text-left p-3 text-sm text-slate-300">Order Code</th>
                    <th className="text-left p-3 text-sm text-slate-300">Nama Pembeli</th>
                    <th className="text-left p-3 text-sm text-slate-300">Total</th>
                    <th className="text-left p-3 text-sm text-slate-300">Pembayaran</th>
                    <th className="text-left p-3 text-sm text-slate-300">Status Pesanan</th>
                    <th className="text-left p-3 text-sm text-slate-300">Tanggal</th>
                    <th className="text-left p-3 text-sm text-slate-300">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map(o=> (
                    <tr key={o.id} className="border-b border-white/6 hover:bg-white/2">
                      <td className="p-3 text-sm text-slate-200">{o.order_code}</td>
                      <td className="p-3 text-sm text-slate-200">
                        <div className="font-medium text-slate-200">{o.user?.username || 'Pengguna'}</div>
                      </td>
                      <td className="p-3 text-sm text-slate-200">{formatRp(o.total_amount)}</td>
                      <td className="p-3 text-sm">
                        <span className={
                          `rounded-full px-3 py-1 text-xs font-medium border ` +
                          (o.payment_status==='pending' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                           o.payment_status==='paid' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                           o.payment_status==='failed' ? 'bg-red-500/20 text-red-300 border-red-500/30' : 'bg-gray-500/20 text-gray-300')
                        }>{o.payment_status}</span>
                      </td>
                      <td className="p-3 text-sm">
                        <span className={
                          `rounded-full px-3 py-1 text-xs font-medium border ` +
                          (o.order_status==='Menunggu Pembayaran' ? 'bg-sky-500/20 text-sky-300' :
                           o.order_status==='Lunas' ? 'bg-emerald-500/20 text-emerald-300' :
                           o.order_status==='Diproses' ? 'bg-orange-500/20 text-orange-300' :
                           o.order_status==='Dikirim' ? 'bg-purple-500/20 text-purple-300' :
                           o.order_status==='Selesai' ? 'bg-green-500/20 text-green-300' :
                           o.order_status==='Dibatalkan' ? 'bg-red-500/20 text-red-300' : 'bg-gray-500/20 text-gray-300')
                        }>{o.order_status}</span>
                      </td>
                      <td className="p-3 text-sm text-slate-200">{o.created_at ? new Date(o.created_at).toLocaleString('id-ID') : ''}</td>
                      <td className="p-3 text-sm text-slate-200">
                        <button onClick={()=>openDetailFromList(o.id)} className="inline-flex items-center justify-center px-3 py-2 rounded-lg bg-sky-500 hover:bg-sky-600 text-white transition">
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          })()
        )}
      </div>

      <ConfirmationModal
        open={!!actionModal}
        title={actionModal?.type === 'status' ? 'Ubah Status Pesanan' : 'Hapus Pesanan'}
        description={actionModal?.message}
        confirmText={actionModal?.confirmText}
        cancelText="Batal"
        variant={actionModal?.type === 'status' ? 'warning' : 'danger'}
        onConfirm={handleActionConfirm}
        onCancel={()=>setActionModal(null)}
      />

      <Modal open={!!detail} title="Detail Pesanan" onClose={()=>setDetail(null)} onConfirm={()=>detail && deleteOrder(detail.id)} confirmLabel={undefined} cancelLabel="Tutup">
        {detail ? (
          <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 text-xs text-slate-500">
                  <CalendarDays size={16} />
                  <span>{detail.created_at ? new Date(detail.created_at).toLocaleString('id-ID') : '-'}</span>
                </div>
              </div>
              <div className="self-start">
                <span className={
                  `inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ` +
                  (detail.order_status === 'Menunggu Pembayaran' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                   detail.order_status === 'Lunas' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                   detail.order_status === 'Diproses' ? 'bg-sky-50 text-sky-700 border-sky-200' :
                   detail.order_status === 'Dikirim' ? 'bg-violet-50 text-violet-700 border-violet-200' :
                   detail.order_status === 'Selesai' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                   detail.order_status === 'Dibatalkan' ? 'bg-red-50 text-red-700 border-red-200' :
                   'bg-slate-100 text-slate-700 border-slate-200')
                }>
                  {detail.order_status || 'Unknown'}
                </span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-3">
                  <Package size={18} />
                  <span>Order Code</span>
                </div>
                <div className="text-sm text-slate-800">{detail.order_code}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-3">
                  <CalendarDays size={18} />
                  <span>Tanggal</span>
                </div>
                <div className="text-sm text-slate-800">{detail.created_at ? new Date(detail.created_at).toLocaleString('id-ID') : '-'}</div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <User size={18} />
                  <span>Informasi Pembeli</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-slate-500">Nama</div>
                    <div className="text-sm text-slate-800 font-medium">{detail.user?.username || 'Pengguna'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Nomor Telepon</div>
                    <div className="text-sm text-slate-800 font-medium">{detail.user?.phone || 'No telepon tidak tersedia'}</div>
                  </div>
                  {detail.user?.email ? (
                    <div>
                      <div className="text-xs text-slate-500">Email</div>
                      <div className="text-sm text-slate-800 font-medium">{detail.user.email}</div>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <MapPinned size={18} />
                  <span>Alamat Pengiriman</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-slate-500">Nama Penerima</div>
                    <div className="text-sm text-slate-800 font-medium">{detail.recipient_name || '-'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Nomor HP</div>
                    <div className="text-sm text-slate-800 font-medium">{detail.recipient_phone || '-'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Alamat Lengkap</div>
                    <div className="text-sm text-slate-800 font-medium">{detail.address_detail || '-'}</div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-slate-500">Kelurahan</div>
                      <div className="text-sm text-slate-800 font-medium">{detail.village || '-'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Kecamatan</div>
                      <div className="text-sm text-slate-800 font-medium">{detail.district || '-'}</div>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-slate-500">Kota</div>
                      <div className="text-sm text-slate-800 font-medium">{detail.city || '-'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Kode Pos</div>
                      <div className="text-sm text-slate-800 font-medium">{detail.postal_code || '-'}</div>
                    </div>
                  </div>
                  {detail.latitude !== undefined && detail.longitude !== undefined && detail.latitude !== null && detail.longitude !== null ? (
                    <div className="space-y-2">
                      <div>
                        <div className="text-xs text-slate-500">Koordinat</div>
                        <div className="text-sm text-slate-800 font-medium">{String(detail.latitude)}, {String(detail.longitude)}</div>
                      </div>
                      <a target="_blank" rel="noreferrer" href={`https://www.google.com/maps?q=${detail.latitude},${detail.longitude}`} className="inline-flex items-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 transition">
                        <Navigation size={16} />
                        Lihat di Google Maps
                      </a>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <ClipboardList size={18} />
                  <span>Daftar Produk</span>
                </div>
                <div className="text-xs text-slate-800">{(detail.items || []).length} item</div>
              </div>
              <div className="space-y-3">
                {(detail.items || []).map((it:any)=> {
                  const med = it.medicine || it.medicines || null
                  return (
                    <div key={it.id} className="rounded-xl border border-slate-200 bg-white p-4">
                      <div className="flex gap-4 items-center">
                        <img src={med?.foto_url || '/images/no-image.png'} alt={med?.nama_obat || it.name || 'Produk'} className="w-20 h-20 rounded-xl object-cover border border-slate-200" />
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-slate-900">{med?.nama_obat || it.name || 'Produk'}</div>
                          <div className="mt-2 inline-flex items-center rounded-full bg-slate-100 px-1 py-1 text-xs font-semibold text-slate-700">{it.quantity} qty</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-slate-700">{formatRp(it.price)}</div>
                          <div className="mt-2 text-sm font-semibold text-slate-900">{formatRp(it.subtotal)}</div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Wallet size={18} />
                  <span>Ringkasan Pembayaran</span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Subtotal</span>
                    <span>{formatRp(detail.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Ongkir</span>
                    <span>{formatRp(detail.shipping_cost)}</span>
                  </div>
                  <div className="h-px bg-slate-200 my-2" />
                  <div className="flex justify-between items-center text-xl font-bold text-sky-700">
                    <span>TOTAL</span>
                    <span>{formatRp(detail.total_amount)}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <PackageCheck size={18} />
                  <span>Status Pesanan</span>
                </div>
                <div>
                  <label htmlFor="order-status-select" className="block text-xs text-slate-500 mb-2">Pilih status pesanan</label>
                  <select id="order-status-select" defaultValue={detail.order_status} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900">
                    <option>Menunggu Pembayaran</option>
                    <option>Lunas</option>
                    <option>Diproses</option>
                    <option>Dikirim</option>
                    <option>Selesai</option>
                    <option>Dibatalkan</option>
                  </select>
                </div>
                <button onClick={()=>{
                  const sel = document.getElementById('order-status-select') as HTMLSelectElement | null
                  if (sel) askUpdateStatus(detail.id, sel.value)
                }} className="w-full rounded-xl bg-sky-500 hover:bg-sky-600 text-white py-3 font-medium transition">
                  Update Status
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>

    </div>
  )
}
