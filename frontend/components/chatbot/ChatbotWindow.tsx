'use client'
import React, { useState, useRef, useEffect } from 'react'
import ChatMessage from './ChatMessage'
import ChatInput from './ChatInput'
import { sendToChatbot } from '../../services/chatbotService'

const suggestions = [
  'Informasi Obat',
  'Cara Upload Resep',
  'Cara Pesan Obat',
  'Jam Operasional',
  'Kontak',
  'Kategori Obat',
  'Cek Pesanan'
]

function formatTime(date: Date) {
  return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

export default function ChatbotWindow({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<{ from: 'bot' | 'user'; text: string; time: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const bottomRef = useRef<HTMLDivElement | null>(null)
  const [headerHeight, setHeaderHeight] = useState(0)

  useEffect(() => {
    const greeting = `Halo 👋\n\nSelamat datang di Asisten Virtual Apotek Sehati Jaya Farma.\n\nSaya siap membantu Anda mendapatkan informasi mengenai produk obat, resep dokter, serta layanan yang tersedia.\n\nSilakan ketik pertanyaan Anda untuk memulai percakapan.`
    setMessages([{ from: 'bot', text: greeting, time: formatTime(new Date()) }])
  }, [])

  // calculate header height to ensure chatbot never overlaps the navbar
  useEffect(() => {
    function updateHeaderHeight() {
      const header = document.querySelector('header') as HTMLElement | null
      const h = header ? Math.ceil(header.getBoundingClientRect().height) : 0
      setHeaderHeight(h)
    }
    updateHeaderHeight()
    window.addEventListener('resize', updateHeaderHeight)
    window.addEventListener('orientationchange', updateHeaderHeight)
    return () => {
      window.removeEventListener('resize', updateHeaderHeight)
      window.removeEventListener('orientationchange', updateHeaderHeight)
    }
  }, [])

  useEffect(() => {
    if (minimized) return

    const timeout = window.setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }, 50)

    return () => window.clearTimeout(timeout)
  }, [messages, loading, minimized])

  async function handleSend(text: string) {
    const time = formatTime(new Date())
    setMessages(prev => [...prev, { from: 'user', text, time }])
    setLoading(true)
    try {
      const res = await sendToChatbot(text)
      const reply = res.reply || 'Maaf, server tidak merespon.'
      setMessages(prev => [...prev, { from: 'bot', text: reply, time: formatTime(new Date()) }])
    } catch (err) {
      setMessages(prev => [...prev, { from: 'bot', text: 'Terjadi kesalahan saat menghubungi server.', time }])
    } finally {
      setLoading(false)
    }
  }

  if (minimized) {
    return (
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-lg">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <span>Asisten Apotek</span>
          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">Minimized</span>
        </div>
        <button
          type="button"
          onClick={() => setMinimized(false)}
          className="rounded-full bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
        >
          Buka
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          aria-label="Tutup chat"
        >
          ✕
        </button>
      </div>
    )
  }

    const bottomOffset = 24 // matches tailwind bottom-6 (1.5rem = 24px)

    return (
    <div
      className="fixed bottom-6 right-6 z-[9999] flex h-[680px] w-[90vw] max-w-[420px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl transition-all duration-300 ease-out md:w-[420px]"
      style={{ maxHeight: `calc(100vh - ${headerHeight + bottomOffset}px)` }}
    >
      <div className="sticky top-0 z-20 flex flex-none items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">🩺</div>
          <div>
            <div className="text-sm font-semibold text-slate-900">Asisten Apotek</div>
            <div className="text-[11px] text-slate-500">Knowledge-Based Chatbot</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMinimized(true)}
            className="rounded-full px-3 py-2 text-xs text-slate-600 transition hover:bg-slate-200"
          >
            Minimize
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-200 hover:text-slate-900"
            aria-label="Tutup chat"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col" style={{ backgroundColor: '#eff5fc' }}>
        <div className="flex-1 min-h-0 overflow-hidden">
          <div className="h-full overflow-y-auto overflow-x-hidden px-4 py-4">
            {messages.map((m, i) => (
              <ChatMessage key={i} from={m.from} text={m.text} time={m.time} />
            ))}
            {loading && (
              <div className="my-2 flex justify-start">
                <div className="max-w-[80%] rounded-2xl px-4 py-3 text-xs italic text-slate-800 shadow" style={{ backgroundColor: '#eff5fc' }}>
                  Sedang mengetik...
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        {messages.length <= 1 && (
          <div className="flex-none border-t border-slate-200 bg-white px-4 py-3">
            <div className="mb-2 text-xs font-semibold text-slate-700">Coba tanya:</div>
            <div className="flex flex-wrap gap-2">
              {suggestions.map(suggestion => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => handleSend(suggestion)}
                  className="rounded-full border border-slate-200 bg-slate-100 px-2 py-1 text-xs text-slate-700 transition hover:border-blue-300 hover:bg-blue-50"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex-none border-t border-slate-200 bg-white px-3 py-3">
          <ChatInput onSend={handleSend} />
        </div>
      </div>
    </div>
  )
}
