"use client"
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
// upload handled via backend service-role endpoint
import MedicineTable from '@/components/MedicineTable'
import Modal from '@/components/ui/Modal'

export default function AdminMedicines(){
  const [meds, setMeds] = useState<any[]>([])
  const [cats, setCats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<any>({ nama_obat: '', kategori: null, kandungan: '', kemasan: '', manfaat: '', dosis: '', efek_samping: '', deskripsi: '', harga: '', foto_url: '', stock: '' })
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [highlightForm, setHighlightForm] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [selectedMedicine, setSelectedMedicine] = useState<any | null>(null)

  useEffect(()=>{ load() }, [])

  async function load(){
    setLoading(true)
    const backend = process.env.NEXT_PUBLIC_BACKEND_URL || ''
    const [medsRes, catsRes] = await Promise.all([
      fetch(`${backend}/api/medicines`, { credentials: 'include' }),
      fetch(`${backend}/api/categories`, { credentials: 'include' })
    ])
    const medicinesData = await medsRes.json()
    const categoriesData = await catsRes.json()
    console.log('load() medicinesData:', medicinesData)
    console.log('load() categoriesData:', categoriesData)

    const medicines = Array.isArray(medicinesData) ? medicinesData : (medicinesData?.data || [])
    const categories = Array.isArray(categoriesData) ? categoriesData : (categoriesData?.data || [])
    console.log('MEDICINES RESPONSE:', medicines)
    console.log('CATEGORIES RESPONSE:', categories)
    const catsMap: any = {};
    ;(categories || []).forEach((c:any)=> catsMap[c.id] = c)
    const medsWithCat = (medicines || []).map((m:any)=> ({
      ...m,
      kategori_obj: (m.categories && (m.categories.id || m.categories.nama_kategori)) ? (m.categories) : (catsMap[m.kategori] || null)
    }))
    // ensure medicines shown in admin are sorted by id ascending
    const sorted = medsWithCat.slice().sort((a:any,b:any)=> (Number(a.id)||0) - (Number(b.id)||0))
    setMeds(sorted)
    setCats(categories || [])
    setLoading(false)
  }

  async function create(){
    setSaving(true)
    try {
      const payload: any = { ...form }
      // harga: convert to number or null
      if (payload.harga === '' || payload.harga === null || payload.harga === undefined) payload.harga = null
      else payload.harga = Number(payload.harga)

      // upload photo via backend endpoint (server uses service-role to write to storage)
      if (photoFile) {
        try {
          const backend = process.env.NEXT_PUBLIC_BACKEND_URL || ''
          const fd = new FormData()
          fd.append('file', photoFile)
          const up = await fetch(`${backend}/api/admin/upload`, { method: 'POST', credentials: 'include', body: fd })
          const uploadResult = await up.json()
          console.log('UPLOAD RESULT:', up.status, uploadResult)
          if (!up.ok) {
            console.warn('Upload failed', uploadResult)
            payload.foto_url = ''
          } else {
            payload.foto_url = uploadResult.publicUrl || ''
          }
        } catch (e:any) {
          console.warn('Foto upload error', e)
          payload.foto_url = ''
        }
      }

      // preserve existing foto_url when editing and no new photo uploaded
      if (editingId && !photoFile) {
        const existing = meds.find((mm:any)=> mm.id === editingId)
        if (existing && existing.foto_url) payload.foto_url = existing.foto_url
      }

      const backend = process.env.NEXT_PUBLIC_BACKEND_URL || ''
      console.log('FINAL PAYLOAD:', payload)
      // ensure only allowed fields are sent
      const finalPayload: any = {
        nama_obat: payload.nama_obat,
        kategori: payload.kategori !== undefined ? payload.kategori : null,
        harga: payload.harga !== undefined ? payload.harga : null,
        deskripsi: payload.deskripsi || null,
        kandungan: payload.kandungan || null,
        kemasan: payload.kemasan || null,
        manfaat: payload.manfaat || null,
        dosis: payload.dosis || null,
        efek_samping: payload.efek_samping || null,
        foto_url: payload.foto_url || '',
        stock: payload.stock !== undefined && payload.stock !== '' && payload.stock !== null ? Number(payload.stock) : 20
      }

      if (editingId) {
        console.log('UPDATE PAYLOAD:', finalPayload)
        const r = await fetch(`${backend}/api/medicines/${editingId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(finalPayload) })
        const jr = await r.json()
        console.log('CREATE RESULT (update):', jr)
        console.log('update response', r.status, jr)
        if (!r.ok) throw new Error(jr?.error || 'Update failed')
        toast.success('Obat diperbarui')
      } else {
        const r = await fetch(`${backend}/api/medicines`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(finalPayload) })
        const jr = await r.json()
        console.log('CREATE RESULT (create):', jr)
        console.log('create response', r.status, jr)
        if (!r.ok) throw new Error(jr?.error || 'Create failed')
        toast.success('Obat berhasil ditambahkan')
      }
    } catch (e) {
      console.error('Create medicine failed', e)
      toast.error(String(e))
    }
    setForm({ nama_obat: '', kategori: null, kandungan: '', kemasan: '', manfaat: '', dosis: '', efek_samping: '', deskripsi: '', harga: '', stock: 20 })
    setPhotoFile(null)
    setEditingId(null)
    load()
    setSaving(false)
    setTimeout(()=>setSuccess(''), 2500)
  }

  function remove(m:any){
    setDeleteTarget(m)
  }

  async function confirmDelete(){
    if (!deleteTarget) return
    setDeleteLoading(true)
    const backend = process.env.NEXT_PUBLIC_BACKEND_URL || ''
    try{
      const r = await fetch(`${backend}/api/medicines/${deleteTarget.id}`, { method: 'DELETE', credentials: 'include' })
      const jr = await r.json().catch(()=>null)
      console.log('DELETE RESULT:', r.status, jr)
      if (r.ok) toast.success('Obat dihapus')
      else toast.error('Gagal menghapus obat')
    }catch(e){ console.error(e); toast.error('Gagal menghapus obat') }
    setDeleteLoading(false)
    setDeleteTarget(null)
    load()
  }

  function startEdit(m:any){
    setEditingId(m.id)
    setForm({
      nama_obat: m.nama_obat || m.name || '',
      kategori: m.kategori ?? null,
      kandungan: m.kandungan || '',
      kemasan: m.kemasan || '',
      manfaat: m.manfaat || '',
      dosis: m.dosis || '',
      efek_samping: m.efek_samping || '',
      deskripsi: m.deskripsi || m.description || '',
      harga: (m.harga ?? m.price ?? ''),
      stock: m.stock !== undefined && m.stock !== null ? Number(m.stock) : 20,
      foto_url: m.foto_url || ''
    })
    setPhotoFile(null)
    setPreviewUrl(m.foto_url || null)
    // scroll to top and highlight form
    try { window.scrollTo({ top: 0, behavior: 'smooth' }) } catch(e){}
    setHighlightForm(true)
    setTimeout(()=>setHighlightForm(false), 1600)
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="max-w-6xl mx-auto px-4">
      <h2 className="text-2xl font-semibold mb-4">Kelola Obat</h2>

      <div className={`bg-white/5 p-4 rounded-xl mb-4 border border-white/6 w-full ${highlightForm ? 'ring-2 ring-sky-400/50 shadow-lg' : ''}`}>
        <h3 className="text-lg font-medium mb-2 text-slate-100">Tambah / Ubah Obat</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input className="p-2 rounded-lg bg-white/5 border border-white/6 text-slate-100" placeholder="Nama Obat" value={form.nama_obat} onChange={e=>setForm({...form, nama_obat: e.target.value})} />
          <select className="p-2 rounded-lg bg-slate-800 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-sky-500" value={form.kategori ?? ''} onChange={e =>setForm({...form, kategori: e.target.value ? Number(e.target.value) : null})}>
            <option value="">Pilih Kategori</option>
            {cats.map(c=> <option key={c.id} value={c.id}>{c.nama_kategori}</option>)}
          </select>
          <input className="p-2 rounded-lg bg-white/5 border border-white/6 text-slate-100" placeholder="Harga" type="text" value={form.harga} onChange={e=>setForm({...form, harga: e.target.value})} />
          
          <textarea
            className="w-full p-2 rounded-lg bg-white/5 border border-white/6 text-slate-100"
            placeholder="Kandungan (pisahkan dengan koma)"
            value={form.kandungan}
            onChange={e=>setForm({...form, kandungan: e.target.value})}
          />

          <textarea
            className="w-full p-2 rounded-lg bg-white/5 border border-white/6 text-slate-100"
            placeholder="Kemasan (mis. Box 10 tablet)"
            value={form.kemasan}
            onChange={e=>setForm({...form, kemasan: e.target.value})}
          />

          <textarea
            className="w-full p-2 rounded-lg bg-white/5 border border-white/6 text-slate-100"
            placeholder="Manfaat (pisahkan dengan koma)"
            value={form.manfaat}
            onChange={e=>setForm({...form, manfaat: e.target.value})}
          />

          <textarea
            className="w-full p-2 rounded-lg bg-white/5 border border-white/6 text-slate-100"
            placeholder="Dosis"
            value={form.dosis}
            onChange={e=>setForm({...form, dosis: e.target.value})}
          />

          <textarea
            className="w-full p-2 rounded-lg bg-white/5 border border-white/6 text-slate-100"
            placeholder="Efek Samping (pisahkan dengan koma)"
            value={form.efek_samping}
            onChange={e=>setForm({...form, efek_samping: e.target.value})}
          />

          <textarea 
            className="w-full p-2 rounded-lg bg-white/5 border border-white/6 text-slate-100" 
            placeholder="Deskripsi" 
            value={form.deskripsi} onChange={e=>setForm({...form, deskripsi: e.target.value})} 
          />
        <div />
      </div>

        <div className="mt-1 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        {/* STOK */}
        <div>
          <input
            type="number"
            min={0}
            placeholder="Stok"
            className="w-60 mt-2 p-2 rounded-lg bg-white/5 border border-white/6 text-slate-100"
            value={form.stock || ""}
            onChange={(e) => {
              const value = e.target.value

              setForm({
                ...form,
                stock: value === "" ? "" : Number(value)
              })
            }}
          />
        </div>

        {/* FOTO OBAT */}
        <div>
          <label className="text-sm text-slate-300">
            Foto Obat
          </label>

          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={e=>{
              const f = e.target.files ? e.target.files[0] : null
              setPhotoFile(f)

              if (f) {
                try {
                  setPreviewUrl(URL.createObjectURL(f))
                } catch {
                  setPreviewUrl(null)
                }
              } else {
                setPreviewUrl(form.foto_url || null)
              }
            }}
            className="block mt-2 text-slate-200"
          />

          {previewUrl && (
            <div className="mt-2">
              <button
                className="px-3 py-1 bg-red-600 text-white rounded"
                onClick={() => {
                  setPhotoFile(null)
                  setPreviewUrl(null)
                }}
              >
                Hapus Foto
              </button>
            </div>
          )}
        </div>
        
        {/* BUTTON */}
        <div className="flex items-center gap-3">

          <button
            className="px-4 py-2 bg-sky-500 text-white rounded flex items-center"
            onClick={create}
            disabled={saving}
          >
            {saving ? (
              <svg
                className="animate-spin h-4 w-4 mr-2"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
            ) : null}

            {editingId ? "Perbarui Obat" : "Simpan Obat"}
          </button>

          {editingId && (
            <button
              className="px-3 py-2 bg-slate-700 text-white rounded"
              onClick={() => {
                setEditingId(null)

                setForm({
                  nama_obat: "",
                  kategori: null,
                  kandungan: "",
                  kemasan: "",
                  manfaat: "",
                  dosis: "",
                  efek_samping: "",
                  deskripsi: "",
                  harga: "",
                  stock: ""
                })

                setPhotoFile(null)
              }}
            >
              Batal
            </button>
          )}

          {success && (
            <div className="p-2 bg-emerald-600 text-black rounded">
              {success}
            </div>
          )}
        </div>

      </div>
      </div>

      <MedicineTable medicines={meds} onEdit={startEdit} onDelete={remove} onView={(m:any)=>setSelectedMedicine(m)} />
      <Modal open={!!selectedMedicine} title="Detail Obat" onClose={()=>setSelectedMedicine(null)} onConfirm={()=>setSelectedMedicine(null)} confirmLabel="Tutup" cancelLabel="">
        {selectedMedicine && (
          <div className="w-full max-w-[900px]">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="w-full lg:w-1/3 flex-shrink-0">
                {selectedMedicine.foto_url ? (
                  <img src={selectedMedicine.foto_url} alt={selectedMedicine.nama_obat} className="w-full h-56 object-cover rounded" />
                ) : (
                  <div className="w-full h-56 bg-slate-100 rounded flex items-center justify-center">No Image</div>
                )}
              </div>

              <div className="w-full lg:w-2/3">
                <h4 className="text-xl font-semibold mb-1">{selectedMedicine.nama_obat || selectedMedicine.name}</h4>
                <div className="text-sm text-slate-500 mb-2">{selectedMedicine.kategori_obj ? (selectedMedicine.kategori_obj.nama_kategori || selectedMedicine.kategori_obj.name) : (typeof selectedMedicine.kategori === 'object' ? (selectedMedicine.kategori.nama_kategori || selectedMedicine.kategori.name) : selectedMedicine.kategori)}</div>

                <div className="flex items-center gap-4 mb-2">
                  <div className="text-lg font-medium text-sky-600">{(selectedMedicine.harga ?? selectedMedicine.price) ? `Rp ${Number(selectedMedicine.harga ?? selectedMedicine.price).toLocaleString('id-ID')}` : '-'}</div>
                  <div className="text-sm text-slate-800">Stok: <span className="font-medium">{selectedMedicine.stock !== undefined ? String(selectedMedicine.stock) : '-'}</span></div>
                  <div>
                    {(() => {
                      const s = Number(selectedMedicine.stock || 0)
                      if (s > 10) return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">Stok Aman</span>
                      if (s > 0 && s <= 10) return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">Stok Menipis</span>
                      return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">Stok Habis</span>
                    })()}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div className="p-3 bg-white/5 rounded"> 
                    <h5 className="font-semibold mb-1">Deskripsi</h5>
                    <div className="text-sm text-slate-700">{selectedMedicine.deskripsi || selectedMedicine.description || '-'}</div>
                  </div>

                  <div className="p-3 bg-white/5 rounded grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <h6 className="font-semibold mb-1">Kandungan</h6>
                      <div className="text-sm text-slate-700">{selectedMedicine.kandungan || '-'}</div>
                    </div>

                    <div>
                      <h6 className="font-semibold mb-1">Kemasan</h6>
                      <div className="text-sm text-slate-700">{selectedMedicine.kemasan || '-'}</div>
                    </div>

                    <div>
                      <h6 className="font-semibold mb-1">Manfaat</h6>
                      <div className="text-sm text-slate-700">{selectedMedicine.manfaat || '-'}</div>
                    </div>

                    <div>
                      <h6 className="font-semibold mb-1">Dosis</h6>
                      <div className="text-sm text-slate-700">{selectedMedicine.dosis || '-'}</div>
                    </div>

                    <div className="md:col-span-2">
                      <h6 className="font-semibold mb-1">Efek Samping</h6>
                      <div className="text-sm text-slate-700">{selectedMedicine.efek_samping || '-'}</div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}
      </Modal>
      <Modal open={!!deleteTarget} title="Hapus Obat" onClose={()=>setDeleteTarget(null)} onConfirm={confirmDelete} confirmLabel="Ya, Hapus" cancelLabel="Batal" loading={deleteLoading}>
        <div>Apakah anda yakin ingin menghapus data ini?</div>
      </Modal>
    </div>
  )
}
