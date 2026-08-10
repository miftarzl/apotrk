"use client"
import React, { useState } from 'react'
import Papa from 'papaparse'

export default function ImportCsvPage(){
  const [csvText, setCsvText] = useState('')
  const [preview, setPreview] = useState<any[]>([])
  const [errors, setErrors] = useState<any[]>([])
  const [result, setResult] = useState<any>(null)

  function handleFile(e:any){
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev)=>{
      const text = ev.target?.result as string
      setCsvText(text)
      const parsed = Papa.parse(text, { header: true, skipEmptyLines: true })
      setPreview(parsed.data as any[])
    }
    reader.readAsText(file)
  }

  async function importCsv(){
    const res = await fetch('/api/import', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_KEY || '' }, body: JSON.stringify({ csv: csvText }) })
    const j = await res.json()
    setResult(j)
  }

  return (
    <main className="p-6">
      <h2 className="text-2xl font-semibold">Import CSV Obat</h2>
      <input type="file" accept=".csv" onChange={handleFile} className="mt-4" />
      <div className="mt-4">
        <h3 className="font-medium">Preview ({preview.length} rows)</h3>
        <div className="overflow-auto max-h-64 border rounded mt-2">
          <table className="w-full text-sm">
            <thead>
              <tr>{preview[0] && Object.keys(preview[0]).map((k)=> <th key={k} className="p-2 border">{k}</th>)}</tr>
            </thead>
            <tbody>
              {preview.map((r, idx)=> (
                <tr key={idx}>{Object.values(r).map((v,i)=><td key={i} className="p-2 border">{String(v).slice(0,80)}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3">
          <button className="btn btn-primary" onClick={importCsv}>Import</button>
        </div>
        {result && <pre className="mt-3 bg-slate-50 p-3 rounded">{JSON.stringify(result, null, 2)}</pre>}
      </div>
    </main>
  )
}
