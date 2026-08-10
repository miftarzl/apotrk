import React from 'react'

export default function Card({ children, className = '' }: { children: React.ReactNode, className?: string }){
  return (
    <div className={`rounded-xl bg-white shadow-sm border border-white/6 p-4 ${className}`}>
      {children}
    </div>
  )
}
