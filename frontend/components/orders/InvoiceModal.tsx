"use client"
import React, { useRef } from 'react'
import Modal from '../ui/Modal'
import { FileText, Printer } from 'lucide-react'

export default function InvoiceModal({ order, open, onClose }:{order:any, open:boolean, onClose:()=>void}){
  const ref = useRef<HTMLDivElement|null>(null)

  function formatRupiah(v:any){
    if (v === null || v === undefined) return '-'
    return Number(v).toLocaleString('id-ID')
  }

  function badgeClassPayment(status:any){
    switch(status){
      case 'pending': return 'bg-amber-100 text-amber-800'
      case 'paid': return 'bg-emerald-100 text-emerald-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-slate-100 text-slate-700'
    }
  }

  function badgeClassOrder(status:any){
    switch(status){
      case 'Menunggu Pembayaran': return 'bg-amber-100 text-amber-800'
      case 'Lunas': return 'bg-emerald-100 text-emerald-800'
      case 'Diproses': return 'bg-sky-100 text-sky-800'
      case 'Dikirim': return 'bg-violet-100 text-violet-800'
      case 'Selesai': return 'bg-emerald-200 text-emerald-900'
      case 'Dibatalkan': return 'bg-red-100 text-red-800'
      default: return 'bg-slate-100 text-slate-700'
    }
  }

  async function handleDownloadInvoice(){
    if (!order) return
    try{
      const html2pdf = (await import('html2pdf.js')).default || (await import('html2pdf.js'))
      const el = ref.current
      if (!el) return
      const opt = {
        margin:       10,
        filename:     `Invoice-${order.order_code || order.id}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      }
      // @ts-ignore
      html2pdf().set(opt).from(el).save()
      return
    }catch(e){
      window.print()
    }
  }

  if (!order) return null

  return (
    <Modal
      open={open}
      title={undefined}
      onClose={onClose}
      confirmLabel={undefined}
      cancelLabel={null}
      className="max-w-[1000px] rounded-xl"
    >
      <div
        ref={ref}
        id="invoice-content"
        className="bg-white rounded-xl p-8 text-slate-900"
      >

        {/* HEADER */}
        <div className="text-center border-b border-slate-200 pb-6">

          <h1 className="text-3xl font-bold tracking-wide text-slate-900">
            APOTEK SEHATI JAYA FARMA
          </h1>

          <div className="mt-2">
            <p className="text-sm font-semibold text-slate-800">
              Faktur #{order.order_code}
            </p>
          </div>
        </div>

        {/* DATA PEMESAN & INFORMASI PESANAN */}
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* DATA PEMESAN */}
          <div className="overflow-hidden border border-slate-200 rounded-2xl">

            <div className="bg-sky-100 px-4 py-4 border-b">
              <h4 className="font-bold text-slate-800">
                Data Pemesan
              </h4>
            </div>

            <div className="p-4 space-y-4 text-sm">

              <div className="flex justify-between gap-4">
                <span className="font-bold text-slate-800">
                  Nama Pemesan
                </span>

                <span className="text-right text-slate-700">
                  {order.recipient_name}
                </span>
              </div>

              <div className="border-t"></div>

              <div className="flex justify-between gap-4">
                <span className="font-bold text-slate-800">
                  No. Telepon
                </span>

                <span className="text-right text-slate-700">
                  {order.recipient_phone}
                </span>
              </div>

              <div className="border-t"></div>

              <div>
                <div className="font-bold text-slate-800 mb-2">
                  Alamat Pengiriman
                </div>

                <div className="text-slate-700 leading-relaxed">
                  {order.address_detail}, Kel. {order.village},
                  Kec. {order.district}, {order.city},
                  {order.postal_code}
                </div>
              </div>

            </div>

          </div>

          {/* INFORMASI PESANAN */}
          <div className="overflow-hidden border border-slate-200 rounded-2xl">

            <div className="bg-sky-100 px-4 py-4 border-b">
              <h4 className="font-bold text-slate-800">
                Informasi Pesanan
              </h4>
            </div>

            <div className="p-4 space-y-4 text-sm">

              <div className="flex justify-between gap-4">
                <span className="font-bold text-slate-800">
                  Kode Pesanan
                </span>

                <span className="text-right text-slate-700">
                  {order.order_code}
                </span>
              </div>

              <div className="border-t"></div>

              <div className="flex justify-between gap-4">
                <span className="font-bold text-slate-800">
                  Tanggal Pesanan
                </span>

                <span className="text-right text-slate-700">
                  {new Date(
                    order.created_at ||
                    order.createdAt ||
                    Date.now()
                  ).toLocaleString("id-ID")}
                </span>
              </div>

              <div className="border-t"></div>

              {/* <div className="flex justify-between gap-4">
                <span className="font-bold text-slate-800">
                  Status Pembayaran
                </span>

                <span
                  className={`px-2 py-1 rounded-lg text-xs font-semibold ${badgeClassPayment(
                    order.payment_status
                  )}`}
                >
                  {order.payment_status}
                </span>
              </div> */}

              <div className="border-t"></div>

              <div className="flex justify-between gap-4">
                <span className="font-bold text-slate-800">
                  Status Pesanan
                </span>

                <span
                  className={`px-2 py-1 rounded-lg text-xs font-semibold ${badgeClassOrder(
                    order.order_status
                  )}`}
                >
                  {order.order_status}
                </span>
              </div>

            </div>

          </div>

        </div>

        {/* DAFTAR ITEM */}
        <div className="mt-3">

          <div className="overflow-x-auto border border-slate-200 rounded-2xl">

            <table className="w-full text-sm">

              <thead className="bg-sky-100">

                <tr className="text-slate-800">

                  <th className="text-left font-bold py-4 px-4 text-slate-800">
                    Produk
                  </th>

                  <th className="text-right font-bold py-4 px-4 text-slate-800">
                    Harga
                  </th>

                  <th className="text-right font-bold py-4 px-4 text-slate-800">
                    Qty
                  </th>

                  <th className="text-right font-bold py-4 px-4 text-slate-800">
                    Subtotal
                  </th>

                </tr>

              </thead>

              <tbody>

                {(order.items || []).map((it: any) => (
                  <tr key={it.id} className="border-t">

                    <td className="px-4 py-4">

                      <div className="flex items-center gap-3">

                        <img
                          src={
                            it.medicines?.foto_url ||
                            "/images/no-image.png"
                          }
                          alt={it.medicines?.nama_obat}
                          className="w-16 h-16 object-cover rounded-xl border"
                        />

                        <div>

                          <div className="font-semibold text-slate-800">
                            {it.medicines?.nama_obat || it.name}
                          </div>

                        </div>

                      </div>

                    </td>

                    <td className="text-right px-4">
                      Rp {formatRupiah(it.price)}
                    </td>

                    <td className="text-right px-4">
                      {it.quantity}
                    </td>

                    <td className="text-right px-4 font-semibold">
                      Rp {formatRupiah(it.subtotal)}
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>
        </div>

        {/* TOTAL */}
        <div className="mt-3 flex justify-end">

          <div className="w-full max-w-md bg-sky-100 border border-slate-200 rounded-2xl p-5">

            <div className="flex justify-between text-sm">
              <span className="font-bold text-sm text-slate-800">Subtotal</span>
              <span>Rp {formatRupiah(order.subtotal)}</span>
            </div>

            <div className="flex justify-between text-sm mt-2">
              <span className="font-bold text-sm text-slate-800">Ongkos Kirim</span>
              <span>Rp {formatRupiah(order.shipping_cost)}</span>
            </div>

            <div className="border-t mt-4 pt-4 flex justify-between items-center">

              <span className="font-bold text-lg">
                Total
              </span>

              <span className="text-2xl font-bold text-sky-700">
                Rp {formatRupiah(order.total_amount)}
              </span>

            </div>

            {/* Ucapan Terima Kasih */}
            <div className="mt-5 pt-4 border-t text-center">

              <p className="text-sm text-slate-500 leading-relaxed">
                Terima kasih telah berbelanja di
                <span className="font-semibold text-slate-700">
                  {" "}Apotek Sehati Jaya Farma
                </span>.
                Simpan faktur ini sebagai bukti transaksi dan
                referensi pesanan Anda.
              </p>

            </div>

          </div>

        </div>
      </div>

      <div className="mt-4 flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-xl border bg-white"
        >
          Tutup
        </button>

        <button
          onClick={handleDownloadInvoice}
          className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white flex items-center gap-2 transition"
        >
          <Printer size={16} />
          Cetak / Simpan PDF
        </button>
      </div>
    </Modal>
  )
}
