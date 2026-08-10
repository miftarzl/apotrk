"use client"
import React from 'react'

export default function MedCard({ med }: { med: any }){
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition transform hover:-translate-y-1 flex items-start gap-4">
      <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
        {med.image_url ? <img src={med.image_url} alt={med.name} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">No image</div>}
      </div>
      <div>
        <h4 className="text-lg font-semibold text-slate-800">{med.name}</h4>
        <div className="text-sm text-sky-600">{med.category_name || med.category_id || 'Umum'}</div>
        <p className="mt-2 text-sm text-slate-600 line-clamp-2">{med.short_description || med.description || ''}</p>
      </div>
    </div>
  )
}
