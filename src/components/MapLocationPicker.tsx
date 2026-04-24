'use client'

import { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { Search, MapPin } from 'lucide-react'

// Reparam lipsa de imagini marker din varianta de baza a React Leaflet
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
})
L.Marker.prototype.options.icon = DefaultIcon

function LocationMarker({ position, setPosition, setAddressName }: any) {
  const map = useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng])
      fetchAddress(e.latlng.lat, e.latlng.lng)
    }
  })

  // Funcție de geocodare inversă: Lat/Lng -> Adresa text (Prin OpenStreetMap)
  const fetchAddress = async (lat: number, lng: number) => {
    try {
      const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`, {
        headers: { 'Accept-Language': 'ro' }
      })
      const data = await resp.json()
      if (data && data.address) {
        const city = data.address.city || data.address.town || data.address.village || data.address.county || ''
        setAddressName(city)
      }
    } catch(e) {
      console.error(e)
    }
  }

  // Cand primeste pozitie noua din prop (de ex search), face fly to
  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom())
    }
  }, [position, map])

  return position === null ? null : (
    <Marker position={position}></Marker>
  )
}

export default function MapLocationPicker({
  initialLat,
  initialLng,
  onChange
}: {
  initialLat?: number
  initialLng?: number
  onChange: (lat: number, lng: number, address: string) => void
}) {
  // Implicit: Centrul Bucurestiului
  const [position, setPosition] = useState<[number, number]>([initialLat || 44.4268, initialLng || 26.1025])
  const [addressName, setAddressName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  // Odata ce locatia e updatata, notificam parintele (formularul)
  useEffect(() => {
    if (position[0] && position[1]) {
      onChange(position[0], position[1], addressName)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position, addressName])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery) return
    setIsSearching(true)
    try {
      const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`, {
        headers: { 'Accept-Language': 'ro' }
      })
      const data = await resp.json()
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat)
        const lon = parseFloat(data[0].lon)
        setPosition([lat, lon])
        
        let foundCity = data[0].name
        if (data[0].address) {
          foundCity = data[0].address.city || data[0].address.town || data[0].address.village || data[0].name
        }
        setAddressName(foundCity)
      } else {
        alert('Nu am găsit locația! Încearcă altfel.')
      }
    } catch(err) {
      console.error(err)
    }
    setIsSearching(false)
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-2">
        <div className="relative flex-1">
          <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Caută orașul / cartierul / strada..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-10 rounded-xl bg-muted/20 border-2 border-border font-medium focus:outline-none focus:border-primary/50"
          />
        </div>
        <button 
          type="submit" 
          disabled={isSearching}
          className="h-12 px-6 bg-primary text-white font-bold rounded-xl flex items-center justify-center hover:scale-[1.02] active:scale-95 transition-transform whitespace-nowrap shadow-md shadow-primary/20"
        >
          {isSearching ? 'Caut...' : 'Setează'}
        </button>
      </form>
      
      <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest px-1">
        Sau alege direct punând un "📍 Pin" pe hartă pentru o acuratețe mare.
      </p>

      <div className="w-full h-[300px] md:h-[400px] rounded-2xl overflow-hidden border-2 border-border/60 shadow-inner relative z-0">
        <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} setPosition={setPosition} setAddressName={setAddressName} />
        </MapContainer>
      </div>
      
      {addressName && (
        <div className="text-sm font-semibold text-primary/80 bg-primary/10 px-4 py-2 rounded-lg inline-flex max-w-fit">
           Locație aleasă: {addressName}
        </div>
      )}
    </div>
  )
}
