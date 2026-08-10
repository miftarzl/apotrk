"use client"

import React from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-6">
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-md w-full text-center border border-slate-200">
        <h2 className="text-2xl font-bold text-red-500">
          Terjadi Kesalahan
        </h2>

        <p className="text-slate-600 mt-3">
          Gagal memuat detail obat.
        </p>

        <button
          onClick={() => reset()}
          className="mt-5 px-5 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl transition"
        >
          Coba Lagi
        </button>
      </div>
    </div>
  )
}