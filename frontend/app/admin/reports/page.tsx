"use client"
import React, { useEffect, useState } from 'react'
import { useAuth } from '@/lib/AuthContext'
import toast from 'react-hot-toast'

export default function AdminReportsPage(){
  const auth = useAuth()
  const [start, setStart] = useState<string>('')
  const [end, setEnd] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [orders, setOrders] = useState<any[]>([])
  const [summary, setSummary] = useState({ totalTransactions:0, totalRevenue:0, averageTransaction:0 })

  useEffect(()=>{
    // default range: last 30 days
    const now = new Date()
    const e = now.toISOString().slice(0,10)
    const sDate = new Date(now)
    sDate.setDate(sDate.getDate() - 29)
    const s = sDate.toISOString().slice(0,10)
    setStart(s); setEnd(e)
  },[])

  if (auth.loading) return <div>Checking session...</div>
  if (!auth.user) return null
  if (auth.user.role !== 'admin') return <div>Access denied</div>

  function formatRp(n:any){ return `Rp ${Number(n||0).toLocaleString('id-ID')}` }

  function formatDateOnly(d:any){
    const dt = new Date(d)
    return dt.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  function formatDateRange(s:string,e:string){
    const sd = new Date(s)
    const ed = new Date(e)
    return `${sd.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} - ${ed.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`
  }

  function formatPrintDate(d:Date){
    const dt = new Date(d)
    const date = dt.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    const time = dt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    return `${date} ${time}`
  }

  async function fetchReports(){
    if (!start || !end) { toast.error('Pilih tanggal mulai dan akhir'); return }
    setLoading(true)
    try{
      const api = process.env.NEXT_PUBLIC_API_URL || ''
      const r = await fetch(`${api}/admin/reports?start=${start}&end=${end}`, { credentials: 'include' })
      const j = await r.json().catch(()=>null)
      if (!r.ok) { toast.error(j?.error || 'Gagal mengambil laporan'); setLoading(false); return }
      setOrders(j.orders || [])
      setSummary(j.summary || { totalTransactions:0, totalRevenue:0, averageTransaction:0 })
    }catch(e){ console.error(e); toast.error('Server error') }
    finally{ setLoading(false) }
  }

  async function printPDF(){
    if (!start || !end) { toast.error('Pilih tanggal dulu'); return }
    // PDF REPORT TEMPLATE START
    // prepare printable HTML with professional layout (A4 landscape)
    const container = document.createElement('div')
    container.style.padding = '16px'
    container.style.background = 'white'
    container.style.color = 'black'
    container.style.fontFamily = 'Arial, Helvetica, sans-serif'
    container.style.fontSize = '12px'

    // Header
    const header = document.createElement('div')
    header.style.textAlign = 'center'
    header.innerHTML = `
      <div style="font-weight:700;font-size:20px">APOTEK SEHATI JAYA FARMA</div>
      <div style="font-weight:600;font-size:16px;margin-top:4px">LAPORAN PENJUALAN</div>
      <div style="font-size:12px;margin-top:6px">Periode: ${formatDateRange(start,end)}</div>
      <hr style="margin-top:12px;margin-bottom:12px;border:none;border-top:2px solid #333"/>
    `
    container.appendChild(header)

    // Summary boxes
    const summ = document.createElement('div')
    summ.style.display = 'flex'
    summ.style.justifyContent = 'space-between'
    summ.style.gap = '12px'
    summ.style.marginBottom = '12px'

    const boxStyle = `flex:1;padding:10px;border:1px solid #ccc;background:#f5f5f7;border-radius:6px;text-align:center`
    const totalTx = document.createElement('div')
    totalTx.setAttribute('style', boxStyle)
    totalTx.innerHTML = `<div style="font-size:11px;color:#333">Total Transaksi</div><div style="font-weight:700;font-size:18px;margin-top:6px">${summary.totalTransactions}</div>`

    const totalRev = document.createElement('div')
    totalRev.setAttribute('style', boxStyle)
    totalRev.innerHTML = `<div style="font-size:11px;color:#333">Total Pendapatan</div><div style="font-weight:700;font-size:18px;margin-top:6px">${formatRp(summary.totalRevenue)}</div>`

    const avgTx = document.createElement('div')
    avgTx.setAttribute('style', boxStyle)
    avgTx.innerHTML = `<div style="font-size:11px;color:#333">Rata-rata Transaksi</div><div style="font-weight:700;font-size:18px;margin-top:6px">${formatRp(summary.averageTransaction)}</div>`

    summ.appendChild(totalTx)
    summ.appendChild(totalRev)
    summ.appendChild(avgTx)
    container.appendChild(summ)

    // Table
    const table = document.createElement('table')
    table.style.width = '100%'
    table.style.borderCollapse = 'collapse'
    table.style.marginTop = '8px'
    table.innerHTML = `
      <thead>
        <tr>
          <th style="background:#0b63a7;color:#fff;font-weight:700;padding:8px;border:1px solid #0b63a7;text-align:left">No</th>
          <th style="background:#0b63a7;color:#fff;font-weight:700;padding:8px;border:1px solid #0b63a7;text-align:left">Order Code</th>
          <th style="background:#0b63a7;color:#fff;font-weight:700;padding:8px;border:1px solid #0b63a7;text-align:left">Tanggal</th>
          <th style="background:#0b63a7;color:#fff;font-weight:700;padding:8px;border:1px solid #0b63a7;text-align:left">Nama Pembeli</th>
          <th style="background:#0b63a7;color:#fff;font-weight:700;padding:8px;border:1px solid #0b63a7;text-align:right">Total</th>
        </tr>
      </thead>
      <tbody>
        ${orders.map((o,i)=>{
          const rowBg = i % 2 === 0 ? '#ffffff' : '#f7f9fb'
          const tanggal = o.created_at ? formatDateOnly(o.created_at) : ''
          return `<tr style="background:${rowBg};color:#000">
            <td style="padding:8px;border:1px solid #e6eef6">${i+1}</td>
            <td style="padding:8px;border:1px solid #e6eef6">${o.order_code || ''}</td>
            <td style="padding:8px;border:1px solid #e6eef6">${tanggal}</td>
            <td style="padding:8px;border:1px solid #e6eef6">${o.username || '-'}</td>
            <td style="padding:8px;border:1px solid #e6eef6;text-align:right">${formatRp(o.total_amount)}</td>
          </tr>`
        }).join('')}
      </tbody>
    `
    container.appendChild(table)

    // Footer (right aligned)
    const footer = document.createElement('div')
    footer.style.display = 'flex'
    footer.style.justifyContent = 'flex-end'
    footer.style.marginTop = '12px'
    footer.style.fontSize = '11px'
    footer.innerHTML = `
      <div style="text-align:right">
        <div>Dicetak pada:</div>
        <div style="font-weight:600;margin-bottom:6px">${formatPrintDate(new Date())} WIB</div>
        <div>Apotek Sehati Jaya Farma</div>
      </div>
    `
    container.appendChild(footer)

    document.body.appendChild(container)

    try{
      const mod = await import('html2pdf.js')
      const html2pdf = (mod && (mod as any).default) || mod
      await html2pdf().from(container).set({
        margin: 10,
        filename: `Laporan_Penjualan_${start}_${end}.pdf`,
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
      }).save()
    }catch(e){ console.error(e); toast.error('Gagal membuat PDF') }
    document.body.removeChild(container)
    // PDF REPORT TEMPLATE END
  }

  return (
    <div className="max-w-6xl mx-auto px-4">
      <h2 className="text-2xl font-semibold mb-4">Laporan Penjualan</h2>

      <div className="flex items-end gap-3 mb-4">
        <div>
          <label className="text-sm text-slate-300 block mb-1">Dari Tanggal</label>
          <input type="date" value={start} onChange={e=>setStart(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200" />
        </div>
        <div>
          <label className="text-sm text-slate-300 block mb-1">Sampai Tanggal</label>
          <input type="date" value={end} onChange={e=>setEnd(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200" />
        </div>
        <div className="ml-auto flex gap-2">
          <button onClick={fetchReports} className="bg-sky-500 hover:bg-sky-600 rounded-lg px-4 py-2 text-black">Tampilkan</button>
          <button onClick={printPDF} className="bg-white/5 hover:bg-white/10 rounded-lg px-4 py-2">Cetak PDF</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="text-sm text-slate-200">Total Transaksi</div>
          <div className="text-2xl font-semibold text-slate-200">{summary.totalTransactions}</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="text-sm text-slate-200">Total Pendapatan</div>
          <div className="text-2xl font-semibold text-slate-200">{formatRp(summary.totalRevenue)}</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="text-sm text-slate-200">Rata-rata Transaksi</div>
          <div className="text-2xl font-semibold text-slate-200">{formatRp(summary.averageTransaction)}</div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl bg-white/5 border border-white/6 p-2">
        {loading ? (
          <div className="py-6 text-center text-slate-200">Memuat data laporan...</div>
        ) : (
          (() => {
            if (!orders || orders.length === 0) return <div className="py-8 text-center text-slate-200">Tidak ada data untuk periode ini.</div>
            return (
              <table className="min-w-full table-auto">
                <thead className="bg-white/3 sticky top-0 backdrop-blur-sm">
                  <tr>
                    <th className="text-left p-3 text-sm text-slate-300">No</th>
                    <th className="text-left p-3 text-sm text-slate-300">Order Code</th>
                    <th className="text-left p-3 text-sm text-slate-300">Tanggal</th>
                    <th className="text-left p-3 text-sm text-slate-300">Nama Pembeli</th>
                    <th className="text-left p-3 text-sm text-slate-300">Total</th>
                    <th className="text-left p-3 text-sm text-slate-300">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o,i)=> (
                    <tr key={o.id} className="border-b border-white/6 hover:bg-white/2">
                      <td className="p-3 text-sm text-slate-200">{i+1}</td>
                      <td className="p-3 text-sm text-slate-200">{o.order_code}</td>
                      <td className="p-3 text-sm text-slate-200">{o.created_at ? new Date(o.created_at).toLocaleString('id-ID') : ''}</td>
                      <td className="p-3 text-sm text-slate-200"><div className="font-medium text-slate-200">{o.username || '-'}</div></td>
                      <td className="p-3 text-sm text-slate-200">{formatRp(o.total_amount)}</td>
                      <td className="p-3 text-sm text-slate-200 whitespace-nowrap">
                        <span className={
                          `inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium border ` +
                          (o.order_status === 'Menunggu Pembayaran' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' :
                           o.order_status === 'Lunas' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                           o.order_status === 'Diproses' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' :
                           o.order_status === 'Dikirim' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                           o.order_status === 'Selesai' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                           o.order_status === 'Dibatalkan' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                           'bg-gray-500/20 text-gray-300 border border-gray-500/30')
                        }>{o.order_status || '-'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          })()
        )}
      </div>
    </div>
  )
}
