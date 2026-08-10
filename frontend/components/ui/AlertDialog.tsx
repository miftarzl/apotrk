"use client"
import React from 'react'
import Modal from './Modal'
import { Info } from 'lucide-react'

type AlertDialogProps = {
  open: boolean
  title: string
  description: string
  onClose: () => void
}

export default function AlertDialog({ open, title, description, onClose }: AlertDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} description={description} role="alertdialog">
      <div className="flex items-start gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
          <Info size={24} />
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
