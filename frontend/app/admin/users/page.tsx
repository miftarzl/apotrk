"use client"
import React, { useEffect, useState } from 'react'
import { adminFetch } from '@/lib/adminApi'
import toast from 'react-hot-toast'
import { ConfirmationModal } from '@/components/ui'
import { Edit, Trash2 } from 'lucide-react'

export default function UsersPage(){
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 10
  const [editing, setEditing] = useState<any | null>(null)

  useEffect(()=>{ load() }, [])

  async function load(){
    setLoading(true)
    try{
      const data = await adminFetch('/admin/users')
      if (Array.isArray(data)) setItems(data)
    }catch(e){ console.error(e); toast.error('Gagal memuat data') }
    finally{ setLoading(false) }
  }

  const filtered = items.filter(i=>{
    const q = search.toLowerCase()
    return !q || (''+ (i.username||'')).toLowerCase().includes(q) || (''+ (i.email||'')).toLowerCase().includes(q) || (''+(i.phone||'')).toLowerCase().includes(q) || (''+(i.address||'')).toLowerCase().includes(q)
  })

  const paged = filtered.slice((page-1)*pageSize, page*pageSize)

  async function saveEdit(){
    if (!editing) return
    try{
      const body = { username: editing.username, email: editing.email, phone: editing.phone, address: editing.address }
      await adminFetch(`/admin/users/${editing.id}`, { method: 'PUT', body: JSON.stringify(body) })
      toast.success('User diperbarui')
      setEditing(null)
      load()
    }catch(e){ console.error(e); toast.error('Gagal menyimpan') }
  }

  const [deleteTarget, setDeleteTarget] = useState<any | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  function askDelete(id:any){
    setDeleteTarget(id)
  }

  async function confirmDelete(){
    if (!deleteTarget) return
    setDeleteLoading(true)
    try{
      await adminFetch(`/admin/users/${deleteTarget}`, { method: 'DELETE' })
      toast.success('User dihapus')
      load()
      setDeleteTarget(null)
    }catch(e){ console.error(e); toast.error('Gagal menghapus') }
    finally{ setDeleteLoading(false) }
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Kelola User</h2>

      <div className="bg-white/5 p-4 rounded-xl mb-4 border border-white/6 shadow-sm w-full">
        <div className="flex gap-3 items-center">
          <input
            className="p-2 rounded-lg bg-white/5 border border-white/6 flex-1 text-slate-100"
            placeholder="Cari username, email, atau telepon..."
            value={search}
            onChange={e=>{
              setSearch(e.target.value)
              setPage(1)
            }}
          />
        </div>
      </div>

      <div>
        {loading ? (
          <div className="py-10 text-center">Memuat...</div>
        ) : (
          <div>
            <div className="overflow-x-auto rounded-xl bg-white/5 border border-white/6 p-2">
              <table className="min-w-full table-auto">
                <thead className="bg-white/3 sticky top-0 backdrop-blur-sm">
                  <tr>
                    <th className="w-16 p-3 text-center text-sm text-slate-300">No</th>
                    <th className="text-left p-3 text-sm text-slate-300">ID</th>
                    <th className="text-left p-3 text-sm text-slate-300">Username</th>
                    <th className="text-left p-3 text-sm text-slate-300">Email</th>
                    <th className="text-left p-3 text-sm text-slate-300">Telepon</th>
                    <th className="text-center p-3 text-sm text-slate-300">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((it, index)=> (
                    <tr key={it.id} className="border-b border-white/6 hover:bg-white/2">
                      <td className="p-3 text-center text-sm text-slate-200">{(page - 1) * pageSize + index + 1}</td>
                      <td className="p-3 text-sm text-slate-200">{it.id}</td>
                      <td className="p-3 text-sm text-white">{it.username}</td>
                      <td className="p-3 text-sm text-white">{it.email}</td>
                      <td className="p-3 text-sm text-white">{it.phone || ''}</td>
                      <td className="p-3 text-center space-x-2">
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filtered.length === 0 && <div className="py-6 text-center text-slate-400">Belum ada data.</div>}
          </div>
        )}
      </div>

      <ConfirmationModal
        open={!!deleteTarget}
        title="Hapus User"
        description="Apakah Anda yakin ingin menghapus user ini?"
        confirmText="Ya, Hapus"
        cancelText="Batal"
        variant="danger"
        loading={deleteLoading}
        onConfirm={confirmDelete}
        onCancel={()=>setDeleteTarget(null)}
      />

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="w-full max-w-lg rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-xl">

            <h3 className="text-lg font-semibold mb-4 text-white">
              Edit User
            </h3>

            <div className="space-y-4">

              <div>
                <label className="text-sm font-medium text-slate-300">
                  Username
                </label>
                <input
                  type="text"
                  value={editing.username || ''}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      username: e.target.value
                    })
                  }
                  placeholder="Masukkan username"
                  className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300">
                  Email
                </label>
                <input
                  type="email"
                  value={editing.email || ''}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      email: e.target.value
                    })
                  }
                  placeholder="Masukkan email"
                  className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300">
                  Telepon
                </label>
                <input
                  type="text"
                  value={editing.phone || ''}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      phone: e.target.value
                    })
                  }
                  placeholder="Masukkan nomor telepon"
                  className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300">
                  Alamat
                </label>
                <textarea
                  value={editing.address || ''}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      address: e.target.value
                    })
                  }
                  placeholder="Masukkan alamat"
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

            </div>

            <div className="flex gap-2 mt-6 justify-end">

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
    </div>
  )
}
