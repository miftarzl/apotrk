import React from 'react'

export default function Loading({ size = 10 }: { size?: number }) {
  return (
    <div className="flex items-center justify-center">
      <div className={`animate-spin rounded-full h-${size} w-${size} border-4 border-t-sky-400 border-slate-200`} />
    </div>
  )
}
