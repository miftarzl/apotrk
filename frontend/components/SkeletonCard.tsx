import React from 'react'

export default function SkeletonCard(){
  return (
    <div className="animate-pulse bg-white rounded-2xl shadow-sm p-4">
      <div className="h-44 bg-gray-100 rounded-md" />
      <div className="mt-3">
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2 mt-2" />
        <div className="h-3 bg-gray-200 rounded w-full mt-3" />
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="h-5 bg-gray-200 rounded w-24" />
        <div className="h-8 bg-gray-200 rounded w-28" />
      </div>
    </div>
  )
}
