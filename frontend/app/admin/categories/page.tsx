"use client"
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { ConfirmationModal } from '@/components/ui'
import { Edit, Trash2 } from 'lucide-react'
import Modal from '@/components/ui/Modal'

export default function AdminCategories(){
  const [cats, setCats] = useState<any[]>([])
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [highlightForm, setHighlightForm] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(()=>{ load() }, [])

  async function load(){
    setLoading(true)
    try{
      const backend = process.env.NEXT_PUBLIC_BACKEND_URL || ''
      const res = await fetch(`${backend}/api/categories`, { credentials: 'include' })
      const dataRaw = await res.json()
      console.log('CATEGORIES RAW RESPONSE:', dataRaw)
      const data = Array.isArray(dataRaw) ? dataRaw : (dataRaw?.data || [])
      console.log('CATEGORIES RESPONSE:', data)
      setCats(Array.isArray(data) ? data.slice().sort((a:any,b:any)=> (Number(a.id)||0)-(Number(b.id)||0)) : [])
    }catch(e){ console.error(e) }
    setLoading(false)
  }

  async function create(){
    if (!name) {
      toast.error('Masukkan nama kategori')
      return
    }
    setSaving(true)
    try{
      const backend = process.env.NEXT_PUBLIC_BACKEND_URL || ''
      const payload = { nama_kategori: name }
      console.log('CREATE PAYLOAD:', payload)
      if (editingId) {
        console.log('UPDATE PAYLOAD:', payload)
        const r = await fetch(`${backend}/api/categories/${editingId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(payload) })
        const jr = await r.json()
        console.log('CREATE RESULT (update):', jr)
        toast.success('Kategori diperbarui')
      } else {
        const r = await fetch(`${backend}/api/categories`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(payload) })
        const jr = await r.json()
        console.log('CREATE RESULT (create):', jr)
        toast.success('Kategori ditambahkan')
      }
      setName('')
      setEditingId(null)
      load()
      setTimeout(()=>setSuccess(''), 2500)
    }catch(e){ console.error(e) }
    setSaving(false)
  }

  function remove(c:any){
    setDeleteTarget(c)
  }

  async function confirmDelete(){
    if (!deleteTarget) return
    setDeleteLoading(true)
    setLoading(true)
    try{
      const backend = process.env.NEXT_PUBLIC_BACKEND_URL || ''
      console.log('DELETE ID:', deleteTarget.id)
      const r = await fetch(`${backend}/api/categories/${deleteTarget.id}`, { method: 'DELETE', credentials: 'include' })
      const jr = await r.json().catch(()=>null)
      console.log('DELETE RESULT:', r.status, jr)
      if (r.ok) toast.success('Kategori dihapus')
      else toast.error('Gagal menghapus kategori')
      load()
    }catch(e){ console.error(e); toast.error('Gagal menghapus kategori') }
    setDeleteLoading(false)
    setDeleteTarget(null)
    setLoading(false)
  }

  function startEdit(c:any){ setEditingId(c.id); setName(c.nama_kategori || ''); try{ window.scrollTo({ top: 0, behavior: 'smooth' }) }catch(e){}; setHighlightForm(true); setTimeout(()=>setHighlightForm(false), 1400) }
  function cancelEdit(){ setEditingId(null); setName('') }

  return (
    <div className="max-w-6xl mx-auto px-4">
      <h2 className="text-2xl font-semibold mb-4">Kelola Kategori</h2>
      <div className={`bg-white/5 p-4 rounded-xl mb-4 border border-white/6 shadow-sm w-full ${highlightForm ? 'ring-2 ring-sky-400/50 shadow-lg' : ''}`}>
        <div className="flex gap-3 items-center">
          <input className="p-2 rounded-lg bg-white/5 border border-white/6 flex-1 text-slate-100" placeholder="Nama Kategori" value={name} onChange={e=>setName(e.target.value)} />
          <button className="px-4 py-2 bg-sky-500 text-white rounded flex items-center" onClick={create} disabled={saving}>
            {saving ? (
              <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path></svg>
            ) : null}
            {editingId ? 'Simpan' : 'Tambah'}
          </button>
          {editingId ? <button className="px-4 py-2 bg-slate-700 text-white rounded" onClick={cancelEdit}>Batal</button> : null}
        </div>
        {success ? <div className="mt-3 p-2 bg-emerald-600 text-black rounded transition-all">{success}</div> : null}
      </div>

      {loading ? <div>Loading...</div> : (
        <div className="overflow-x-auto rounded-xl bg-white/5 border border-white/6 p-2">
          <table className="min-w-full table-auto">
            <thead className="bg-white/3 sticky top-0 backdrop-blur-sm">
              <tr>
                <th className="text-left p-3 text-sm text-slate-300">ID</th>
                <th className="text-left p-3 text-sm text-slate-300">Nama Kategori</th>
                <th className="text-center p-3 text-sm text-slate-300">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {cats.map(c=> (
                <tr key={c.id} className="border-b border-white/6 hover:bg-white/2">
                  <td className="p-3 text-sm text-slate-200">{c.id}</td>
                  <td className="p-3 text-sm text-white">{c.nama_kategori}</td>
                  <td className="p-3 text-center space-x-2">
                    <button title="Edit" onClick={()=>startEdit(c)} className="inline-flex items-center justify-center px-3 py-1 rounded bg-sky-500 text-white">
                      <Edit size={16} />
                    </button>
                    <button title="Hapus" onClick={()=>remove(c)} className="inline-flex items-center justify-center px-3 py-1 rounded bg-red-600 text-white">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <ConfirmationModal
        open={!!deleteTarget}
        title="Hapus Kategori"
        description="Apakah Anda yakin ingin menghapus data ini?"
        confirmText="Ya, Hapus"
        cancelText="Batal"
        variant="danger"
        loading={deleteLoading}
        onConfirm={confirmDelete}
        onCancel={()=>setDeleteTarget(null)}
      />

      <Modal open={!!deleteTarget} title="Hapus Kategori" onClose={()=>setDeleteTarget(null)} onConfirm={confirmDelete} confirmLabel="Ya, Hapus" cancelLabel="Batal" loading={deleteLoading}>
        <div>Apakah anda yakin ingin menghapus data ini?</div>
      </Modal>
    </div>
  )
}
