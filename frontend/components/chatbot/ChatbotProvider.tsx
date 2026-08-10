'use client'
import React from 'react'
import { usePathname } from 'next/navigation'
import ChatbotButton from './ChatbotButton'

export default function ChatbotProvider() {
  const pathname = usePathname() || ''
  // hide on admin pages
  if (pathname.startsWith('/admin')) return null
  return <ChatbotButton />
}
