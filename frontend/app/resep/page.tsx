"use client"
import React, { useEffect, useState } from 'react'
import Protected from '@/components/Protected'
import Modal from '@/components/ui/Modal'
import toast from 'react-hot-toast'
import { Trash2, Eye } from 'lucide-react'

type Presc = {
  id: number
  image_url: string
  notes?: string
  admin_notes?: string | null
  status?: string
  rejection_reason?: string | null
  created_at?: string
}

export default function ResepPage(){
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const [data, setData] = useState<Presc[]>([])
  const [loadingData, setLoadingData] = useState(true)

  const [detailOpen, setDetailOpen] = useState(false)
  const [detailItem, setDetailItem] = useState<Presc | null>(null)
  const [detailItems, setDetailItems] = useState<any[]>([])

  const [deleteTarget, setDeleteTarget] = useState<Presc | null>(null)
  const [deleting, setDeleting] = useState(false)

  const backend = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || ''

  useEffect(()=>{ if (file) setPreview(URL.createObjectURL(file)); return ()=>{ if (preview) URL.revokeObjectURL(preview) } }, [file])

  useEffect(()=>{ load() }, [])

  async function load(){
    setLoadingData(true)
    try{
      const res = await fetch(`${backend}/api/prescriptions`, {
        credentials: 'include'
      })

      const json = await res.json().catch(()=>([]))

      const arr = Array.isArray(json)
        ? json
        : (json.data || [])

      setData(
        arr.sort(
          (a: Presc, b: Presc) =>
            Number(a.id) - Number(b.id)
        )
      )

    }catch(e){
      console.error(e)
      toast.error('Gagal memuat data resep')
    }
    setLoadingData(false)
  }

  function fmtDate(d?: string){ if (!d) return ''; try{ const dt = new Date(d); return dt.toLocaleString() }catch(e){ return d } }

  function statusColor(s?: string){
    if (!s) return 'bg-gray-200 text-gray-800'
    if (s === 'Menunggu Verifikasi') return 'bg-yellow-100 text-yellow-800'
    if (s === 'Diproses') return 'bg-sky-100 text-sky-700'
    if (s === 'Siap Dibeli') return 'bg-emerald-100 text-emerald-800'
    if (s === 'Ditolak') return 'bg-red-100 text-red-700'
    return 'bg-gray-100 text-gray-800'
  }

  async function handleSubmit(e?: React.FormEvent){
    e?.preventDefault()
    if (!file) return toast.error('Foto resep wajib diupload')
    setLoading(true)
    try{
      // upload to backend storage endpoint
      const fd = new FormData()
      fd.append('file', file)
      const up = await fetch(`${backend}/api/admin/upload`, { method: 'POST', body: fd, credentials: 'include' })
      const upj = await up.json().catch(()=>({}))
      if (!up.ok) throw new Error(upj?.error || 'Upload gagal')
      const image_url = upj.publicUrl || upj.publicUrl || ''

      const r = await fetch(`${backend}/api/prescriptions`, { method: 'POST', headers: { 'Content-Type':'application/json' }, credentials: 'include', body: JSON.stringify({ image_url, notes }) })
      const jr = await r.json().catch(()=>({}))
      if (!r.ok) throw new Error(jr?.error || 'Gagal menyimpan resep')
      toast.success('Resep berhasil dikirim')
      setFile(null); setPreview(null); setNotes('')
      load()
    }catch(e:any){ console.error(e); toast.error(String(e.message || e)) }
    setLoading(false)
  }

  async function confirmDelete(){
    if (!deleteTarget) return
    setDeleting(true)
    try{
      const r = await fetch(`${backend}/api/prescriptions/${deleteTarget.id}`, { method: 'DELETE', credentials: 'include' })
      if (!r.ok) throw new Error('Gagal menghapus')
      toast.success('Resep dihapus')
      setDeleteTarget(null)
      load()
    }catch(e){ console.error(e); toast.error('Gagal menghapus resep') }
    setDeleting(false)
  }

  return (
    <Protected>
      <main className="min-h-screen pt-[88px] pb-14">
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6 items-start">

            <div className="lg:sticky lg:top-24 rounded-[1.8rem] bg-white p-5 shadow-sm ring-1 ring-slate-200 self-start">
              <h2 className="text-lg font-semibold text-slate-800">Form Resep Dokter</h2>
              <p className="text-xs text-slate-500">Upload foto resep dan tambahkan catatan.</p>

              <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
                <div>
                  <label className="text-sm font-medium text-slate-700">Upload Foto Resep *</label>
                  <input type="file" accept="image/*" onChange={(e)=>{ const f = e.target.files?.[0] || null; setFile(f); }} className="mt-2 w-full" />
                  {preview && (
                    <img src={preview} alt="preview" className="mt-2 h-28 w-full object-contain rounded-lg border border-slate-200 bg-slate-50"/>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">Catatan Tambahan</label>
                  <textarea value={notes} onChange={(e)=>setNotes(e.target.value)} className="mt-2 h-24 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100" />
                </div>

                <div className="flex gap-2 pt-1">
                  <button type="submit" disabled={loading} className="flex-1 rounded-2xl bg-sky-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-sky-700 disabled:opacity-70">{loading ? 'Mengirim...' : 'Kirim Resep'}</button>
                </div>
              </form>
            </div>

            <section>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl md:text-2xl font-semibold text-slate-800">Riwayat Resep Saya</h3>
                  <p className="mt-1 text-xs md:text-sm text-slate-500">Menampilkan daftar resep yang Anda kirim</p>
                </div>
              </div>

              <div className="mt-4 overflow-x-auto rounded-xl bg-white p-2 border border-slate-200 shadow-sm">
                <table className="min-w-full table-auto">
                  <thead className="bg-white/3 sticky top-0">
                    <tr>
                      <th className="p-3 text-left text-sm text-slate-500">Foto Resep</th>
                      <th className="p-3 text-left text-sm text-slate-500">Catatan</th>
                      <th className="p-3 text-left text-sm text-slate-500">Status</th>
                      <th className="p-3 text-left text-sm text-slate-500">Tanggal Upload</th>
                      <th className="p-3 text-center text-sm text-slate-500">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingData && (
                      <tr><td colSpan={6} className="p-4 text-slate-500">Memuat...</td></tr>
                    )}
                    {!loadingData && data.length === 0 && (
                      <tr><td colSpan={6} className="p-4 text-slate-500">Belum ada resep</td></tr>
                    )}
                    {data.map((r)=> (
                      <tr key={r.id} className="border-b hover:bg-slate-50">
                        <td className="p-3"><img src={r.image_url} alt="foto" className="h-20 w-28 object-cover rounded-lg border border-slate-200" /></td>
                        <td className="p-3 text-slate-700 max-w-xs break-words">{r.notes || '-'}</td>
                        <td className="p-3"><span className={`inline-block px-3 py-1 text-sm rounded-full ${statusColor(r.status)}`}>{r.status}</span></td>
                        <td className="p-3 text-slate-600 whitespace-nowrap">{fmtDate(r.created_at)}</td>
                        <td className="p-3 text-center">
                          <button title="Detail" onClick={async()=>{ setDetailItem(r); setDetailOpen(true); try{ const res = await fetch(`${backend}/api/prescriptions/${r.id}`, { credentials:'include' }); if (res.ok){ const j = await res.json(); setDetailItems(j.items || []) } else { setDetailItems([]) } }catch(e){ console.error(e); setDetailItems([]) } }} className="inline-flex items-center justify-center px-3 py-1 rounded bg-slate-100 text-slate-700 mr-2"><Eye size={16} /></button>
                          {r.status === 'Menunggu Verifikasi' && (
                            <button title="Hapus" onClick={()=>setDeleteTarget(r)} className="inline-flex items-center justify-center px-3 py-1 rounded bg-red-600 text-white"><Trash2 size={16} /></button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

          </div>
        </section>

        <Modal open={!!deleteTarget} title="Hapus Resep" onClose={()=>setDeleteTarget(null)} onConfirm={confirmDelete} loading={deleting}>
          <div>Apakah Anda yakin ingin menghapus resep ini?</div>
        </Modal>

          <Modal
            open={detailOpen}
            title="Detail Resep"
            onClose={() => {
              setDetailOpen(false)
              setDetailItem(null)
              setDetailItems([])
            }}
            confirmLabel="Tutup"
            cancelLabel=""
            onConfirm={() => {
              setDetailOpen(false)
              setDetailItem(null)
              setDetailItems([])
            }}
          >
            {detailItem ? (
            <div className="w-full max-w-[900px]">

              <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6">

                {/* KIRI */}
                <div>

                  <img
                    src={detailItem.image_url}
                    alt="Resep"
                    className="
                      w-full
                      h-64
                      object-contain
                      rounded-xl
                      border
                      border-slate-200
                      bg-slate-50
                    "
                  />

                  <div className="mt-4">
                    <h4 className="font-semibold text-slate-800">
                      Status
                    </h4>

                    <span
                      className={`inline-block mt-2 px-3 py-1 rounded-full text-sm ${statusColor(detailItem.status)}`}
                    >
                      {detailItem.status}
                    </span>

                  </div>

                  <div className="mt-4">
                    <h4 className="font-semibold text-slate-800">
                      Catatan Pengguna
                    </h4>

                    <p className="mt-2 text-sm text-slate-600 whitespace-pre-wrap">
                      {detailItem.notes || '-'}
                    </p>
                  </div>

                  {detailItem.status === 'Ditolak' && (
                    <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                      <strong>Alasan Penolakan</strong>
                      <br />
                      {detailItem.rejection_reason || '-'}
                    </div>
                  )}

                  {detailItem.admin_notes && (
                    <div className="mt-4 rounded-xl border border-sky-200 bg-sky-50 p-4">
                      <h4 className="text-sm font-semibold text-slate-800">Catatan dari Apoteker</h4>
                      <p className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">{detailItem.admin_notes}</p>
                    </div>
                  )}

                </div>

                {/* KANAN */}
                <div>

                  <h4 className="text-lg font-semibold text-slate-800 mb-3">
                    Obat yang Dipilih Apoteker
                  </h4>

                  {detailItems?.length > 0 ? (

                    <div className="rounded-xl border border-slate-200 overflow-hidden">

                      <table className="w-full">

                        <thead className="bg-slate-100">
                          <tr>
                            <th className="p-3 text-left text-slate-700">
                              Nama Obat
                            </th>

                            <th className="p-3 text-center text-slate-700 w-32">
                              Jumlah
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {detailItems.map((it) => (
                            <tr
                              key={it.id}
                              className="border-t border-slate-200"
                            >
                              <td className="p-3 text-slate-700">
                                {it.medicines?.nama_obat || '-'}
                              </td>

                              <td className="p-3 text-center text-slate-700">
                                {it.quantity}
                              </td>
                            </tr>
                          ))}
                        </tbody>

                      </table>

                    </div>

                  ) : (

                    <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-slate-500">
                      Belum ada obat yang dipilih apoteker.
                    </div>

                  )}

                  {detailItem.status === 'Siap Dibeli' && (

                    <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 p-4">

                      <p className="text-sm text-emerald-800">
                        Obat telah diverifikasi dan dimasukkan ke keranjang Anda.
                      </p>

                      <a
                        href="/cart"
                        className="
                          inline-flex
                          items-center
                          mt-3
                          px-4
                          py-2
                          rounded-lg
                          bg-emerald-600
                          hover:bg-emerald-700
                          text-white
                          text-sm
                          font-medium
                        "
                      >
                        Lihat Keranjang
                      </a>

                    </div>

                  )}

                </div>

              </div>

            </div>
          ) : null}
          </Modal>

      </main>
    </Protected>
  )
}
