"use client"
import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  MapPin,
  Clock,
  User,
  ShieldCheck,
  Search,
  Sparkles,
  UserRound,
  Truck,
  Pill,
  FileText,
  Lock,
  CheckCircle,
  HeartPulse,
  ShoppingCart,
  CreditCard,
  Wallet,
  Upload,
  ClipboardCheck,
  PackageCheck
} from 'lucide-react'

export default function AboutPage() {
  const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  }

  const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12 } }
  }

  return (
    <main className="min-h-screen pt-[88px] pb-16">
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 pt-4">

        {/* HERO */}
        <div className="rounded-[2rem] bg-white p-6 md:p-8 shadow-xl ring-1 ring-slate-200">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-start">

            {/* LEFT */}
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-600">
                Tentang Apotek
              </p>
              <h1 className="mt-3 text-3xl md:text-4xl font-semibold text-slate-900 leading-tight">
                Apotek Sehati Jaya Farma
              </h1>
              <p className="mt-4 text-sm md:text-base leading-7 text-slate-600">
                Apotek Sehati Jaya Farma merupakan apotek yang berkomitmen memberikan
                pelayanan kesehatan terbaik kepada masyarakat melalui penyediaan
                obat-obatan yang aman, berkualitas, dan terpercaya. Kami hadir untuk
                membantu memenuhi kebutuhan kesehatan sehari-hari dengan pelayanan yang
                ramah, cepat, dan profesional.
              </p>
              <p className="mt-4 text-sm md:text-base leading-7 text-slate-600">
                Dengan dukungan layanan yang modern dan mudah diakses, Apotek Sehati
                Jaya Farma berharap dapat menjadi mitra kesehatan terpercaya bagi
                masyarakat dalam menjaga kesehatan diri dan keluarga. Kami selalu
                mengutamakan kenyamanan pelanggan melalui pelayanan yang responsif serta
                informasi penggunaan obat yang jelas dan mudah dipahami.
              </p>
              <p className="mt-4 text-sm md:text-base leading-7 text-slate-600">
                Dengan tenaga yang berpengalaman dan produk dari sumber terpercaya, 
                kami berkomitmen memberikan solusi kesehatan yang aman, praktis, dan 
                dapat diandalkan oleh seluruh masyarakat.
              </p>
            </div>

            {/* RIGHT INFO */}
            <div className="rounded-[2rem] bg-sky-50 p-6 shadow-sm">
              <div className="space-y-5">

                {/* ALAMAT */}
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">
                      Alamat
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      Vila Mutiara Gading 3 Blok H No 1,
                    </p>
                     <p className="mt-1 text-sm leading-6 text-slate-600">
                      Kel. Kebalen, Kec. Babelan, Kab. Bekasi, Jawa Barat 17610
                    </p>
                     <p className="mt-1 text-sm leading-6 text-slate-600">
                    </p>
                  </div>
                </div>

                {/* JAM */}
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">
                      Jam Operasional
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      Setiap Hari • 09:00 - 21:00 WIB
                    </p>
                  </div>
                </div>

                {/* APOTEKER */}
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">
                      Apoteker
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      Nila Yusmiati Ningsih, S.Farm
                    </p>
                  </div>
                </div>

                {/* VISI MISI */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {/* VISI */}
                  <div className="rounded-2xl bg-white p-4 border border-slate-200">
                    <h4 className="text-sm font-semibold text-sky-600">
                      Visi
                    </h4>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Menjadi apotek modern dan terpercaya bagi masyarakat.
                    </p>
                  </div>
                  {/* MISI */}
                  <div className="rounded-2xl bg-white p-4 border border-slate-200">
                    <h4 className="text-sm font-semibold text-sky-600">
                      Misi
                    </h4>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Menyediakan layanan kesehatan, informasi obat,
                      dan website penjualan obat yang mudah diakses.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>


        {/* MAPS */}
        <section className="mt-10">
          <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl ring-1 ring-slate-200">
            <div className="p-6 md:p-8 border-b border-slate-100">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-600">
                Lokasi Apotek
              </p>
            </div>

            <div className="h-[420px] w-full">
              <iframe
                title="map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d8827.097645568714!2d107.03680948879344!3d-6.198661603939187!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e698900698ea5d9%3A0xb978094034fe07b2!2sApotek%20Sehati%20Jaya%20Farma!5e0!3m2!1sid!2sid!4v1778729383317!5m2!1sid!2sid"
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>

        </section>

        {/* MENGAPA MEMILIH APOTEK */}
        <motion.section
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="mt-10"
        >
          <div className="rounded-[2rem] bg-white p-6 md:p-8 shadow-xl ring-1 ring-slate-200">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-600">
                Mengapa Memilih Apotek Sehati Jaya Farma
              </p>
              <p className="mt-4 text-sm md:text-base leading-7 text-slate-600">
                Kami berkomitmen memberikan pelayanan kesehatan terbaik dengan produk berkualitas dan layanan profesional.
              </p>
            </div>

            <div className="mt-10 grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: UserRound,
                  title: 'Apoteker Profesional',
                  description: 'Pelayanan didukung oleh tenaga kefarmasian yang siap membantu memberikan informasi penggunaan obat.'
                },
                {
                  icon: Pill,
                  title: 'Informasi Obat Lengkap',
                  description: 'Setiap produk dilengkapi informasi manfaat, kandungan, dosis, serta efek samping.'
                },
                {
                  icon: FileText,
                  title: 'Upload Resep Mudah',
                  description: 'Pengguna dapat mengunggah resep dokter secara online untuk diverifikasi oleh admin.'
                }
              ].map((item) => {
                const Icon = item.icon
                return (
                  <motion.div
                    key={item.title}
                    variants={fadeUp}
                    className="group rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-sky-200 hover:shadow-xl"
                  >
                    <div className="inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-sky-100 text-sky-700 transition-all duration-300 group-hover:bg-sky-600 group-hover:text-white">
                      <Icon className="h-7 w-7" />
                    </div>
                    <h3 className="mt-5 text-lg font-semibold text-slate-900">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </motion.section>

        {/* CALL TO ACTION */}
        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="mt-10"
        >
          <div className="overflow-hidden rounded-[2rem] bg-gradient-to-r from-sky-100 via-sky-50 to-cyan-100 p-8 shadow-xl ring-1 ring-slate-200">
            <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr] items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-600">Siap Memenuhi Kebutuhan Kesehatan Anda?</p>
                <h2 className="mt-3 text-3xl md:text-4xl font-semibold text-slate-900">
                  Temukan berbagai produk kesehatan berkualitas atau unggah resep dokter dengan mudah melalui Apotek Sehati Jaya Farma.
                </h2>
              </div>

              <div className="flex flex-wrap gap-4">
                <Link href="/produk" className="inline-flex min-w-[150px] items-center justify-center rounded-full bg-sky-600 px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-sky-700">
                  Lihat Produk
                </Link>
                <Link href="/resep" className="inline-flex min-w-[150px] items-center justify-center rounded-full border border-sky-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition-all duration-200 hover:bg-sky-50">
                  Upload Resep
                </Link>
              </div>
            </div>
          </div>
        </motion.section>
      </section>
    </main>
  )
}