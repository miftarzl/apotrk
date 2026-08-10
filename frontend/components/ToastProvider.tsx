"use client"
import React from 'react'
import { Toaster } from 'react-hot-toast'

export default function ToastProvider(){
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 3000,
        style: {
          background: 'rgba(255,255,255,0.06)',
          color: '#e6eef8',
          backdropFilter: 'blur(6px)',
          border: '1px solid rgba(255,255,255,0.06)'
        }
      }}
    />
  )
}
