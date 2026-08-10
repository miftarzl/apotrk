"use client"
import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { toast } from 'react-hot-toast'

// fix leaflet default icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
})

const { MapContainer, TileLayer, Marker, useMapEvents } = require('react-leaflet')

const VILLAGES = [
  'Kebalen',
  'Bahagia',
  'Kedung Jaya',
  'Kedung Pengawas',
  'Buni Bakti',
  'Muara Bakti',
  'Pantai Hurip',
  'Hurip Jaya'
]

function DraggableMarker({ position, setPosition }: any) {

  useMapEvents({
    click(e: any) {
      setPosition([e.latlng.lat, e.latlng.lng])
    }
  })

  return (
    <Marker
      draggable={true}
      position={position}
      eventHandlers={{
        dragend(e: any) {
          const latlng = e.target.getLatLng()

          setPosition([
            latlng.lat,
            latlng.lng
          ])
        }
      }}
    />
  )
}

function ChangeView({ center }: any) {
  const map = useMapEvents({})

  useEffect(() => {
    map.setView(center, 17)
  }, [center])

  return null
}

export default function ProfileAddress({ user, onSaved }: any) {
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL || ''
  const [loading, setLoading] = useState(true)
  const [address, setAddress] = useState<any>(null)

  const [recipientName, setRecipientName] = useState('')
  const [phone, setPhone] = useState('')
  const [addressDetail, setAddressDetail] = useState('')
  const [village, setVillage] = useState(VILLAGES[0])
  const [district] = useState('Babelan')
  const [city, setCity] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [pos, setPos] = useState<[number,number]>([-6.244, 107.052])

  useEffect(()=>{
    async function load(){
      setLoading(true)
      try{
        const res = await fetch(`${backend}/api/user/address`, { credentials: 'include' })
        const j = await res.json().catch(()=>null)
        if (res.ok && j) {
          setAddress(j)
          setRecipientName(j.recipient_name || user?.username || '')
          setPhone(j.phone || user?.phone || '')
          setAddressDetail(j.address_detail || '')
          if (j.village) setVillage(j.village)
          if (j.district) {
            // keep
          }
          if (j.city) setCity(j.city)
          if (j.postal_code) setPostalCode(j.postal_code)
          if (j.latitude && j.longitude) setPos([Number(j.latitude), Number(j.longitude)])
        } else {
          // defaults from user
          setRecipientName(user?.username || '')
          setPhone(user?.phone || '')
        }
      }catch(e){ console.error(e) }
      finally{ setLoading(false) }
    }
    load()
  },[user])

  async function save() {
    const payload = {
      recipient_name: recipientName || null,
      phone: phone || null,
      address_detail: addressDetail || null,
      village,
      district,
      city,
      postal_code: postalCode || null,
      latitude: pos[0],
      longitude: pos[1]
    }
    try{
      if (address) {
        const res = await fetch(`${backend}/api/user/address`, { method: 'PUT', credentials: 'include', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) })
        if (res.ok) {
          const j = await res.json().catch(()=>null)
          setAddress(j)
          onSaved && onSaved(j)
          toast.success('Alamat diperbarui')
        } else {
          const j = await res.json().catch(()=>({})); toast.error(j?.error || 'Gagal menyimpan alamat')
        }
      } else {
        const res = await fetch(`${backend}/api/user/address`, { method: 'POST', credentials: 'include', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) })
        if (res.ok) {
          const j = await res.json().catch(()=>null)
          setAddress(j)
          onSaved && onSaved(j)
          toast.success('Alamat tersimpan')
        } else {
          const j = await res.json().catch(()=>({})); toast.error(j?.error || 'Gagal menyimpan alamat')
        }
      }
    }catch(e){ console.error(e); toast.error('Server error') }
  }

  function useMyLocation(){
    if (!navigator.geolocation) {
      toast.error('Geolocation tidak tersedia')
      return
    }
    navigator.geolocation.getCurrentPosition((p)=>{
      setPos([p.coords.latitude, p.coords.longitude])
    }, (err)=>{ toast.error('Gagal mendapatkan lokasi: ' + err.message) })
  }

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold mb-3">Alamat Pengiriman</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div>
            <label className="text-sm text-slate-700">Nama Penerima</label>
            <input className="input mt-1" value={recipientName} onChange={e=>setRecipientName(e.target.value)} placeholder={user?.username || ''} />
          </div>

          <div className="mt-2">
            <label className="text-sm text-slate-700">Nomor Telepon</label>
            <input className="input mt-1" value={phone} onChange={e=>setPhone(e.target.value)} placeholder={user?.phone || ''} />
          </div>

          <div className="mt-2">
            <label className="text-sm text-slate-700">Alamat Lengkap</label>
            <textarea className="input mt-1" value={addressDetail} onChange={e=>setAddressDetail(e.target.value)} />
          </div>

          <div className="mt-2">
            <label className="text-sm text-slate-700">Kelurahan</label>
            <select className="input mt-1" value={village} onChange={e=>setVillage(e.target.value)}>
              {VILLAGES.map(v=> <option key={v} value={v}>{v}</option>)}
            </select>
          </div>

          <div className="mt-2">
            <label className="text-sm text-slate-700">Kecamatan</label>
            <select className="input mt-1" value={district} disabled>
              <option>{district}</option>
            </select>
          </div>

          <div className="mt-2">
            <label className="text-sm text-slate-700">Kabupaten/Kota</label>
            <input className="input mt-1" value={city} onChange={e=>setCity(e.target.value)} />
          </div>

          <div className="mt-2">
            <label className="text-sm text-slate-700">Kode Pos</label>
            <input className="input mt-1" value={postalCode} onChange={e=>setPostalCode(e.target.value)} />
          </div>

        </div>

        <div>
          <div className="h-72 rounded-xl overflow-hidden border">
            <MapContainer
              center={pos}
              zoom={15}
              style={{
                height: "100%",
                width: "100%"
              }}
            >
              <ChangeView center={pos} />

              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <DraggableMarker
                position={pos}
                setPosition={setPos}
              />
            </MapContainer>
          </div>

          <div className="mt-3 text-sm text-slate-600">
            Latitude: {pos[0].toFixed(6)}
            <br />
            Longitude: {pos[1].toFixed(6)}
          </div>

          <div className="mt-3 p-3 rounded-lg bg-sky-50 text-sky-700 text-sm">
            Geser marker atau klik lokasi pada peta untuk menentukan titik pengiriman yang lebih akurat.
          </div>

          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={useMyLocation}
              className="px-4 py-2 border rounded-lg hover:bg-slate-50"
            >
              Gunakan Lokasi Saya
            </button>

            <button
              type="button"
              onClick={save}
              className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold rounded-lg transition"
            >
              Simpan Alamat
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
