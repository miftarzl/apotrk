import React from 'react'

export default function Loading(){
  return (
    <main className="container mx-auto p-6">
      <div className="animate-pulse rounded-2xl bg-white p-6 shadow-sm">
        <div className="h-80 bg-gray-100 rounded-md" />
        <div className="mt-4 h-6 bg-gray-100 rounded w-3/4" />
        <div className="mt-2 h-4 bg-gray-100 rounded w-1/2" />
      </div>
    </main>
  )
}
