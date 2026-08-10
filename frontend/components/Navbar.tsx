"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X, Box, ShoppingCart, User, LogOut } from "lucide-react";
import { useSearchParams } from 'next/navigation'
import Image from "next/image";
import { motion } from "framer-motion";
import { useAuth } from '@/lib/AuthContext'

export default function Navbar() {
  const pathname = usePathname();
  const searchParams = useSearchParams()
  const activeTab = searchParams?.get('tab')

  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth()

  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const loadCartCount = async () => {
    try {
      if (!user) {
        setCartCount(0)
        return
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/user/cart`,
        {
          credentials: "include",
        }
      )

      if (!res.ok) return

      const data = await res.json()

      const ids = Array.isArray(data)
        ? data
            .map((item: any) => item.medicine_id ?? item.medicines?.id ?? item.medicines?.medicine_id ?? item.id ?? null)
            .filter(Boolean)
        : []

      const uniqueCount = new Set(ids).size
      setCartCount(uniqueCount)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadCartCount()
  }, [user])

  useEffect(() => {
    const handleCartChanged = () => {
      loadCartCount()
    }

    window.addEventListener('cart-changed', handleCartChanged)
    return () => window.removeEventListener('cart-changed', handleCartChanged)
  }, [user])
  
  if (pathname && pathname.startsWith("/admin")) return null;

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-xl shadow-soft"
          : "bg-white/60 backdrop-blur-md"
      }`}
    >
      <div className="container-page py-3 flex items-center justify-between">

        {/* LOGO */}
        <Link href="/" className="flex items-center gap-3 card px-4 py-2 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <Image
              src="/images/logoapotek.png"
              alt="Logo Apotek Sehati Jaya Farma"
              width={48}
              height={48}
              className="h-12 w-12 object-contain"
              priority
            />

            <div className="leading-tight">
              <p className="text-sm font-bold">Apotek Sehati Jaya Farma</p>
            </div>
          </div>
        </Link>

        {/* DESKTOP MENU */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold">
          {[
            { href: "/", label: "Beranda" },
            { href: "/about", label: "Tentang Kami" },
            { href: "/produk", label: "Obat" },
            { href: "/resep", label: "Resep" },
          ].map((item) => {
            const active = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href))
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`transition ${active ? 'text-sky-500 font-bold border-b-2 border-sky-100 pb-1' : 'text-slate-700 hover:text-sky-600'}`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* AUTH ACTIONS */}
        <div className="hidden md:flex items-center gap-3">
          {!user ? (
            <Link href="/login" className="relative h-10 flex items-center justify-center rounded-lg border border-slate-400 bg-white/80 backdrop-blur px-3 text-sky-600 transition-all duration-200 hover:bg-sky-50 hover:border-sky-400 hover:text-sky-700 hover:shadow-sm">MASUK / DAFTAR</Link>
          ) : (
            <div className="flex items-center gap-3">
              {/* Username (desktop) */}
              <span className="text-sm font-medium text-slate-700 truncate max-w-[140px]">
                {user?.username || user?.name || ''}
              </span>

              {/* Profile button (compact, matches cart style) */}
              <Link
                href="/profile"
                className={`h-10 flex items-center justify-center rounded-lg border border-slate-400 bg-white/80 backdrop-blur transition-all duration-200 px-3 ${pathname === '/profile' ? 'text-sky-600 border-sky-400 bg-sky-50' : 'text-slate-700 hover:bg-sky-50 hover:border-sky-300 hover:text-sky-600'}`}
              >
                <User size={18} />
              </Link>

              {/* Cart button (badge preserved) */}
              <Link
                href="/profile?tab=cart"
                className={`relative h-10 flex items-center justify-center rounded-lg border border-slate-400 bg-white/80 backdrop-blur transition-all duration-200 px-3 ${pathname === '/profile' && activeTab === 'cart' ? 'text-sky-600 border-sky-400 bg-sky-50' : 'text-slate-700 hover:bg-sky-50 hover:border-sky-300 hover:text-sky-600'}`}
              >
                <ShoppingCart size={18} />

                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 rounded-full bg-sky-500 text-white text-xs font-bold flex items-center justify-center">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>

              {/* Logout (visual only changed) */}
              <button onClick={() => logout()} className="relative h-10 flex items-center justify-center gap-2 rounded-lg border border-slate-400 bg-white/80 backdrop-blur px-3 text-sky-500 transition-all duration-200 hover:bg-sky-50 hover:border-sky-400 hover:text-sky-700 hover:shadow-sm"><LogOut size={16} />KELUAR</button>
            </div>
          )}
        </div>

        {/* MOBILE BUTTON */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden btn btn-secondary rounded-2xl"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* MOBILE MENU */}
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{
          height: open ? "auto" : 0,
          opacity: open ? 1 : 0,
        }}
        transition={{ duration: 0.25 }}
        className="md:hidden overflow-hidden border-t border-slate-200 bg-white/95 backdrop-blur-xl"
      >
        <div className="container-page py-4 space-y-2">

          {[
            { href: "/", label: "Home" },
            { href: "/about", label: "Tentang Kami" },
            { href: "/produk", label: "Obat" },
            { href: "/resep", label: "Resep" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`block card px-4 py-3 transition ${pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href)) ? 'text-sky-500 font-bold border-b-2 border-sky-100 pb-1' : 'text-slate-700 hover:text-sky-600 hover:shadow-sm'}`}
            >
              {item.label}
            </Link>
          ))}

          <div className="pt-3">
            {!user ? (
              <Link href="/login" className="relative h-10 flex items-center justify-center rounded-lg border border-slate-400 bg-white/80 backdrop-blur px-3 text-sky-600 transition-all duration-200 hover:bg-sky-50 hover:border-sky-400 hover:text-sky-700 hover:shadow-sm">MASUK / DAFTAR</Link>
            ) : (
              <>
                {/* Username (mobile) */}
                <div className="mb-2">
                  <span className="text-sm font-medium text-slate-700 truncate max-w-[140px]">
                    {user?.username || user?.name || ''}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Profile button */}
                  <Link
                    href="/profile"
                    onClick={() => setOpen(false)}
                    className={`h-10 flex items-center justify-center rounded-lg border border-slate-400 bg-white/80 backdrop-blur transition-all duration-200 px-3 ${pathname === '/profile' ? 'text-sky-600 border-sky-400 bg-sky-50' : 'text-slate-700 hover:bg-sky-50 hover:border-sky-300 hover:text-sky-600'}`}
                  >
                    <User size={18} />
                  </Link>

                  {/* Cart button */}
                  <Link
                    href="/profile?tab=cart"
                    onClick={() => setOpen(false)}
                    className={`relative h-10 flex items-center justify-center rounded-lg border border-slate-400 bg-white/80 backdrop-blur transition-all duration-200 px-3 ${pathname === '/profile' && activeTab === 'cart' ? 'text-sky-600 border-sky-400 bg-sky-50' : 'text-slate-700 hover:bg-sky-50 hover:border-sky-300 hover:text-sky-600'}`}
                  >
                    <ShoppingCart size={18} />

                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 rounded-full bg-sky-500 text-white text-xs font-bold flex items-center justify-center">
                        {cartCount > 99 ? '99+' : cartCount}
                      </span>
                    )}
                  </Link>

                  <button onClick={() => { setOpen(false); logout() }} className="relative h-10 flex items-center justify-center gap-2 rounded-lg border border-slate-400 bg-white/80 backdrop-blur px-3 text-sky-500 transition-all duration-200 hover:bg-sky-50 hover:border-sky-400 hover:text-sky-700 hover:shadow-sm">KELUAR</button>
                </div>
              </>
            )}
          </div>

        </div>
      </motion.div>

      
    </header>
  );
}