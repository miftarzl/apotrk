'use client'
import React from 'react'

type Props = {
  from: 'bot' | 'user'
  text: string
  time: string
}

function renderText(text: string) {
  const parts = text.split(/(\/produk\/[A-Za-z0-9-]+)/g)
  return parts.map((part, index) => {
    if (part.startsWith('/produk/')) {
      return (
        <a key={index} href={part} className="font-semibold text-blue-600 underline underline-offset-2">
          Lihat Detail
        </a>
      )
    }
    return <span key={index}>{part}</span>
  })
}

export default function ChatMessage({ from, text, time }: Props) {
  const isBot = from === 'bot'
  return (
    <div className={`my-3 flex ${isBot ? 'justify-start' : 'justify-end'}`}>
      <div className={`${isBot ? 'bg-white text-slate-900' : 'bg-blue-600 text-white'} max-w-[80%] rounded-3xl px-4 py-3 shadow-sm`}>
        <div className="whitespace-pre-wrap text-xs leading-6">{renderText(text)}</div>
        <div className={`mt-2 text-[11px] ${isBot ? 'text-slate-400' : 'text-slate-200'} text-right`}>{time}</div>
      </div>
    </div>
  )
}
