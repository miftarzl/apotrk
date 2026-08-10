"use client"

import React from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { ShoppingCart } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { useRouter } from 'next/navigation'

export default function ProductCard({
  medicine,
}: {
  medicine: any
}) {
  const { user } = useAuth()
  const router = useRouter()
  const price = medicine?.harga ?? medicine?.price

  const formatted = price
    ? Number(price).toLocaleString('id-ID')
    : '-'

  return (
    <article className="flex h-full flex-col">

      {/* IMAGE */}
      <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-slate-50 ring-1 ring-slate-100">

        <img
          src={medicine?.foto_url || '/placeholder.png'}
          alt={medicine?.nama_obat}
          className="h-full w-full object-contain p-3"
        />

      </div>

      {/* CONTENT */}
      <div className="flex flex-1 flex-col pt-4">

        {/* NAMA */}
        <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-slate-800">
          {medicine?.nama_obat}
        </h3>

        {/* KATEGORI */}
        <div className="mt-1 text-xs font-medium text-sky-600">
          {medicine?.categories?.nama_kategori ||
            medicine?.kategori_nama ||
            medicine?.kategori_obj?.nama_kategori ||
            '-'}
        </div>

        {/* DESKRIPSI */}
        <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-500">
          {medicine?.deskripsi || ''}
        </p>

        {/* FOOTER */}
        <div className="mt-auto flex items-center justify-between pt-4">

          <div className="text-sm font-semibold text-slate-800">
            Rp {formatted}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={async () => {
                const backend = process.env.NEXT_PUBLIC_BACKEND_URL || ''
                if (!user) return router.push('/login')
                console.log('User:', user)
                console.log('Medicine:', medicine)
                try {
                  const payload = { medicine_id: medicine?.id }
                  console.log('Payload:', payload)
                  const res = await fetch(`${backend}/api/user/cart`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(payload)
                  })
                  if (res.status === 401) return router.push('/login')
                  const j = await res.json().catch(()=>null)
                  if (res.ok) {
                    toast.success('Berhasil ditambahkan ke keranjang')
                    window.dispatchEvent(new Event('cart-changed'))
                  } else {
                    console.error('Add to cart failed response:', j)
                    toast.error(j?.error?.message || j?.error || j?.message || JSON.stringify(j) || 'Gagal menambahkan ke keranjang')
                  }
                } catch (e) { console.error(e); toast.error('Gagal menambahkan ke keranjang') }
              }}
              className="p-2 rounded hover:bg-slate-100"
              title="Tambah ke Keranjang"
            >
              <ShoppingCart size={16} />
            </button>

            <Link
              href={`/produk/${medicine?.id}`}
              className="text-xs font-medium text-sky-600 transition hover:text-sky-700 hover:underline"
            >
              Lihat Detail
            </Link>
          </div>

        </div>

      </div>

    </article>
  )
}