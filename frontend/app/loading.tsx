import React from 'react'

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 bg-white/5 p-6 rounded-2xl shadow-lg border border-white/6">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-sky-400 border-slate-200" />
        <div className="text-slate-100">Memuat…</div>
      </div>
    </div>
  )
}
