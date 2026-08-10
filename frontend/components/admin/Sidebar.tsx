"use client"
import Link from 'next/link'
import React, { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import { Home,
  Pill,
  Tags,
  ShieldCheck,
  Users,
  FileText,
  ShoppingBag,
  Receipt,
  FileBarChart,
  Truck,
  LogOut } from 'lucide-react'
import { ConfirmationModal } from '@/components/ui'

export default function Sidebar(){
  const router = useRouter()
  const pathname = usePathname()
  const auth = useAuth()
  const userFromCtx = auth?.user ?? null

  const [logoutConfirm, setLogoutConfirm] = useState(false)

  async function signOut(){
    try{
      const backend = process.env.NEXT_PUBLIC_BACKEND_URL || ''

      await fetch(
        `${backend}/api/auth/logout`,
        {
          method: 'POST',
          credentials: 'include'
        }
      )

      window.dispatchEvent(new Event('auth-change'))

      try{
        auth?.refresh && await auth.refresh()
      }catch(e){}

      router.replace('/')
    }catch(e){
      console.error(e)
      router.replace('/')
    }
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-[#021427] to-[#041426] text-slate-100 shadow-lg overflow-y-auto">
      
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden shadow">
            <img
              src="/images/logoapotek.png"
              alt="Logo Apotek Sehati Jaya Farma"
              className="w-full h-full object-contain"
            />
          </div>

          <div>
            <div className="font-semibold text-sm">
              Admin
            </div>

            <div className="text-[11px] text-slate-400 truncate max-w-[140px]">
              {userFromCtx?.email || 'Administrator'}
            </div>
          </div>
        </div>

        <div className="mt-3">
          <button
            onClick={()=>setLogoutConfirm(true)}
            className="w-full text-xs bg-white/5 hover:bg-white/10 py-2 rounded flex items-center justify-center gap-2 text-slate-100"
          >
            <LogOut size={14} />
            <span>Logout</span>
          </button>
          <ConfirmationModal
            open={logoutConfirm}
            title="Keluar dari dashboard"
            description="Apakah Anda yakin ingin keluar dari dashboard admin?"
            confirmText="Keluar"
            cancelText="Batal"
            variant="logout"
            onConfirm={() => { setLogoutConfirm(false); signOut() }}
            onCancel={() => setLogoutConfirm(false)}
          />
        </div>
      </div>

      <nav className="p-3">
        <ul className="space-y-2">

          {/* Dashboard */}
          <li>
            <Link
              href="/admin"
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/5 text-sm"
            >
              <Home size={16} className="text-sky-300" />
              <span>Dashboard</span>
            </Link>
          </li>

          {/* Kelola Produk */}
          <li>
            <div className="px-2 py-1 rounded-lg">
              <div className="text-slate-300 text-xs font-semibold mb-1 uppercase tracking-wide">
                Kelola Produk
              </div>

              <ul className="space-y-1">

                <li>
                  <Link
                    href="/admin/medicines"
                    className={
                      (pathname || '').startsWith('/admin/medicines')
                        ? "flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-sky-500 text-white text-sm font-semibold shadow-md"
                        : "flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/5 text-sm"
                    }
                  >
                    <Pill size={16} className="text-sky-300" />
                    <span>Obat</span>
                  </Link>
                </li>

                <li>
                  <Link
                    href="/admin/categories"
                    className={
                      (pathname || '').startsWith('/admin/categories')
                        ? "flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-sky-500 text-white text-sm font-semibold shadow-md"
                        : "flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/5 text-sm"
                    }
                  >
                    <Tags size={16} className="text-sky-300" />
                    <span>Kategori</span>
                  </Link>
                </li>

              </ul>
            </div>
          </li>

          {/* Kelola Pengguna */}
          <li>
            <div className="px-2 py-1 rounded-lg">
              <div className="text-slate-300 text-xs font-semibold mb-1 uppercase tracking-wide">
                Kelola Pengguna
              </div>

              <ul className="space-y-1">

                <li>
                  <Link
                    href="/admin/admins"
                    className={
                      (pathname || '').startsWith('/admin/admins')
                        ? "flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-sky-500 text-white text-sm font-semibold shadow-md"
                        : "flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/5 text-sm"
                    }
                  >
                    <ShieldCheck size={14} className="text-sky-300" />
                    <span>Admin</span>
                  </Link>
                </li>

                <li>
                  <Link
                    href="/admin/users"
                    className={
                      (pathname || '').startsWith('/admin/users')
                        ? "flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-sky-500 text-white text-sm font-semibold shadow-md"
                        : "flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/5 text-sm"
                    }
                  >
                    <Users size={14} className="text-sky-300" />
                    <span>User</span>
                  </Link>
                </li>

                

              </ul>
            </div>
          </li>
          
          {/* Kelola Produk */}
          <li>
            <div className="px-2 py-1 rounded-lg">
              <div className="text-slate-300 text-xs font-semibold mb-1 uppercase tracking-wide">
                Kelola Penjualan
              </div>

              <ul className="space-y-1">

                <li>
                  <Link
                    href="/admin/prescriptions"
                    className={
                      (pathname || '').startsWith('/admin/prescriptions')
                        ? "flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-sky-500 text-white text-sm font-semibold shadow-md"
                        : "flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/5 text-sm"
                    }
                  >
                    <FileText size={14} className="text-sky-300" />
                    <span>Resep</span>
                  </Link>
                </li>

                <li>
                  <Link
                    href="/admin/orders"
                    className={
                      (pathname || '').startsWith('/admin/orders')
                        ? "flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-sky-500 text-white text-sm font-semibold shadow-md"
                        : "flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/5 text-sm"
                    }
                  >
                    <ShoppingBag size={14} className="text-sky-300" />
                    <span>Pesanan</span>
                  </Link>
                </li>
                
                <li>
                  <Link
                    href="/admin/reports"
                    className={
                      (pathname || '').startsWith('/admin/reports')
                        ? "flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-sky-500 text-white text-sm font-semibold shadow-md"
                        : "flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/5 text-sm"
                    }
                  >
                    <FileBarChart size={14} className="text-sky-300" />
                    <span>Laporan Penjualan</span>
                  </Link>
                </li>

              </ul>
            </div>
          </li>


          {/* Kelola Ongkir */}
          <li>
            <Link
              href="/admin/delivery-zones"
              className={
                (pathname || '').startsWith('/admin/delivery-zones')
                  ? "flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-sky-500 text-white text-sm font-semibold shadow-md"
                  : "flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/5 text-sm"
              }
            >
              <Truck size={16} className="text-sky-300" />
              <span>Kelola Ongkir</span>
            </Link>
          </li>

        </ul>
      </nav>
    </aside>
  )
}