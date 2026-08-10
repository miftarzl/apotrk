"use client"
import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { supabase } from '@/lib/supabaseClient'

export default function UploadImagePage() {
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [msg, setMsg] = useState('')

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return
    // validate type
    if (!['image/png','image/jpeg','image/jpg','image/webp'].includes(file.type)) return setMsg('Format gambar tidak didukung')
    setFilePreview(URL.createObjectURL(file))
    // compress using canvas
    const img = document.createElement('img')
    img.src = URL.createObjectURL(file)
    img.onload = async () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const maxW = 1200
      const scale = Math.min(1, maxW / img.width)
      canvas.width = img.width * scale
      canvas.height = img.height * scale
      if (ctx) ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(async (blob: Blob | null) => {
        if (!blob) return setMsg('Gagal memproses gambar')
        const name = `images/${Date.now()}-${file.name}`
        const { data, error } = await supabase.storage.from('images').upload(name, blob, {
          cacheControl: '3600', upsert: false, contentType: file.type
        })
        if (error) return setMsg(error.message)
        const publicUrl = supabase.storage.from('images').getPublicUrl(name).data.publicUrl
        setMsg('Upload sukses: ' + publicUrl)
        setProgress(100)
      }, 'image/jpeg', 0.8)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  return (
    <main className="p-6">
      <h2 className="text-2xl font-semibold">Upload Gambar Obat</h2>
      <div {...getRootProps()} className="mt-4 p-6 border-dashed border-2 rounded text-center">
        <input {...getInputProps()} />
        {isDragActive ? <p>Drop here ...</p> : <p>Drag & drop gambar, atau klik untuk pilih</p>}
      </div>
      {filePreview && <img src={filePreview} alt="preview" className="mt-4 max-h-64" />}
      {progress > 0 && <div className="mt-2">Progress: {progress}%</div>}
      {msg && <div className="mt-2 text-sm text-slate-600">{msg}</div>}
    </main>
  )
}
