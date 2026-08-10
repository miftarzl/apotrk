"use client"
import React, { useEffect, useMemo, useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'

export default function Modal({
  open,
  title,
  description,
  children,
  onClose,
  onConfirm,
  confirmLabel = 'Ya, Hapus',
  cancelLabel = 'Batal',
  hideFooter = false,
  loading = false,
  className = '',
  role = 'dialog',
  closeOnEsc = true,
  portalZIndex = 99999
}: {
  open: boolean
  title?: string
  description?: string
  children?: React.ReactNode
  onClose?: ()=>void
  onConfirm?: ()=>Promise<void> | void
  confirmLabel?: string
  cancelLabel?: string | null
  hideFooter?: boolean
  loading?: boolean
  className?: string
  role?: string
  closeOnEsc?: boolean
  portalZIndex?: number
}){
  const modalRef = useRef<HTMLDivElement>(null)
  const previousFocus = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return
    previousFocus.current = document.activeElement as HTMLElement | null

    const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])'
    )
    const first = focusable?.[0]

    window.setTimeout(() => {
      if (first) first.focus()
    }, 0)

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && closeOnEsc) {
        event.preventDefault()
        onClose?.()
        return
      }

      if (event.key !== 'Tab' || !modalRef.current) return

      const focusableElements = Array.from(
        modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => !el.hasAttribute('disabled'))

      if (focusableElements.length === 0) return

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      previousFocus.current?.focus()
    }
  }, [open, onClose, closeOnEsc])

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const portalRoot = useMemo(() => {
    if (typeof document === 'undefined') return null
    return document.body
  }, [])

  if (!mounted || !portalRoot) return null

  const modalContent = (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: portalZIndex }}>
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            ref={modalRef}
            role={role}
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}
            className={`relative z-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white text-slate-900 shadow-2xl p-6 ${className}`}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
          >
            {title ? (
              <h3 id="modal-title" className="text-xl font-semibold text-slate-900 mb-2">
                {title}
              </h3>
            ) : null}
            {description ? <p className="mb-4 text-sm text-slate-600">{description}</p> : null}

            <div className="mb-6">
              {children}
            </div>

            {!hideFooter && (onConfirm || cancelLabel) ? (
              <div className="flex justify-end gap-3">
                {cancelLabel ? (
                  <button
                    type="button"
                    className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                    onClick={onClose}
                    disabled={loading}
                  >
                    {cancelLabel}
                  </button>
                ) : null}

                {onConfirm ? (
                  <button
                    type="button"
                    className="rounded-2xl bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
                    onClick={onConfirm}
                    disabled={loading}
                  >
                    {loading ? 'Memproses...' : confirmLabel}
                  </button>
                ) : null}
              </div>
            ) : null}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  )

  return ReactDOM.createPortal(modalContent, portalRoot)
}
