'use client'
import React, { useState, useRef, useEffect } from 'react'

type Props = { onSend: (text: string) => void }

export default function ChatInput({ onSend }: Props) {
  const [text, setText] = useState('')
  const ref = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => { ref.current?.focus() }, [])

  function submit() {
    const t = text.trim()
    if (!t) return
    onSend(t)
    setText('')
  }

  return (
    <div className="flex items-center gap-2 rounded-3xl border border-slate-200 bg-slate-100 px-3 py-2 shadow-sm">
      <textarea
        ref={ref}
        value={text}
        rows={1}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            submit()
          }
        }}
        placeholder="Tanyakan sesuatu..."
        className="flex-1 resize-none border-none bg-transparent px-2 py-2 text-xs outline-none placeholder:text-slate-400 focus:ring-0"
      />
      <button
        onClick={submit}
        className="rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
      >
        Kirim
      </button>
    </div>
  )
}
