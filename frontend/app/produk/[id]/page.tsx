import React from 'react'
import AddToCartButton from '../../../components/AddToCartButton'

type Props = {
  params: {
    id: string
  }
}

async function getMedicine(id: string) {
  try {
    const backend =
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      'http://localhost:4000'

    const res = await fetch(
      `${backend}/api/medicines/${id}`,
      {
        cache: 'no-store',
      }
    )

    if (!res.ok) {
      return null
    }

    return await res.json()
  } catch (err) {
    console.error(err)
    return null
  }
}

export default async function ProductDetail({
  params,
}: Props) {
  const med = await getMedicine(params.id)

  if (!med) {
    return (
      <main className="container mx-auto px-4 sm:px-6 lg:px-8">

        <div className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          Data obat tidak ditemukan.
        </div>

      </main>
    )
  }

  const formattedPrice = med.harga
    ? Number(med.harga).toLocaleString('id-ID')
    : '-'

  const stockAvailable =
    typeof med.stock === 'number'
      ? med.stock
      : Number(med.stock ?? 0)
  const isOutOfStock = stockAvailable === 0
  const stockBadgeClass = isOutOfStock
    ? 'border-rose-200 bg-rose-50 text-rose-700'
    : stockAvailable <= 10
    ? 'border-amber-200 bg-amber-50 text-amber-700'
    : 'border-emerald-200 bg-emerald-50 text-emerald-700'

  return (
    <main className="min-h-screen pt-12 pb-12">

      <section className="container mx-auto px-4 sm:px-6 lg:px-8">

        {/* BREADCRUMB */}
        <nav className="mb-5 text-sm text-slate-800">

          <a
            href="/produk"
            className="hover:text-sky-600 hover:underline font-semibold"
          >
            Produk
          </a>

          <span className="mx-2">/</span>

          <span className="text-slate-800">
            {med.nama_obat}
          </span>

        </nav>

        {/* CARD */}
        <div className="rounded-[2rem] bg-white p-5 md:p-7 shadow-sm ring-1 ring-slate-200">
          <div className="grid gap-6 lg:grid-cols-[34%_66%] lg:items-start">
            <div className="space-y-2">
              <div className="overflow-hidden rounded-xl bg-slate-50 shadow-sm ring-1 ring-slate-100">
                <div className="h-[280px] md:h-[300px] lg:h-[320px] overflow-hidden">
                  <img
                    src={med.foto_url || "/placeholder.png"}
                    alt={med.nama_obat}
                    className="h-full w-full object-contain"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <h1 className="text-xl font-bold text-slate-900">
                    {med.nama_obat}
                  </h1>
                </div>
                <div>
                  <span className="inline-flex rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-700">
                    {med.kategori_nama || "-"}
                  </span>
                </div>
                <div className="text-2xl font-bold text-sky-600">
                  Rp {formattedPrice}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Deskripsi</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {med.deskripsi || "-"}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Kandungan</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {med.kandungan || "-"}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Kemasan</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {med.kemasan || "-"}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Manfaat</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {med.manfaat || "-"}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Dosis</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {med.dosis || "-"}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Efek Samping</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {med.efek_samping || "-"}
                  </p>
                </div>
                <div className="hidden md:block" />
              </div>

              <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="sm:w-[80%]">
                  <AddToCartButton
                    medicineId={med.id}
                    disabled={isOutOfStock}
                    className="w-full"
                  />
                </div>
                <div className="sm:w-[20%]">
                  <div className={`rounded-xl border px-4 py-3 text-sm font-medium ${stockBadgeClass}`}>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Stok</p>
                    <p className="mt-2 text-base font-semibold text-slate-900">
                      {isOutOfStock ? 'Habis' : stockAvailable}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </section>

    </main>
  )
}