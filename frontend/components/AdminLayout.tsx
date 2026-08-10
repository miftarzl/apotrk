"use client"
import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from './admin/Sidebar'
import TopNav from './admin/TopNav'
import { useAuth } from '@/lib/AuthContext'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const auth = useAuth()

  // while checking session
  const router = useRouter()
  useEffect(()=>{
    if (!auth.loading) {
      if (!auth.user) router.push('/login')
      else if (auth.user.role !== 'admin') router.push('/login')
    }
  }, [auth.loading, auth.user, router])

  if (auth.loading) return <div className="min-h-screen flex items-center justify-center bg-[#041426]">Checking session...</div>
  if (!auth.user) return null
  if (auth.user.role !== 'admin') return null

  // authenticated -> full admin layout with fixed sidebar
  return (
    <div className="min-h-screen bg-[#041426] text-slate-100">
      <Sidebar />
      <div className="ml-64 flex-1 min-h-screen">
        <TopNav />
        <main className="p-6 container mx-auto max-w-6xl">{children}</main>
      </div>
    </div>
  )
}
