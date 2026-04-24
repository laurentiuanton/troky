'use client'

import React from 'react'
import { MapContainer, TileLayer, Marker, Circle } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix default icon ptr marker dacă dorim să îl folosim
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
})
L.Marker.prototype.options.icon = DefaultIcon

export default function MapLocationView({ 
  lat, 
  lng, 
  radiusMarker = true,
  zoom = 13
}: { 
  lat: number
  lng: number
  radiusMarker?: boolean
  zoom?: number
}) {
  if (!lat || !lng) return (
      <div className="w-full h-full flex items-center justify-center bg-muted/20 text-muted-foreground font-bold tracking-widest text-xs uppercase">
          Locație indisponibilă
      </div>
  )
  
  return (
    <div className="w-full h-full relative z-0">
      <MapContainer center={[lat, lng]} zoom={zoom} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {radiusMarker ? (
           // Pentru protecția intimității, afișăm o arie/cerc de aprox 400m
           <Circle 
             center={[lat, lng]} 
             radius={600} 
             pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.25, weight: 2 }} 
           />
        ) : (
           <Marker position={[lat, lng]} />
        )}
      </MapContainer>
    </div>
  )
}
