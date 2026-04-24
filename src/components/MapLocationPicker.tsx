'use client'

import { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { Search, MapPin, Loader2 } from 'lucide-react'

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

  return position === null ? null : (
    <Marker position={position}></Marker>
  )
}

function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  map.flyTo(center, zoom);
  return null;
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
  const [position, setPosition] = useState<[number, number]>([initialLat || 44.4268, initialLng || 26.1025])
  const [addressName, setAddressName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  // Autocomplete state
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (position[0] && position[1]) {
      onChange(position[0], position[1], addressName)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position, addressName])

  // Debounce pentru Autocomplete OSM Geocoding
  useEffect(() => {
    const timer = setTimeout(async () => {
      // OSM Nominatim interzice apeluri prea dese (Termenii și condițiile limitează la 1 req/sec). 
      // 800ms este decent.
      if (searchQuery.length > 2 && document.activeElement === inputRef.current) {
        setIsSearching(true)
        try {
          const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&addressdetails=1`, {
            headers: { 'Accept-Language': 'ro' }
          })
          const data = await resp.json()
          setSuggestions(data || [])
          setShowSuggestions(true)
        } catch (e) {
          console.error(e)
        }
        setIsSearching(false)
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    }, 800)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Daca apasa 'Setează' sau 'Enter' pe input, ia prima sugestie automat
  const handleSearchClick = async () => {
    if (!searchQuery) return
    setIsSearching(true)
    setShowSuggestions(false)
    try {
      const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&addressdetails=1`, {
        headers: { 'Accept-Language': 'ro' }
      })
      const data = await resp.json()
      if (data && data.length > 0) {
        selectLocation(data[0])
      } else {
        alert('Nu am găsit locația! Încearcă altfel.')
      }
    } catch(err) {
      console.error(err)
    }
    setIsSearching(false)
  }

  const selectLocation = (locationItem: any) => {
     const lat = parseFloat(locationItem.lat)
     const lon = parseFloat(locationItem.lon)
     setPosition([lat, lon])
     
     let foundCity = locationItem.name
     if (locationItem.address) {
       foundCity = locationItem.address.city || locationItem.address.town || locationItem.address.village || locationItem.name
     }
     
     setAddressName(foundCity)
     setSearchQuery(foundCity)
     setShowSuggestions(false)
  }

  return (
    <div className="flex flex-col gap-3 w-full relative">
      <div className="flex flex-col md:flex-row gap-2">
        <div className="relative flex-1 group">
          <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input 
            ref={inputRef}
            type="text" 
            placeholder="Caută orașul / cartierul / strada..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSearchClick(); } }}
            onBlur={() => { setTimeout(() => setShowSuggestions(false), 200) }}
            onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true) }}
            className="w-full h-12 px-10 rounded-xl bg-muted/20 border-2 border-border font-medium focus:outline-none focus:border-primary/50 relative z-10"
          />
          {isSearching && (
             <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground animate-spin" />
          )}

          {/* Autocomplete Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
             <div className="absolute top-14 left-0 right-0 max-h-64 overflow-y-auto bg-white border border-border/80 shadow-2xl rounded-2xl z-[9999] py-2 animate-in fade-in slide-in-from-top-2">
                <div className="px-3 pb-2 mb-2 border-b border-border/40 text-[10px] font-black uppercase tracking-widest text-[#10b981]">
                    Sugestii Găsite
                </div>
                {suggestions.map((s, i) => (
                   <button 
                     key={i} 
                     type="button" 
                     className="w-full text-left px-4 py-2.5 hover:bg-muted/40 transition-colors flex flex-col gap-0.5"
                     onClick={() => selectLocation(s)}
                   >
                      <span className="font-bold text-sm text-foreground">{s.name}</span>
                      <span className="text-xs font-medium text-muted-foreground/80 truncate w-full">{s.display_name}</span>
                   </button>
                ))}
             </div>
          )}
        </div>
        <button 
          type="button" 
          onClick={handleSearchClick}
          disabled={isSearching}
          className="h-12 px-6 bg-primary text-white font-bold rounded-xl flex items-center justify-center hover:scale-[1.02] active:scale-95 transition-transform whitespace-nowrap shadow-md shadow-primary/20 z-0"
        >
          {isSearching ? '...' : 'Setează'}
        </button>
      </div>
      
      <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest px-1">
        Sau alege direct punând un "📍 Pin" pe hartă pentru o acuratețe mare.
      </p>

      <div className="w-full h-[300px] md:h-[400px] rounded-2xl overflow-hidden border-2 border-border/60 shadow-inner relative z-0">
        <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
          <ChangeView center={position} zoom={13} />
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
