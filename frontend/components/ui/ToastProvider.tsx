"use client"
import React from 'react'
import { Toaster } from 'react-hot-toast'

export default function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      reverseOrder={false}
      toastOptions={{
        duration: 3500,
        style: {
          background: 'rgba(15, 23, 42, 0.96)',
          color: '#f8fafc',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          boxShadow: '0 20px 45px rgba(15, 23, 42, 0.15)',
          borderRadius: '1rem',
          padding: '14px 18px'
        },
        success: {
          iconTheme: {
            primary: '#22c55e',
            secondary: '#ffffff'
          }
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: '#ffffff'
          }
        },
        loading: {
          iconTheme: {
            primary: '#38bdf8',
            secondary: '#ffffff'
          }
        }
      }}
    />
  )
}
