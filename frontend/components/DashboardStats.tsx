'use client'

import React from 'react'
import {
  Box,
  List,
  Users,
  Package,
  CheckCircle,
  AlertTriangle,
  XCircle,
  DollarSign,
  ShoppingCart,
  Clock,
  Truck,
  CheckSquare,
  X,
  FileText,
  CheckCircle2,
  AlertCircle,
  ShoppingBag
} from 'lucide-react'

type DashboardStatsProps = {
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

type StatCardProps = {
  id: string
  title: string
  value: number | string
  icon: React.ComponentType<any>
  gradient: string
  textColor: string
}

function StatCard({ id, title, value, icon: Icon, gradient, textColor }: StatCardProps) {
  return (
    <div key={id} className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 shadow-sm flex items-center gap-4 hover:bg-white/10 transition-all">
      <div className={`p-3 rounded-lg bg-gradient-to-br ${gradient} ${textColor}`}>
        <Icon size={20} />
      </div>
      <div>
        <div className="text-xs text-slate-400">{title}</div>
        <div className="text-2xl font-semibold text-white">{value}</div>
      </div>
    </div>
  )
}

function Section({ title, cards }: { title: string; cards: StatCardProps[] }) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-white mb-4">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {cards.map(card => (
          <StatCard key={card.id} {...card} />
        ))}
      </div>
    </div>
  )
}

export default function DashboardStats(props: DashboardStatsProps) {
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value)
  }

  // ============================================================
  // BAGIAN 1: Ringkasan Penjualan (Sales Summary)
  // ============================================================
  const salesSummaryCards: StatCardProps[] = [
    {
      id: 'revenue',
      title: 'Total Pendapatan',
      value: formatCurrency(props.totalRevenue || 0),
      icon: DollarSign,
      gradient: 'from-emerald-400 to-emerald-600',
      textColor: 'text-white'
    },
    {
      id: 'total-orders',
      title: 'Total Pesanan',
      value: props.totalOrders || 0,
      icon: ShoppingCart,
      gradient: 'from-blue-400 to-blue-600',
      textColor: 'text-white'
    },
    {
      id: 'completed',
      title: 'Pesanan Selesai',
      value: props.orderStatusCounts?.['Selesai'] || 0,
      icon: CheckSquare,
      gradient: 'from-green-400 to-green-600',
      textColor: 'text-white'
    },
    {
      id: 'cancelled',
      title: 'Pesanan Dibatalkan',
      value: props.orderStatusCounts?.['Dibatalkan'] || 0,
      icon: X,
      gradient: 'from-red-400 to-red-600',
      textColor: 'text-white'
    }
  ]

  // ============================================================
  // BAGIAN 2: Status Pesanan (Order Status)
  // ============================================================
  const orderStatusCards: StatCardProps[] = [
    {
      id: 'waiting-payment',
      title: 'Menunggu Pembayaran',
      value: props.orderStatusCounts?.['Menunggu Pembayaran'] || 0,
      icon: Clock,
      gradient: 'from-yellow-400 to-yellow-600',
      textColor: 'text-black'
    },
    {
      id: 'paid',
      title: 'Lunas',
      value: props.orderStatusCounts?.['Lunas'] || 0,
      icon: CheckCircle2,
      gradient: 'from-cyan-400 to-cyan-600',
      textColor: 'text-white'
    },
    {
      id: 'processing',
      title: 'Diproses',
      value: props.orderStatusCounts?.['Diproses'] || 0,
      icon: Package,
      gradient: 'from-indigo-400 to-indigo-600',
      textColor: 'text-white'
    },
    {
      id: 'shipped',
      title: 'Dikirim',
      value: props.orderStatusCounts?.['Dikirim'] || 0,
      icon: Truck,
      gradient: 'from-purple-400 to-purple-600',
      textColor: 'text-white'
    },
    {
      id: 'finished',
      title: 'Selesai',
      value: props.orderStatusCounts?.['Selesai'] || 0,
      icon: CheckCircle,
      gradient: 'from-green-400 to-green-600',
      textColor: 'text-white'
    }
  ]

  // ============================================================
  // BAGIAN 3: Resep Dokter (Prescriptions)
  // ============================================================
  const prescriptionCards: StatCardProps[] = [
    {
      id: 'waiting-verification',
      title: 'Menunggu Verifikasi',
      value: props.prescriptionStatusCounts?.['Menunggu Verifikasi'] || 0,
      icon: FileText,
      gradient: 'from-orange-400 to-orange-600',
      textColor: 'text-white'
    },
    {
      id: 'prescription-processing',
      title: 'Diproses',
      value: props.prescriptionStatusCounts?.['Diproses'] || 0,
      icon: AlertCircle,
      gradient: 'from-yellow-400 to-yellow-600',
      textColor: 'text-black'
    },
    {
      id: 'ready',
      title: 'Siap Dibeli',
      value: props.prescriptionStatusCounts?.['Siap Dibeli'] || 0,
      icon: ShoppingBag,
      gradient: 'from-green-400 to-green-600',
      textColor: 'text-white'
    },
    {
      id: 'rejected',
      title: 'Ditolak',
      value: props.prescriptionStatusCounts?.['Ditolak'] || 0,
      icon: X,
      gradient: 'from-red-400 to-red-600',
      textColor: 'text-white'
    }
  ]

  // ============================================================
  // BAGIAN 4: Manajemen Stok (Stock Management)
  // ============================================================
  const stockManagementCards: StatCardProps[] = [
    {
      id: 'available',
      title: 'Obat Tersedia',
      value: props.medsAvailable ?? 0,
      icon: CheckCircle,
      gradient: 'from-emerald-400 to-emerald-600',
      textColor: 'text-white'
    },
    {
      id: 'low',
      title: 'Stok Menipis',
      value: props.medsLowStock ?? 0,
      icon: AlertTriangle,
      gradient: 'from-yellow-300 to-yellow-500',
      textColor: 'text-black'
    },
    {
      id: 'out',
      title: 'Obat Habis',
      value: props.medsOut ?? 0,
      icon: XCircle,
      gradient: 'from-red-400 to-red-600',
      textColor: 'text-white'
    },
    {
      id: 'total-stock',
      title: 'Total Stock',
      value: props.totalStock ?? 0,
      icon: Box,
      gradient: 'from-sky-400 to-sky-600',
      textColor: 'text-white'
    }
  ]

  // ============================================================
  // BAGIAN 5: Master Data
  // ============================================================
  const masterDataCards: StatCardProps[] = [
    {
      id: 'medicines',
      title: 'Total Obat',
      value: props.totalMedicines,
      icon: Box,
      gradient: 'from-sky-400 to-indigo-600',
      textColor: 'text-white'
    },
    {
      id: 'categories',
      title: 'Total Kategori',
      value: props.totalCategories,
      icon: List,
      gradient: 'from-indigo-400 to-violet-600',
      textColor: 'text-white'
    },
    {
      id: 'users',
      title: 'Total User',
      value: props.totalUsers,
      icon: Users,
      gradient: 'from-blue-400 to-sky-600',
      textColor: 'text-white'
    },
    {
      id: 'admins',
      title: 'Total Admin',
      value: props.totalAdmins || 0,
      icon: Users,
      gradient: 'from-violet-400 to-purple-600',
      textColor: 'text-white'
    }
  ]

  return (
    <div className="space-y-8">
      <Section title="Master Data" cards={masterDataCards} />
      <Section title="Manajemen Stok" cards={stockManagementCards} />
      <Section title="Resep Dokter" cards={prescriptionCards} />
      <Section title="Status Pesanan" cards={orderStatusCards} />
      <Section title="Ringkasan Penjualan" cards={salesSummaryCards} />
    </div>
  )
}
