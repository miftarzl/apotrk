"use client"

import React, { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import Image from "next/image";
import { useAuth } from '../../lib/AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [msg, setMsg] = useState('')
  const { login } = useAuth()

  async function signIn(e?: React.FormEvent) {
    e?.preventDefault()
    setMsg('')
    try{
      const res = await login(email, password)
      if (!res.ok) setMsg(res.error || 'Login gagal')
    }catch(e:any){ setMsg(e?.message || 'Login error') }
  }

  return (
    <div className="flex justify-center pt-[88px]">
      <div className="w-full max-w-md p-6">
        <div className="rounded-2xl bg-white p-6 shadow-xl ring-1 ring-slate-200">
          <div className="flex flex-col items-center gap-3 mb-4">
            <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
              <Image
                src="/images/logoapotek.png"
                alt="Logo Apotek Sehati Jaya Farma"
                width={48}
                height={48}
                className="w-12 h-12 object-contain"
                priority
              />
            </div>
            <h1 className="text-2xl font-semibold text-slate-900">Selamat Datang</h1>
            <p className="text-sm text-slate-600 text-center">Masuk untuk mengakses akun dan melanjutkan transaksi Anda.</p>
          </div>

          <form className="space-y-4" onSubmit={signIn}>
            <div>
              <label className="block text-sm text-slate-700 mb-1">Email</label>
              <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="email@example.com" className="input" />
            </div>

            <div>
              <label className="block text-sm text-slate-700 mb-1">Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"}autoComplete="new-password"name="register_password"value={password}onChange={(e) => setPassword(e.target.value)}placeholder="Masukkan password"className="input pr-12"/>

                <button type="button" onClick={() => setShowPassword(!showPassword)}className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700">
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>

              </div>
            </div>

            {msg && <div className="text-sm text-red-600">{msg}</div>}

            <div>
              <button type="submit" className="w-full py-3 rounded-2xl btn btn-primary">MASUK</button>
            </div>

            <div className="text-center text-sm text-slate-600">
              Belum punya akun? <Link href="/register" className="text-sky-600 font-semibold">DAFTAR</Link>
            </div>
          </form>

        </div>
      </div>
    </div>
  )
}
