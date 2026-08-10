"use client"
import React from 'react'
import { useAuth } from '@/lib/AuthContext'
import DashboardStats from '@/components/DashboardStats'
import { useEffect, useState } from 'react'

interface StatsData {
  totalMedicines: number
  totalCategories: number
  totalUsers: number
  totalAdmins: number
  totalStock: number
  medsAvailable: number
  medsLowStock: number
  medsOut: number
  totalRevenue: number
  totalOrders: number
  orderStatusCounts?: {
    'Menunggu Pembayaran'?: number
    'Lunas'?: number
    'Diproses'?: number
    'Dikirim'?: number
    'Selesai'?: number
    'Dibatalkan'?: number
  }
  prescriptionStatusCounts?: {
    'Menunggu Verifikasi'?: number
    'Diproses'?: number
    'Siap Dibeli'?: number
    'Ditolak'?: number
  }
}

export default function AdminPage(){
  const auth = useAuth()
  const [stats, setStats] = useState<StatsData | null>(null)

  useEffect(()=>{
    let mounted = true
    async function load(){
      try{
        const backend = process.env.NEXT_PUBLIC_BACKEND_URL || ''
        const r = await fetch(`${backend}/api/admin/stats`, { credentials: 'include' })
        const j = await r.json()
        if (!mounted) return
        if (r.ok) {
          console.log('Dashboard stats loaded:', j)
          setStats(j)
        }
        else setStats({
          totalMedicines: 0,
          totalCategories: 0,
          totalUsers: 0,
          totalAdmins: 0,
          totalStock: 0,
          medsAvailable: 0,
          medsLowStock: 0,
          medsOut: 0,
          totalRevenue: 0,
          totalOrders: 0,
          orderStatusCounts: {},
          prescriptionStatusCounts: {}
        })
      }catch(e){
        console.error('Failed to load stats:', e)
        if (mounted) setStats({
          totalMedicines: 0,
          totalCategories: 0,
          totalUsers: 0,
          totalAdmins: 0,
          totalStock: 0,
          medsAvailable: 0,
          medsLowStock: 0,
          medsOut: 0,
          totalRevenue: 0,
          totalOrders: 0,
          orderStatusCounts: {},
          prescriptionStatusCounts: {}
        })
      }
    }
    load()
    return ()=>{ mounted = false }
  }, [])

  if (auth.loading) return <div className="min-h-screen flex items-center justify-center">Checking session...</div>
  if (!auth.user) return null
  if (auth.user.role !== 'admin') return <div className="min-h-screen flex items-center justify-center">Access denied</div>

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6 text-white">Dashboard</h1>
      {stats ? (
        <DashboardStats
          totalMedicines={stats.totalMedicines}
          totalCategories={stats.totalCategories}
          totalUsers={stats.totalUsers}
          totalAdmins={stats.totalAdmins}
          totalStock={stats.totalStock}
          medsAvailable={stats.medsAvailable}
          medsLowStock={stats.medsLowStock}
          medsOut={stats.medsOut}
          totalRevenue={stats.totalRevenue}
          totalOrders={stats.totalOrders}
          orderStatusCounts={stats.orderStatusCounts}
          prescriptionStatusCounts={stats.prescriptionStatusCounts}
        />
      ) : (
        <div className="text-center py-12 text-slate-400">Loading stats...</div>
      )}
    </div>
  )
}
