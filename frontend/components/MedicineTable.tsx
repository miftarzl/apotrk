import React from 'react'
import { Edit, Trash2, Eye } from 'lucide-react'

export default function MedicineTable({
  medicines,
  onEdit,
  onDelete,
  onView
}: {
  medicines: any[],
  onEdit?: (m:any)=>void,
  onDelete?: (m:any)=>void,
  onView?: (m:any)=>void
}) {

  return (
    <div className="rounded-xl bg-white/5 border border-white/6 overflow-hidden">
      <div className="w-full overflow-x-auto">

        <table className="w-full border-collapse">
          
          <thead className="bg-white/3 sticky top-0 backdrop-blur-sm">
            <tr>
              <th className="text-left p-3 text-sm text-slate-300 w-10">ID</th>
              <th className="text-left p-3 text-sm text-slate-300 w-[220px]">Nama Obat</th>
              <th className="text-left p-3 text-sm text-slate-300 w-[140px]">Kategori</th>
              <th className="text-left p-3 text-sm text-slate-300 w-[120px]">Harga</th>
              <th className="text-center p-3 text-sm text-slate-300 w-[70px]">Stok</th>
              <th className="text-center p-3 text-sm text-slate-300 w-[140px]">Status</th>
              <th className="text-center p-3 text-sm text-slate-300 w-[120px]">Foto</th>
              <th className="text-center p-3 text-sm text-slate-300 w-[140px]">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {medicines.map((m) => (
              <tr
                key={m.id}
                className="border-b border-white/6 hover:bg-white/2 align-top"
              >

                <td className="p-3 text-sm text-slate-200 align-top">
                  {m.id}
                </td>

                <td className="p-3 align-top">
                  <div className="text-sm font-medium text-white break-words whitespace-normal leading-relaxed max-w-[180px]">
                    {m.nama_obat || m.name}
                  </div>
                </td>

                <td className="p-3 align-top">
                  <div className="text-sm text-slate-300 break-words whitespace-normal leading-relaxed max-w-[140px]">
                    {m.kategori_obj
                      ? (m.kategori_obj.nama_kategori || m.kategori_obj.name)
                      : (
                        typeof m.kategori === 'object'
                          ? (m.kategori.nama_kategori || m.kategori.name)
                          : m.kategori
                      )}
                  </div>
                </td>

                <td className="p-3 text-left align-top">
                  <div className="text-sm text-sky-200 whitespace-normal">
                    {(m.harga ?? m.price)
                      ? `Rp ${Number(m.harga ?? m.price).toLocaleString('id-ID')}`
                      : '-'}
                  </div>
                </td>

                <td className="p-3 text-center align-top">
                  <div className="text-sm text-slate-200">{m.stock !== undefined ? String(m.stock) : '-'}</div>
                </td>

                <td className="p-3 text-center align-top">
                  {(() => {
                    const s = Number(m.stock || 0)
                    if (s > 10) return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">Stok Aman</span>
                    if (s > 0 && s <= 10) return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">Stok Menipis</span>
                    return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">Stok Habis</span>
                  })()}
                </td>

                <td className="p-3 text-center align-top">
                  {m.foto_url ? (
                    <img src={m.foto_url} alt={m.nama_obat} className="w-20 h-12 object-cover rounded mx-auto" />
                  ) : (
                    <img src="/placeholder.png" alt="placeholder" className="w-20 h-12 object-cover rounded opacity-60 mx-auto" />
                  )}
                </td>

                <td className="p-3 text-center align-top">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      title="Detail"
                      onClick={() => onView?.(m)}
                      className="inline-flex items-center justify-center p-2 rounded bg-slate-700 hover:bg-slate-600 text-white transition"
                    >
                      <Eye size={16} />
                    </button>

                    <button
                      title="Edit"
                      onClick={() => onEdit?.(m)}
                      className="inline-flex items-center justify-center p-2 rounded bg-sky-500 hover:bg-sky-600 text-white transition"
                    >
                      <Edit size={16} />
                    </button>

                    <button
                      title="Hapus"
                      onClick={() => onDelete?.(m)}
                      className="inline-flex items-center justify-center p-2 rounded bg-red-600 hover:bg-red-700 text-white transition"
                    >
                      <Trash2 size={16} />
                    </button>

                  </div>
                </td>

              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </div>
  )
}