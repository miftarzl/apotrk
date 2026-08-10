"use client"
import React, { useEffect, useState } from 'react'
import Modal from '@/components/ui/Modal'
import toast from 'react-hot-toast'
import { Eye, Trash2 } from 'lucide-react'

export default function AdminPrescriptions(){
  const [list, setList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selected, setSelected] = useState<any | null>(null)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [adminNotes, setAdminNotes] = useState('')
  const [deleteOpen, setDeleteOpen] = useState(false)

  // items & medicines for selecting
  const [items, setItems] = useState<any[]>([])
  const [meds, setMeds] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [addingMedicineId, setAddingMedicineId] = useState<number | null>(null)
  const [addingQty, setAddingQty] = useState<number>(1)

  useEffect(()=>{ loadList(); loadMeds() }, [])

  async function loadList(){
    setLoading(true)
    try{
      const backend = process.env.NEXT_PUBLIC_BACKEND_URL || ''
      const r = await fetch(`${backend}/api/admin/prescriptions`, { credentials: 'include' })
      const j = await r.json()
      setList(Array.isArray(j)? j.sort((a, b) => a.id - b.id): [])
    }catch(e){ console.error(e); toast.error('Gagal memuat daftar resep') }
    setLoading(false)
  }

  async function loadMeds(){
    try{
      const backend = process.env.NEXT_PUBLIC_BACKEND_URL || ''
      const r = await fetch(`${backend}/api/medicines`, { credentials: 'include' })
      const j = await r.json()
      setMeds(Array.isArray(j) ? j : [])
    }catch(e){ console.error(e) }
  }

  async function openDetail(id:number){
    try{
      const backend = process.env.NEXT_PUBLIC_BACKEND_URL || ''
      const r = await fetch(`${backend}/api/admin/prescriptions/${id}`, { credentials: 'include' })
      const j = await r.json()
      setSelected(j)
      setAdminNotes(j?.admin_notes || '')
      setDetailOpen(true)
      // load items
      const it = await fetch(`${backend}/api/admin/prescriptions/${id}/items`, { credentials: 'include' })
      const itj = await it.json()
      setItems(Array.isArray(itj) ? itj : [])
    }catch(e){ console.error(e); toast.error('Gagal memuat detail') }
  }

  async function saveAdminNotes(){
    if (!selected) return
    try{
      const backend = process.env.NEXT_PUBLIC_BACKEND_URL || ''
      const r = await fetch(`${backend}/api/admin/prescriptions/${selected.id}/status`, { method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ admin_notes: adminNotes }) })
      const j = await r.json()
      if (!r.ok) throw new Error(j?.error || 'Error')
      toast.success('Catatan admin disimpan')
      setSelected(j)
      loadList()
    }catch(e){ console.error(e); toast.error('Gagal menyimpan catatan admin') }
  }

  async function doProcess(){
    if (!selected) return
    try{
      const backend = process.env.NEXT_PUBLIC_BACKEND_URL || ''
      const r = await fetch(`${backend}/api/admin/prescriptions/${selected.id}/status`, { method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'Diproses' }) })
      const j = await r.json()
      if (!r.ok) throw new Error(j?.error || 'Error')
      toast.success('Resep diproses')
      setSelected(j)
      loadList()
    }catch(e){ console.error(e); toast.error('Gagal memproses resep') }
  }

  async function doRejectSave(){
    if (!selected) return
    try{
      const backend = process.env.NEXT_PUBLIC_BACKEND_URL || ''
      const r = await fetch(`${backend}/api/admin/prescriptions/${selected.id}/status`, { method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'Ditolak', rejection_reason: rejectReason }) })
      const j = await r.json()
      if (!r.ok) throw new Error(j?.error || 'Error')
      toast.success('Resep ditolak')
      setRejectOpen(false)
      setDetailOpen(false)
      loadList()
    }catch(e){ console.error(e); toast.error('Gagal menolak resep') }
  }

  async function addItem(){
    if (!selected || !addingMedicineId) return
    try{
      const backend = process.env.NEXT_PUBLIC_BACKEND_URL || ''
      const r = await fetch(`${backend}/api/admin/prescriptions/${selected.id}/items`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ medicine_id: addingMedicineId, quantity: addingQty }) })
      const j = await r.json()
      if (!r.ok) throw new Error(j?.error || 'Error')
      toast.success('Obat ditambahkan')
      // reload items
      const it = await fetch(`${backend}/api/admin/prescriptions/${selected.id}/items`, { credentials: 'include' })
      const itj = await it.json()
      setItems(Array.isArray(itj) ? itj : [])
    }catch(e){ console.error(e); toast.error('Gagal menambahkan obat') }
  }

  async function removeItem(id:number){
    try{
      const backend = process.env.NEXT_PUBLIC_BACKEND_URL || ''
      const r = await fetch(`${backend}/api/admin/prescriptions/items/${id}`, { method: 'DELETE', credentials: 'include' })
      const j = await r.json().catch(()=>null)
      if (!r.ok) throw new Error(j?.error || 'Error')
      toast.success('Item dihapus')
      if (selected) {
        const it = await fetch(`${backend}/api/admin/prescriptions/${selected.id}/items`, { credentials: 'include' })
        const itj = await it.json()
        setItems(Array.isArray(itj) ? itj : [])
      }
    }catch(e){ console.error(e); toast.error('Gagal menghapus item') }
  }

  async function updateItemQuantity(itemId:number, quantity:number){
    if (!selected) return
    try{
      const backend = process.env.NEXT_PUBLIC_BACKEND_URL || ''
      const r = await fetch(`${backend}/api/admin/prescriptions/items/${itemId}`, { method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ quantity }) })
      const j = await r.json().catch(()=>null)
      if (!r.ok) throw new Error(j?.error || 'Error')
      // reload items and selected
      const it = await fetch(`${backend}/api/admin/prescriptions/${selected.id}/items`, { credentials: 'include' })
      const itj = await it.json()
      setItems(Array.isArray(itj) ? itj : [])

      const sel = await fetch(`${backend}/api/admin/prescriptions/${selected.id}`, { credentials: 'include' })
      const selj = await sel.json()
      setSelected(selj)

      toast.success('Jumlah diperbarui')
    }catch(e){ console.error(e); toast.error('Gagal memperbarui jumlah') }
  }

  async function markReady(){
    if (!selected) return
    if ((items || []).length === 0) { toast.error('Tambahkan minimal 1 obat sebelum menandai Siap Dibeli'); return }
    try{
      const backend = process.env.NEXT_PUBLIC_BACKEND_URL || ''
      const r = await fetch(`${backend}/api/admin/prescriptions/${selected.id}/status`, { method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'Siap Dibeli' }) })
      const j = await r.json()
      if (!r.ok) throw new Error(j?.error || 'Error')
      toast.success('Obat berhasil dimasukkan ke keranjang user')
      setDetailOpen(false)
      loadList()
    }catch(e){ console.error(e); toast.error('Gagal menandai siap dibeli') }
  }

  async function doDelete(){
    if (!selected) return
    try{
      const backend = process.env.NEXT_PUBLIC_BACKEND_URL || ''
      const r = await fetch(`${backend}/api/admin/prescriptions/${selected.id}`, { method: 'DELETE', credentials: 'include' })
      const j = await r.json().catch(()=>null)
      if (!r.ok) throw new Error(j?.error || 'Error')
      toast.success('Resep berhasil dihapus')
      setDeleteOpen(false)
      setDetailOpen(false)
      setSelected(null)
      loadList()
    }catch(e){ console.error(e); toast.error('Gagal menghapus resep') }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="max-w-6xl mx-auto px-4">
      <h2 className="text-2xl font-semibold mb-4">Kelola Resep</h2>

      <div className="rounded-xl bg-white/5 border border-white/6 overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-white/3 sticky top-0 backdrop-blur-sm">
              <tr>
                <th className="text-left p-3 text-sm text-slate-300 w-14">ID</th>
                <th className="text-left p-3 text-sm text-slate-300 w-48">Foto Resep</th>
                <th className="text-left p-3 text-sm text-slate-300">Nama User</th>
                <th className="text-left p-3 text-sm text-slate-300">Catatan</th>
                <th className="text-left p-3 text-sm text-slate-300">Status</th>
                <th className="text-left p-3 text-sm text-slate-300">Waktu</th>
                <th className="text-center p-3 text-sm text-slate-300">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {list.map(p => (
                <tr key={p.id} className="border-b border-white/6 hover:bg-white/2 align-top">
                  <td className="p-3 text-sm text-slate-200">{p.id}</td>
                  <td className="p-3"><img src={p.image_url} alt={`resep-${p.id}`} className="w-28 h-20 object-cover rounded"/></td>
                  <td className="p-3 text-sm text-white">{(p.user && (p.user.username || p.user.name)) || '-'}</td>
                  <td className="p-3 text-sm text-slate-300 max-w-[240px] truncate">{p.notes || '-'}</td>
                  <td className="p-3 text-sm">
                    {p.status === 'Menunggu Verifikasi' && <span className="px-2 py-1 rounded-full bg-yellow-400 text-black text-xs">Menunggu Verifikasi</span>}
                    {p.status === 'Diproses' && <span className="px-2 py-1 rounded-full bg-sky-600 text-white text-xs">Diproses</span>}
                    {p.status === 'Siap Dibeli' && <span className="px-2 py-1 rounded-full bg-emerald-600 text-white text-xs">Siap Dibeli</span>}
                    {p.status === 'Ditolak' && <span className="px-2 py-1 rounded-full bg-red-600 text-white text-xs">Ditolak</span>}
                  </td>
                  <td className="p-3 text-sm text-slate-300">{new Date(p.created_at).toLocaleString()}</td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={()=>openDetail(p.id)} className="inline-flex items-center justify-center px-3 py-2 rounded-lg bg-sky-500 hover:bg-sky-600 text-white transition">
                        <Eye size={16}/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Custom detail modal (replace default Modal to control footer buttons) */}
      {detailOpen && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setDetailOpen(false); setSelected(null) }} />

          <div className="relative z-10 w-full max-w-[1100px] max-h-[90vh] overflow-y-auto rounded-2xl bg-white text-slate-800 shadow-2xl p-6">
            <h3 className="text-xl font-semibold mb-4 text-slate-800">{`Detail Resep #${selected.id || ''}`}</h3>

            <div className="mb-6">
              <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">

                {/* KIRI */}
                <div>
                  <img src={selected.image_url} alt="foto resep" className="w-full h-56 object-contain rounded-xl border border-slate-200 bg-slate-50" />

                  <div className="mt-4 space-y-3">

                    <div>
                      <div className="text-xs text-slate-500">Nama User</div>
                      <div className="text-sm text-slate-800">{selected.user?.username || selected.user?.name || '-'}</div>
                    </div>

                    <div>
                      <div className="text-xs text-slate-500">Email</div>
                      <div className="text-sm text-slate-800">{selected.user?.email || '-'}</div>
                    </div>

                    <div>
                      <div className="text-xs text-slate-500">Telepon</div>
                      <div className="text-sm text-slate-800">{selected.user?.phone || '-'}</div>
                    </div>

                    <div>
                      <div className="text-xs text-slate-500">Status</div>
                      {selected.status === 'Menunggu Verifikasi' && (<span className="inline-block px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs">Menunggu Verifikasi</span>)}
                      {selected.status === 'Diproses' && (<span className="inline-block px-3 py-1 rounded-full bg-sky-100 text-sky-700 text-xs">Diproses</span>)}
                      {selected.status === 'Siap Dibeli' && (<span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs">Siap Dibeli</span>)}
                      {selected.status === 'Ditolak' && (<span className="inline-block px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs">Ditolak</span>)}
                    </div>

                    <div>
                      <div className="text-xs text-slate-500 mb-1">Catatan Pengguna</div>
                      <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs">{selected.notes || '-'}</div>
                    </div>

                    {selected.rejection_reason && (
                      <div>
                        <div className="text-xs text-red-600 mb-1">Alasan Penolakan</div>
                        <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200">{selected.rejection_reason}</div>
                      </div>
                    )}

                  </div>
                </div>

                {/* KANAN */}
                <div>

                  {selected.status === 'Diproses' && (
                    <>
                      <h4 className="text-sm font-semibold mb-3">Kelola Obat Resep</h4>

                      <div className="flex gap-2 mb-3">

                        <input placeholder="Cari nama obat atau kandungan..." className="flex-1 rounded-lg border border-slate-300 px-3 h-9 text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />

                        <input type="number" min={1} className="w-16 h-9 text-sm rounded-lg border border-slate-300 px-2 text-center" value={addingQty} onChange={(e) => setAddingQty(Number(e.target.value || 1))} />

                        <button className="px-3 py-1.5 text-sm rounded-lg bg-sky-600 hover:bg-sky-700 text-white" onClick={addItem}>Tambah</button>

                      </div>

                      {/* LIST OBAT */}
                      <div className="max-h-52 overflow-y-auto border border-slate-200 rounded-xl">

                        {meds
                          .filter(
                            (m) => (m.nama_obat || '').toLowerCase().includes(search.toLowerCase()) || (m.kandungan || '').toLowerCase().includes(search.toLowerCase())
                          )
                          .slice(0, 20)
                          .map((m) => (
                            <div key={m.id} className="flex items-center justify-between px-3 py-2 border-b border-slate-100 hover:bg-slate-50">
                              <div>
                                <div className="font-medium text-xs">{m.nama_obat}</div>
                                <div className="text-xs text-slate-500">{m.kandungan}</div>
                              </div>
                              <input type="radio" name="pickmed" checked={addingMedicineId === m.id} onChange={() => setAddingMedicineId(m.id)} />
                            </div>
                          ))}

                      </div>
                    </>
                  )}

                  {(selected.status === 'Diproses' || selected.status === 'Siap Dibeli') && (
                    <div className="mb-5">
                      <h4 className="text-sm font-semibold mb-3">Catatan Admin</h4>
                      <textarea
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm resize-none"
                        rows={5}
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder="Tulis catatan untuk pengguna..."
                      />
                      <button
                        type="button"
                        className="mt-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl px-4 py-2"
                        onClick={saveAdminNotes}
                      >
                        Simpan Catatan
                      </button>
                    </div>
                  )}

                  {/* DAFTAR OBAT RESEP */}
                  <div className="mt-5">
                    <h4 className="text-sm font-semibold mb-2">Daftar Obat Resep</h4>

                    <div className="border border-slate-200 rounded-xl overflow-hidden">

                      {(!items || items.length === 0) ? (
                        <div className="p-4 text-center text-slate-500">{selected.status === 'Diproses' ? 'Tidak ada obat yang dipilih.' : 'Belum ada obat yang dipilih'}</div>
                      ) : (
                        <table className="w-full">

                          <thead className="bg-slate-100">
                            <tr>
                              <th className="text-left p-3 text-xs">Nama Obat</th>
                              <th className="text-center p-3 w-28 text-xs">Qty</th>
                              <th className="text-center p-3 w-24 text-xs">Aksi</th>
                            </tr>
                          </thead>

                          <tbody>
                            {items.map((it) => (
                              <tr key={it.id} className="border-t">
                                <td className="p-3 text-sm">{it.medicines?.nama_obat}</td>

                                <td className="text-center">
                                  {(selected.status === 'Diproses' || selected.status === 'Siap Dibeli') ? (
                                    <div className="inline-flex items-center gap-2">
                                      <button className="inline-flex items-center justify-center p-1.5 rounded bg-slate-200 hover:bg-slate-300 text-sm" onClick={()=>updateItemQuantity(it.id, Math.max(1, Number(it.quantity || 1) - 1))}>-</button>
                                      <input value={it.quantity} onChange={(e)=>{
                                        const v = Number(e.target.value || 1)
                                        // optimistic update locally
                                        setItems(prev => prev.map(x=> x.id===it.id ? {...x, quantity: v} : x))
                                      }} onBlur={(e)=>{ const v = Number(e.target.value || 1); updateItemQuantity(it.id, Math.max(1, v)) }} className="w-16 h-9 text-sm text-center rounded border border-slate-200" />
                                      <button className="inline-flex items-center justify-center p-1.5 rounded bg-slate-200 hover:bg-slate-300 text-sm" onClick={()=>updateItemQuantity(it.id, Number(it.quantity || 1) + 1)}>+</button>
                                    </div>
                                  ) : (
                                    <div className="text-sm">{it.quantity}</div>
                                  )}
                                </td>

                                <td className="text-center">
                                  {(selected.status === 'Diproses' || selected.status === 'Siap Dibeli') ? (
                                    <button className="inline-flex items-center justify-center p-1.5 rounded bg-red-600 hover:bg-red-700 text-white" onClick={()=>removeItem(it.id)}>
                                      <Trash2 size={16} />
                                    </button>
                                  ) : (
                                    <span className="text-slate-500 text-xs">Read only</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>

                        </table>
                      )}

                    </div>
                  </div>

                  {/* Action buttons per status */}
                  {selected.status === 'Menunggu Verifikasi' && (
                    <div className="flex justify-end gap-2 mt-5">
                      <button className="px-3 py-1.5 text-sm rounded-lg bg-emerald-600 text-black" onClick={doProcess}>Proses</button>
                      <button className="px-3 py-1.5 text-sm rounded-lg bg-red-600 text-white" onClick={()=>setDeleteOpen(true)}>Hapus Resep</button>
                    </div>
                  )}

                  {selected.status === 'Diproses' && (
                    <div className="flex justify-end gap-2 mt-5">
                      <button className="px-3 py-1.5 text-sm rounded-lg bg-red-600 text-white" onClick={() => setRejectOpen(true)}>Tolak</button>
                      <button className="px-3 py-1.5 text-sm rounded-lg bg-emerald-600 text-white" onClick={markReady}>Tandai Siap Dibeli</button>
                      <button className="px-3 py-1.5 text-sm rounded-lg bg-red-600 text-white" onClick={()=>setDeleteOpen(true)}>Hapus Resep</button>
                    </div>
                  )}

                  {(selected.status === 'Siap Dibeli' || selected.status === 'Ditolak') && (
                    <div className="flex justify-end gap-2 mt-5">
                      <button className="px-3 py-1.5 text-sm rounded-lg bg-red-600 text-white" onClick={()=>setDeleteOpen(true)}>Hapus Resep</button>
                    </div>
                  )}

                </div>

              </div>
            </div>

            <div className="flex justify-end">
              <button className="px-3 py-1.5 text-sm rounded-lg bg-slate-600 hover:bg-slate-700 text-white" onClick={()=>{ setDetailOpen(false); setSelected(null) }}>Tutup</button>
            </div>

          </div>
        </div>
      )}

      <Modal open={rejectOpen} title="Tolak Resep" onClose={()=>setRejectOpen(false)} onConfirm={doRejectSave} confirmLabel="Simpan" cancelLabel="Batal">
        <div>
          <textarea className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-100"
            rows={5}
            value={rejectReason}
            onChange={e=>setRejectReason(e.target.value)}
            placeholder="Masukkan alasan penolakan resep..."
          />
        </div>
      </Modal>
      <Modal open={deleteOpen} title="Hapus Resep" onClose={()=>setDeleteOpen(false)} onConfirm={doDelete} confirmLabel="Ya, Hapus" cancelLabel="Batal">
        <div>
          <div className="p-2">Apakah Anda yakin ingin menghapus resep ini? Tindakan ini tidak bisa dibatalkan.</div>
        </div>
      </Modal>
    </div>
  )
}
