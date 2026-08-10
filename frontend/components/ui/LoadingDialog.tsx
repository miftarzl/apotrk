"use client"
import React from 'react'
import { motion } from 'framer-motion'

type LoadingDialogProps = {
  open: boolean
  title?: string
  description?: string
}

export default function LoadingDialog({ open, title = 'Memproses...', description = 'Mohon tunggu sebentar.' }: LoadingDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl"
        role="status"
        aria-live="polite"
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-sky-50 text-sky-600 shadow-inner">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-sky-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            <p className="mt-2 text-sm text-slate-600">{description}</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
