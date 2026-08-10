"use client"

import React, { useEffect, useState } from "react";
import Link from "next/link";
// Fetch counts from backend API endpoints instead of using Supabase client in the frontend

export default function StatsCards() {
  const [totalMedicines, setTotalMedicines] = useState<number>(0);
  const [totalCategories, setTotalCategories] = useState<number>(0);

  async function fetchCounts() {
    try {
      const backend =
        process.env.NEXT_PUBLIC_BACKEND_URL ||
        (typeof window === 'undefined' ? (process.env.NODE_ENV === 'production' ? 'http://backend:4000' : 'http://localhost:4000') : '');

      const medsRes = await fetch(`${backend}/api/medicines`, {
        cache: "no-store",
      });
      const meds = await medsRes.json();

      const catsRes = await fetch(`${backend}/api/categories`, {
        cache: "no-store",
      });
      const cats = await catsRes.json();

      const medsCount = Array.isArray(meds) ? meds.length : 0;
      const catsCount = Array.isArray(cats) ? cats.length : 0;

      setTotalMedicines(medsCount);
      setTotalCategories(catsCount);
    } catch (err) {
      console.error("Failed to fetch stats", err);
    }
  }

  useEffect(() => {
    fetchCounts();

    const poll = setInterval(fetchCounts, 15000);

    return () => {
      clearInterval(poll);
    };
  }, []);
  
  return (
    <div className="mx-auto max-w-7xl">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">

        <Link href="/produk" className="col-span-1 md:col-span-1 flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:bg-sky-50 hover:shadow-md">
          <div className="text-center">
            <div className="text-sm font-semibold text-slate-900">Lihat Produk</div>
            <div className="text-xs text-slate-500">Telusuri seluruh katalog obat</div>
          </div>
        </Link>
        
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="text-2xl font-semibold text-slate-900">{totalMedicines}</div>
          <div className="text-sm text-slate-500">Total Obat</div>
        </div>

        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="text-2xl font-semibold text-slate-900">{totalCategories}</div>
          <div className="text-sm text-slate-500">Total Kategori</div>
        </div>

        <Link href="/resep" className="col-span-1 md:col-span-1 flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:bg-sky-50 hover:shadow-md">
          <div className="text-center">
            <div className="text-sm font-semibold text-slate-900">Gunakan Resep Obat</div>
            <div className="text-xs text-slate-500">Bantuan memilih produk sesuai resep yang dipunya</div>
          </div>
        </Link>

      </div>
    </div>
  );
}
