'use client'
import React, { useState } from 'react'
import ChatbotWindow from './ChatbotWindow'

export default function ChatbotButton() {
  const [open, setOpen] = useState(false)
  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-all hover:bg-blue-700"
          aria-label="Buka chat"
        >
          💬
        </button>
      )}
      {open && <ChatbotWindow onClose={() => setOpen(false)} />}
    </>
  )
}
