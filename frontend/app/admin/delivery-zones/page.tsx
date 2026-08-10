"use client"
import React, { useEffect, useState } from 'react'
import { adminFetch } from '@/lib/adminApi'
import toast from 'react-hot-toast'
import { ConfirmationModal } from '@/components/ui'
import { Edit, Plus, Trash2 } from 'lucide-react'

export default function DeliveryZonesPage(){
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 10
  const [editing, setEditing] = useState<any | null>(null)
  const [creating, setCreating] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(()=>{ load() }, [])

  async function load() {
    setLoading(true)
    try {
        const data = await adminFetch('/admin/delivery_zones')

        if (Array.isArray(data)) {
        setItems(
            data.slice().sort(
            (a: any, b: any) => Number(a.id) - Number(b.id)
            )
        )
        }
    } catch (e) {
        console.error(e)
        toast.error('Gagal memuat data')
    } finally {
        setLoading(false)
    }
    }

  const filtered = items.filter(i=>{
    const q = search.toLowerCase()
    return !q || (''+ (i.village||'')).toLowerCase().includes(q)
  })
  const paged = filtered.slice((page-1)*pageSize, page*pageSize)

  async function saveEdit(){
    if (!editing) return
    try{
      const body = { village: editing.village, shipping_cost: editing.shipping_cost }
      await adminFetch(`/admin/delivery_zones/${editing.id}`, { method: 'PUT', body: JSON.stringify(body) })
      toast.success('Ongkir diperbarui')
      setEditing(null)
      load()
    }catch (e) {
    console.error(e)

    const err =
        e instanceof Error
        ? e.message
        : 'Gagal menyimpan'

    toast.error(err)
    }
  }

  async function createSave(){
    try{
      const body = { village: editing?.village, shipping_cost: editing?.shipping_cost }
      await adminFetch('/admin/delivery_zones', { method: 'POST', body: JSON.stringify(body) })
      toast.success('Ongkir ditambahkan')
      setEditing(null)
      setCreating(false)
      load()
    }catch(e){ console.error(e); toast.error('Gagal menambahkan') }
  }

  function askDelete(id:any){
    setDeleteTarget(id)
  }

  async function confirmDelete(){
    if (!deleteTarget) return
    setDeleteLoading(true)
    try{
      await adminFetch(`/admin/delivery_zones/${deleteTarget}`, { method: 'DELETE' })
      toast.success('Ongkir dihapus')
      load()
      setDeleteTarget(null)
    }catch(e){ console.error(e); toast.error('Gagal menghapus') }
    finally{ setDeleteLoading(false) }
  }

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Kelola Ongkir</h2>
        <div className="flex gap-2">
          <button
          onClick={()=>{ setCreating(true); setEditing({ village: '', shipping_cost: '' }) }}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-600"
        >
          <Plus size={16} />
          Tambah Ongkir
        </button>
        </div>
      </div>

      <div className="mb-4">
        <input
            className="p-2 rounded-lg bg-white/5 border border-white/6 w-full text-slate-100"
            placeholder="Cari nama kelurahan..." value={search} onChange={e=>{ setSearch(e.target.value); setPage(1) }} />
      </div>

      <div className="overflow-x-auto rounded-xl bg-white/5 border border-white/6 p-2">
        {loading ? <div className="py-10 text-center">Memuat...</div> : (
          <div>
            <table className="w-full text-sm">
              <thead className="bg-white/3 sticky top-0 backdrop-blur-sm">
                <tr>
                  <th className="p-2 text-left text-sm text-slate-300">ID</th>
                  <th className="p-2 text-left text-sm text-slate-300">Nama Kelurahan</th>
                  <th className="p-2 text-left text-sm text-slate-300">Ongkir</th>
                  <th className="p-2 text-left text-sm text-slate-300">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paged.map(it=> (
                  <tr key={it.id}className="border-b border-white/6 hover:bg-white/2">
                    <td className="p-3 text-sm text-slate-200">{it.id}</td>
                    <td className="p-3 text-sm text-white">{it.village}</td>
                    <td className="p-3 text-sm text-white">Rp {Number(it.shipping_cost).toLocaleString('id-ID')}</td>
                    <td className="p-3 text-sm text-white">
                      <div className="flex gap-2">
                        <button
                            title="Edit"
                            onClick={()=>setEditing(it)}
                            className="inline-flex items-center justify-center px-3 py-1 rounded bg-sky-500 text-white"
                            >
                            <Edit size={16} />
                            </button>

                            <button
                            title="Hapus"
                            onClick={()=>askDelete(it.id)}
                            className="inline-flex items-center justify-center px-3 py-1 rounded bg-red-600 text-white"
                            >
                            <Trash2 size={16} />
                            </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filtered.length === 0 && <div className="py-6 text-center text-slate-400">Belum ada data.</div>}
          </div>
        )}
      </div>

      <ConfirmationModal
        open={!!deleteTarget}
        title="Hapus Ongkir"
        description="Apakah Anda yakin ingin menghapus ongkir ini?"
        confirmText="Ya, Hapus"
        cancelText="Batal"
        variant="danger"
        loading={deleteLoading}
        onConfirm={confirmDelete}
        onCancel={()=>setDeleteTarget(null)}
      />

      {(editing && !creating) && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="w-full max-w-lg rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-xl">
            <h3 className="text-lg font-semibold mb-4 text-white">Edit Ongkir</h3>
            <div className="mb-2">
              <label className="text-sm font-medium text-slate-300">Nama Kelurahan</label>
              <input
                type="text"
                placeholder="Masukkan nama kelurahan"
                className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white placeholder:text-slate-400 focus:border-sky-500 focus:outline-none"
                value={editing.village || ''}
                onChange={e =>
                    setEditing({
                    ...editing,
                    village: e.target.value
                    })
                }
                />
            </div>
            <div className="mb-2">
              <label className="text-sm font-medium text-slate-300">Biaya Ongkir</label>
              <input type="number"
                placeholder="Masukkan biaya ongkir"
                className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white placeholder:text-slate-400 focus:border-sky-500 focus:outline-none"
                value={editing.shipping_cost ?? ''}
                onChange={e =>
                    setEditing({
                    ...editing,
                    shipping_cost: e.target.value
                    })
                }
                />
            </div>
            <div className="flex gap-2 mt-4 justify-end">
              <button
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
                onClick={() => setEditing(null)}
              >
                Batal
              </button>
              <button
                className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition"
                onClick={saveEdit}
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {(creating && editing) && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="w-full max-w-lg rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-xl">
            <h3 className="text-lg font-semibold mb-4 text-white">Tambah Ongkir</h3>
            <div className="mb-2">
              <label className="text-sm font-medium text-slate-300">Nama Kelurahan</label>
              <input
                type="text"
                placeholder="Masukkan nama kelurahan"
                className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white placeholder:text-slate-400 focus:border-sky-500 focus:outline-none"
                value={editing.village || ''}
                onChange={e =>
                    setEditing({
                    ...editing,
                    village: e.target.value
                    })
                }
                />
            </div>
            <div className="mb-2">
              <label className="text-sm font-medium text-slate-300">Biaya Ongkir</label>
              <input type="number"
                placeholder="Masukkan biaya ongkir"
                className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white placeholder:text-slate-400 focus:border-sky-500 focus:outline-none"
                value={editing.shipping_cost ?? ''}
                onChange={e =>
                    setEditing({
                    ...editing,
                    shipping_cost: e.target.value
                    })
                }
                />
            </div>
            <div className="flex gap-2 mt-4 justify-end">
              <button
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
                onClick={() => setEditing(null)}
              >
                Batal
              </button>
              <button
                className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition"
                onClick={createSave}
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
