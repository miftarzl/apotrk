"use client"
import React from 'react'
import Modal from './Modal'
import { BadgeCheck } from 'lucide-react'

type SuccessDialogProps = {
  open: boolean
  title: string
  description: string
  onClose: () => void
}

export default function SuccessDialog({ open, title, description, onClose }: SuccessDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} description={description} role="alertdialog">
      <div className="flex items-center gap-3 rounded-3xl border border-emerald-100 bg-emerald-50 p-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
          <BadgeCheck size={24} />
        </div>
        <div className="text-sm text-slate-600">
          {description}
        </div>
      </div>

      <div className="flex justify-end mt-4">
        <button
          type="button"
          onClick={onClose}
          className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
        >
          Tutup
        </button>
      </div>
    </Modal>
  )
}
