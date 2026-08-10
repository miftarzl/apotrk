"use client";

import React from "react";
import Link from "next/link";
import { Facebook, Instagram, Mail, MessageCircle } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();

  if (pathname && pathname.startsWith("/admin")) return null;

  return (
    <footer className="mt-4 border-t border-slate-800 bg-sky-950 text-white">

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.4fr_1fr_1fr]">

          {/* LEFT */}
          <div className="space-y-5">

            <Link href="/">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-white text-sky-700 shadow-sm">
                  <span className="text-base font-bold">
                    AP
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-semibold">
                    Apotek Sehati Jaya Farma
                  </h3>
                  <p className="text-sm text-sky-200">
                    Solusi Kesehatan Terpercaya
                  </p>
                </div>
              </div>
            </Link>

            <div className="space-y-2 text-sm leading-7 text-slate-300">
              <p>
                Vila Mutiara Gading 3 Blok H No 1,
                Kel. Kebalen, Kec. Babelan,
                Kab. Bekasi, Jawa Barat 17610
              </p>
              <p>
                +62 813-1623-9633
              </p>
              <p>
                apoteksehatijayafarma@gmail.com
              </p>
            </div>
          </div>

          {/* QUICK LINKS */}
          <div className="space-y-5">
            <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-200">
              Quick Links
            </h4>

            <div className="flex flex-col gap-3 text-sm text-slate-300">
              <Link
                href="/"
                className="transition hover:text-white"
              >
                Beranda
              </Link>

              <Link
                href="/about"
                className="transition hover:text-white"
              >
                Tentang Kami
              </Link>

              <Link
                href="/produk"
                className="transition hover:text-white"
              >
                Produk
              </Link>

              <Link
                href="/resep"
                className="transition hover:text-white"
              >
                Resep
              </Link>
            </div>
          </div>

          {/* HUBUNGI KAMI */}
          <div className="space-y-5">
            <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-200">
              Hubungi Kami
            </h4>

            <div className="flex flex-col gap-3">
              <a
                href="https://wa.me/6281316239633"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition hover:border-emerald-400 hover:bg-emerald-500/10"
              >
                <MessageCircle className="h-5 w-5 text-emerald-400" />

                <div>
                  <div className="text-sm font-semibold">
                    WhatsApp
                  </div>

                  <div className="text-xs text-slate-300">
                    Chat dengan kami melalui WhatsApp
                  </div>
                </div>
              </a>

              <a
                href="mailto:apoteksehatijayafarma@gmail.com"
                className="inline-flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition hover:border-sky-400 hover:bg-sky-500/10"
              >
                <Mail className="h-5 w-5 text-sky-300" />

                <div>
                  <div className="text-sm font-semibold">
                    Email
                  </div>

                  <div className="text-xs text-slate-300">
                    Kirim pertanyaan kepada kami melalui Email
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* COPYRIGHT */}
      <div className="border-t border-white/25">

        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-sm text-slate-400 md:flex-row">
          <p>
            © {new Date().getFullYear()} Apotek Sehati Jaya Farma. Seluruh Hak Cipta Dilindungi.
          </p>
        </div>

      </div>
    </footer>
  )
}