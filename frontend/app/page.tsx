"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Pill,
  Search,
  ShieldCheck,
  Sparkles,
  MessageCircle,
  FileText,
  ShoppingCart,
  Stethoscope,
  Truck,
  Bot,
  HeartHandshake,
} from "lucide-react";

import MedCard from "../components/MedCard";
import StatsCards from "../components/StatsCards";

export default function Home() {

  return (
    <main className="overflow-hidden pt-[88px] pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* HERO */}
        <section className="grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">

          {/* LEFT */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="space-y-6 pt-2">

            <div className="inline-flex items-center gap-2 rounded-3xl bg-sky-100 px-4 py-2 text-sm font-semibold text-sky-800 shadow-sm">
              <Sparkles className="h-4 w-4" />
                Pelayanan kesehatan terpercaya untuk keluarga
            </div>

            <div className="space-y-6">
              <h1 className="text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl">
                Selamat Datang di

                <span className="block text-sky-600">
                  Apotek Sehati Jaya Farma
                </span>
              </h1>

              <p className="max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                Apotek Sehati Jaya Farma hadir untuk membantu memenuhi
                kebutuhan kesehatan masyarakat melalui penyediaan obat-obatan
                yang aman, berkualitas, dan terpercaya. Kami berkomitmen
                memberikan pelayanan yang ramah, cepat, dan profesional
                untuk mendukung kesehatan Anda dan keluarga.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/about"
                className="group inline-flex items-center justify-center rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-sky-700 hover:shadow-xl hover:shadow-sky-200">
                Tentang Kami
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </motion.div>

          {/* RIGHT CARD */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            className="self-center"
          >

            <div className="rounded-3xl bg-slate-950 p-6 text-white shadow-xl">

              <p className="text-sm uppercase tracking-[0.24em] text-sky-200">
                Apotek Sehati Jaya Farma
              </p>

              <h2 className="mt-4 text-3xl font-semibold leading-tight">
                Solusi kesehatan terpercaya untuk keluarga
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-200">
                Menyediakan berbagai pilihan obat, informasi kesehatan,
                serta layanan yang membantu pengguna memperoleh produk
                kesehatan yang sesuai dengan kebutuhan sehari-hari.
              </p>
            </div>
          </motion.div>
        </section>

        {/* STATISTICS (real-time from Supabase) */}
        <section className="mt-8">
          <StatsCards />
        </section>

        {/* SECTION 1: CARA MENGGUNAKAN LAYANAN KAMI */}
        <section className="mt-16">
          <div className="mb-10">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-600">
              Cara Menggunakan Layanan Kami
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-4">
            {/* CARD 1: Cari Obat */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0,
              }}
              className="group rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-sky-200 hover:shadow-2xl">

              <div className="inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-sky-100 text-sky-700 transition-all duration-300 group-hover:scale-110 group-hover:bg-sky-600 group-hover:text-white">
                <Search className="h-7 w-7" />
              </div>

              <h3 className="mt-6 text-xl font-semibold text-slate-950">
                Cari Obat
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                Temukan obat berdasarkan nama atau kategori melalui halaman Produk maupun fitur pencarian.
              </p>
            </motion.div>

            {/* CARD 2: Tanya Chatbot */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.1,
              }}
              className="group rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-sky-200 hover:shadow-2xl">

              <div className="inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-sky-100 text-sky-700 transition-all duration-300 group-hover:scale-110 group-hover:bg-sky-600 group-hover:text-white">
                <MessageCircle className="h-7 w-7" />
              </div>

              <h3 className="mt-6 text-xl font-semibold text-slate-950">
                Tanya Chatbot
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                Gunakan chatbot untuk memperoleh informasi mengenai obat, layanan apotek, maupun cara penggunaan website.
              </p>
            </motion.div>

            {/* CARD 3: Upload Resep */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.2,
              }}
              className="group rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-sky-200 hover:shadow-2xl">

              <div className="inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-sky-100 text-sky-700 transition-all duration-300 group-hover:scale-110 group-hover:bg-sky-600 group-hover:text-white">
                <FileText className="h-7 w-7" />
              </div>

              <h3 className="mt-6 text-xl font-semibold text-slate-950">
                Upload Resep
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                Unggah foto resep dokter untuk diverifikasi oleh admin sebelum diproses.
              </p>
            </motion.div>

            {/* CARD 4: Checkout & Pembayaran */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.3,
              }}
              className="group rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-sky-200 hover:shadow-2xl">

              <div className="inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-sky-100 text-sky-700 transition-all duration-300 group-hover:scale-110 group-hover:bg-sky-600 group-hover:text-white">
                <ShoppingCart className="h-7 w-7" />
              </div>

              <h3 className="mt-6 text-xl font-semibold text-slate-950">
                Checkout & Pembayaran
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                Tambahkan produk ke keranjang, lengkapi alamat, lalu lakukan pembayaran secara online.
              </p>
            </motion.div>
          </div>
        </section>

      </div>
    </main>
  );
}