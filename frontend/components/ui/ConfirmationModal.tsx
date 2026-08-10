"use client"
import React from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, BadgeCheck, CircleAlert, LogOut, ShieldCheck, Trash2 } from 'lucide-react'
import Modal from './Modal'

type ConfirmationVariant = 'danger' | 'success' | 'warning' | 'info' | 'default' | 'logout'

type ConfirmationModalProps = {
  open: boolean
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: ConfirmationVariant
  loading?: boolean
  onConfirm: () => Promise<void> | void
  onCancel: () => void
}

const variantConfig: Record<ConfirmationVariant, { icon: React.ReactNode; label: string; accent: string; confirmClass: string }> = {
  danger: {
    icon: <Trash2 className="h-6 w-6 text-red-600" />,
    label: 'Hapus Data',
    accent: 'bg-red-600 hover:bg-red-700',
    confirmClass: 'bg-red-600 hover:bg-red-700'
  },
  logout: {
    icon: <LogOut className="h-6 w-6 text-blue-600" />,
    label: 'Keluar',
    accent: 'bg-blue-600 hover:bg-blue-700',
    confirmClass: 'bg-blue-600 hover:bg-blue-700'
  },
  success: {
    icon: <BadgeCheck className="h-6 w-6 text-emerald-600" />,
    label: 'Berhasil',
    accent: 'bg-emerald-600 hover:bg-emerald-700',
    confirmClass: 'bg-emerald-600 hover:bg-emerald-700'
  },
  warning: {
    icon: <AlertTriangle className="h-6 w-6 text-amber-500" />,
    label: 'Perhatian',
    accent: 'bg-amber-500 hover:bg-amber-600',
    confirmClass: 'bg-amber-500 hover:bg-amber-600'
  },
  info: {
    icon: <CircleAlert className="h-6 w-6 text-sky-600" />,
    label: 'Informasi',
    accent: 'bg-sky-600 hover:bg-sky-700',
    confirmClass: 'bg-sky-600 hover:bg-sky-700'
  },
  default: {
    icon: <ShieldCheck className="h-6 w-6 text-sky-600" />,
    label: 'Konfirmasi',
    accent: 'bg-sky-600 hover:bg-sky-700',
    confirmClass: 'bg-sky-600 hover:bg-sky-700'
  }
}

export default function ConfirmationModal({
  open,
  title,
  description,
  confirmText = 'Konfirmasi',
  cancelText = 'Batal',
  variant = 'default',
  loading = false,
  onConfirm,
  onCancel
}: ConfirmationModalProps) {
  const config = variantConfig[variant] ?? variantConfig.default

  return (
    <Modal open={open} onClose={onCancel} title={title} description={description} role="alertdialog" portalZIndex={100000} hideFooter>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="space-y-6"
      >
        <div className="flex items-center gap-3 rounded-3xl border border-sky-100 bg-sky-50/80 p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
            {config.icon}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">{config.label}</p>
            {description ? <p className="mt-1 text-sm text-slate-600">{description}</p> : null}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`rounded-2xl px-4 py-2 text-sm font-medium text-white transition ${config.confirmClass} disabled:cursor-not-allowed disabled:opacity-60`}
          >
            {loading ? 'Memproses...' : confirmText}
          </button>
        </div>
      </motion.div>
    </Modal>
  )
}
