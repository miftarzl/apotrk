"use client"
import React, { useEffect, useState } from 'react'
import { adminFetch } from '@/lib/adminApi'
import toast from 'react-hot-toast'
import { ConfirmationModal } from '@/components/ui'
import { Edit, Plus, Trash2 } from 'lucide-react'

export default function AdminsPage(){
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 10
  const [editing, setEditing] = useState<any | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [createForm, setCreateForm] = useState({ email: '', password: '', confirmPassword: '', role: 'admin' })
  const [createLoading, setCreateLoading] = useState(false)

  useEffect(()=>{ void load() }, [])

  async function load(){
    setLoading(true)
    try{
      const data = await adminFetch('/admin/admins')
      if (Array.isArray(data)) setItems(data)
    }catch(e){ console.error(e); toast.error('Gagal memuat data') }
    finally{ setLoading(false) }
  }

  const filtered = items.filter(i=>{
    const q = search.toLowerCase()
    return !q || (''+ (i.email||'')).toLowerCase().includes(q) || (''+(i.role||'')).toLowerCase().includes(q)
  })

  const paged = filtered.slice((page-1)*pageSize, page*pageSize)

  async function saveEdit(){
    if (!editing) return
    try{
      const body = { email: editing.email, password_hash: editing.password_hash }
      await adminFetch(`/admin/admins/${editing.id}`, { method: 'PUT', body: JSON.stringify(body) })
      toast.success('Admin diperbarui')
      setEditing(null)
      await load()
    }catch(e){ console.error(e); toast.error('Gagal menyimpan') }
  }

  function askDelete(id:any){
    setDeleteTarget(id)
  }

  async function confirmDelete(){
    if (!deleteTarget) return
    setDeleteLoading(true)
    try{
      await adminFetch(`/admin/admins/${deleteTarget}`, { method: 'DELETE' })
      toast.success('Admin dihapus')
      await load()
      setDeleteTarget(null)
    }catch(e){ console.error(e); toast.error('Gagal menghapus') }
    finally{ setDeleteLoading(false) }
  }

  function resetCreateForm(){
    setCreateForm({ email: '', password: '', confirmPassword: '', role: 'admin' })
    setShowPassword(false)
  }

  function openCreateModal(){
    resetCreateForm()
    setCreateModalOpen(true)
  }

  async function submitCreate(){
    if (!createForm.email.trim()) {
      toast.error('Email wajib diisi.')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(createForm.email.trim())) {
      toast.error('Format email tidak valid.')
      return
    }

    if (createForm.password.length < 8) {
      toast.error('Password minimal 8 karakter.')
      return
    }

    if (createForm.password !== createForm.confirmPassword) {
      toast.error('Konfirmasi password tidak sama.')
      return
    }

    setCreateLoading(true)
    try {
      const base = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/$/, '')
      const adminUrl = base.endsWith('/api') ? `${base}/admin/admins` : `${base}/api/admin/admins`
      const res = await fetch(adminUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_KEY || ''
        },
        body: JSON.stringify({
          email: createForm.email.trim().toLowerCase(),
          password: createForm.password,
          confirmPassword: createForm.confirmPassword,
          role: 'admin'
        })
      })

      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.error || 'Gagal menambahkan admin.')

      toast.success('Admin berhasil ditambahkan')
      resetCreateForm()
      setCreateModalOpen(false)
      await load()
    } catch (e: any) {
      console.error(e)
      toast.error(e?.message || 'Gagal menambahkan admin.')
    } finally {
      setCreateLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
        <h2 className="text-2xl font-semibold">Kelola Admin</h2>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-600"
        >
          <Plus size={16} />
          Tambah Admin
        </button>
      </div>

      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl shadow-black/40">
            <h3 className="text-lg font-semibold mb-4 text-white">Tambah Admin</h3>

            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium text-slate-300">Email</label>
                <input
                  type="email"
                  value={createForm.email}
                  onChange={e => setCreateForm({ ...createForm, email: e.target.value })}
                  placeholder="Masukkan email admin"
                  className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white placeholder:text-slate-400 focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300">Password</label>
                <div className="relative mt-1">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={createForm.password}
                    onChange={e => setCreateForm({ ...createForm, password: e.target.value })}
                    placeholder="Minimal 8 karakter"
                    className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 pr-12 text-white placeholder:text-slate-400 focus:border-sky-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 hover:text-white"
                  >
                    {showPassword ? "🙈" : "👁"}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300">Konfirmasi Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={createForm.confirmPassword}
                  onChange={e => setCreateForm({ ...createForm, confirmPassword: e.target.value })}
                  placeholder="Ulangi password"
                  className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white placeholder:text-slate-400 focus:border-sky-500 focus:outline-none"
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 hover:text-white"
                  >
                    {showPassword ? "🙈" : "👁"}
                  </button>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300">Role</label>
                <input
                  readOnly
                  type="text"
                  value={createForm.role}
                  className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-4 justify-end">
              <button
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
                onClick={() => {
                  setCreateModalOpen(false)
                  resetCreateForm()
                }}
                disabled={createLoading}
              >
                Batal
              </button>
              <button
                className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition"
                onClick={submitCreate}
                disabled={createLoading}
              >
                {createLoading ? 'Memproses...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-4 flex items-center gap-3">
        <input
          className="flex-1 rounded-lg border border-white/6 bg-white/5 p-2 text-slate-100"
          placeholder="Cari email atau role..."
          value={search}
          onChange={e=>{
            setSearch(e.target.value)
            setPage(1)
          }}
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/6 bg-white/5 p-2">
        {loading ? (
          <div className="py-10 text-center">Memuat...</div>
        ) : (
          <div>
            <table className="min-w-full table-auto">
              <thead className="sticky top-0 bg-white/3 backdrop-blur-sm">
                <tr>
                  <th className="w-16 p-3 text-center text-sm text-slate-300">No</th>
                  <th className="p-3 text-left text-sm text-slate-300">Email</th>
                  <th className="p-3 text-left text-sm text-slate-300">Role</th>
                  <th className="p-3 text-left text-sm text-slate-300">Dibuat Pada</th>
                  <th className="p-3 text-center text-sm text-slate-300">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((it, index)=> (
                  <tr key={it.id} className="border-b border-white/6 hover:bg-white/2">
                    <td className="p-3 text-center text-sm text-slate-200">{(page - 1) * pageSize + index + 1}</td>
                    <td className="p-3 text-sm text-white">{it.email}</td>
                    <td className="p-3 text-sm text-slate-200">{it.role || 'admin'}</td>
                    <td className="p-3 text-sm text-slate-200">{it.created_at ? new Date(it.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '-'}</td>
                    <td className="p-3 text-center space-x-2">
                      <button
                        title="Edit"
                        onClick={()=>setEditing(it)}
                        className="inline-flex items-center justify-center rounded bg-sky-500 px-3 py-1 text-white"
                      >
                        <Edit size={16} />
                      </button>

                      <button
                        title="Hapus"
                        onClick={()=>askDelete(it.id)}
                        className="inline-flex items-center justify-center rounded bg-red-600 px-3 py-1 text-white"
                      >
                        <Trash2 size={16} />
                      </button>
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
        title="Hapus Admin"
        description="Apakah Anda yakin ingin menghapus admin ini?"
        confirmText="Ya, Hapus"
        cancelText="Batal"
        variant="danger"
        loading={deleteLoading}
        onConfirm={confirmDelete}
        onCancel={()=>setDeleteTarget(null)}
      />

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl shadow-black/40">

            <h3 className="mb-4 text-lg font-semibold text-white">
              Edit Admin
            </h3>

            <div className="space-y-4">

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
                  placeholder="Masukkan email admin"
                  className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300">
                  Password
                </label>

                <div className="relative mt-1">

                  <input
                    type={showPassword ? "text" : "password"}
                    value={editing.password_hash || ""}
                    onChange={(e)=>
                      setEditing({
                        ...editing,
                        password_hash: e.target.value
                      })
                    }
                    className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 pr-12 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? "🙈" : "👁"}
                  </button>

                </div>
              </div>

            </div>

            <div className="mt-6 flex justify-end gap-2">

              <button
                className="rounded-lg bg-slate-700 px-4 py-2 text-white transition hover:bg-slate-600"
                onClick={() => setEditing(null)}
              >
                Batal
              </button>

              <button
                className="rounded-lg bg-sky-500 px-4 py-2 text-white transition hover:bg-sky-600"
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
