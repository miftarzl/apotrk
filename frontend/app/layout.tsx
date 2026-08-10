import '../styles/globals.css'
import React, { Suspense } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { ToastProvider } from '../components/ui'
import { AuthProvider } from '../lib/AuthContext'
import { Plus_Jakarta_Sans } from 'next/font/google'
import dynamic from 'next/dynamic'

const ChatbotProvider = dynamic(() => import('../components/chatbot/ChatbotProvider'), { ssr: false })

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-plus-jakarta',
})

export const metadata = {
  title: 'Apotek Sehati Jaya Farma',
  icons: {
    icon: '/images/logoapoteks.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={plusJakarta.variable}>
      <head />
      <body className="text-slate-800 font-sans flex flex-col min-h-screen">
        <AuthProvider>
          <Suspense fallback={null}>
            <Navbar />
          </Suspense>
          <main className="flex-1">{children}</main>
          <Footer />
          <ToastProvider />
          <ChatbotProvider />
        </AuthProvider>
      </body>
    </html>
  )
}

