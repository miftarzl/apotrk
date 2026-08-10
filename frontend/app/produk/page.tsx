"use client"
import React, { useEffect, useMemo, useState } from 'react'
import ProductCard from '@/components/ProductCard'
import SkeletonCard from '@/components/SkeletonCard'
import { Search } from 'lucide-react'

type Medicine = {
  id: number
  nama_obat: string
  kategori?: number | null
  kategori_nama?: string | null
  kandungan?: string
  kemasan?: string
  manfaat?: string
  dosis?: string
  efek_samping?: string
  deskripsi?: string
  harga?: number
  foto_url?: string | null
}

export default function ProdukPage() {
  const [meds, setMeds] = useState<Medicine[]>([])
  const [categories, setCategories] = useState<
    Array<{ id: number; nama_kategori: string }>
  >([])
  const [apiError, setApiError] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const [categoryId, setCategoryId] = useState<number | 'semua'>('semua')
  const [page, setPage] = useState(1)
  const pageSize = 20
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchList()
  }, [])

  async function fetchList() {
    setLoading(true)
    setApiError(null)

    try {
      const backend =
        process.env.NEXT_PUBLIC_BACKEND_URL || (typeof window === 'undefined' ? (process.env.NODE_ENV === 'production' ? 'http://backend:4000' : 'http://localhost:4000') : '')

      const medResponse = await fetch(`${backend}/api/medicines`, {
        cache: 'no-store',
      })

      const medData = await medResponse.json()

      setMeds(Array.isArray(medData) ? medData : [])

      const catResponse = await fetch(`${backend}/api/categories`, {
        cache: 'no-store',
      })

      const catData = await catResponse.json()

      setCategories(Array.isArray(catData) ? catData : [])
    } catch (err: any) {
      console.error(err)
      setApiError(err.message || 'Gagal mengambil data')
      setMeds([])
      setCategories([])
    }

    setLoading(false)
  }

  const categoryOptions = useMemo(() => {
    const opts = [
      { id: 'semua', nama_kategori: 'Semua' } as any,
    ]

    for (const c of categories) {
      opts.push({
        id: c.id,
        nama_kategori: c.nama_kategori,
      })
    }

    return opts
  }, [categories])

  const filtered = useMemo(() => {
    const list = Array.isArray(meds) ? meds : []

    return list.filter((m) => {
      const name = (m.nama_obat || '').toLowerCase()

      const qMatch = name.includes(q.toLowerCase())

      const cMatch =
        categoryId === 'semua'
          ? true
          : m.kategori === categoryId

      return qMatch && cMatch
    })
  }, [meds, q, categoryId])

  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / pageSize)
  )

  const pageData = filtered.slice(
    (page - 1) * pageSize,
    page * pageSize
  )

  useEffect(() => {
    if (page > totalPages) setPage(1)
  }, [totalPages])

  function getCategoryName(categoryId?: number | null) {
    if (!categoryId) return '-'

    const found = categories.find(
      (c) => c.id === categoryId
    )

    return found ? found.nama_kategori : '-'
  }

  return (
    <main className="min-h-screen pt-[88px] pb-16">
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 pt-4">

        {/* FILTER */}
        <div className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-200">

          <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">

            {/* SEARCH */}
            <div className="relative flex-1">

              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />

              <input
                aria-label="search"
                type="text"
                placeholder="Cari nama obat..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              />

            </div>

            {/* FILTER CATEGORY */}
            <select
              value={String(categoryId)}
              onChange={(e) =>
                setCategoryId(
                  e.target.value === 'semua'
                    ? 'semua'
                    : Number(e.target.value)
                )
              }
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            >
              {categoryOptions.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.nama_kategori}
                </option>
              ))}
            </select>

            {/* TOTAL */}
            <div className="rounded-2xl bg-sky-50 px-5 py-3 text-sm font-medium text-sky-700 whitespace-nowrap">
              Total: {loading ? '...' : filtered.length} obat
            </div>

          </div>

        </div>

        {/* ERROR */}
        {apiError ? (
          <div className="mt-6 rounded-2xl bg-red-50 border border-red-200 p-4 text-center text-sm text-red-600">
            Error: {apiError}
          </div>
        ) : null}

        {/* LIST PRODUK */}
        <div className="mt-8">

          {loading ? (

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">

              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i}>
                  <SkeletonCard />
                </div>
              ))}

            </div>

          ) : filtered.length === 0 ? (

            <div className="rounded-[2rem] bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">
              <p className="text-slate-600">
                Obat tidak ditemukan.
              </p>
            </div>

          ) : (

            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">

                {pageData.map((m) => (

                  <div
                    key={m.id}
                    className="bg-white rounded-[2rem] p-4 shadow-sm ring-1 ring-slate-200 hover:shadow-md transition"
                  >

                    <ProductCard
                      medicine={{
                        ...m,
                        kategori_nama: getCategoryName(
                          m.kategori
                        ),
                      }}
                    />

                  </div>

                ))}

              </div>

              {/* PAGINATION */}
              <div className="mt-10 flex items-center justify-center gap-4">

                <button
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                  onClick={() =>
                    setPage((p) => Math.max(1, p - 1))
                  }
                  disabled={page === 1}
                >
                  ← Prev
                </button>

                <div className="text-sm text-slate-600">
                  Halaman {page} dari {totalPages}
                </div>

                <button
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                  onClick={() =>
                    setPage((p) =>
                      Math.min(totalPages, p + 1)
                    )
                  }
                  disabled={page === totalPages}
                >
                  Next →
                </button>

              </div>
            </>

          )}

        </div>

      </section>

    </main>
  )
}