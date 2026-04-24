'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Filter } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Link from 'next/link'

const MapLocationPicker = dynamic(() => import('@/components/MapLocationPicker'), { ssr: false })

export default function SearchFiltersSidebar({ 
  initialQuery, 
  initialCategory,
  initialType,
  allCategories,
  initialLat,
  initialLng,
  initialRadius
}: { 
  initialQuery: string
  initialCategory: string
  initialType: string
  allCategories: any[]
  initialLat?: number
  initialLng?: number
  initialRadius?: number
}) {
  const [lat, setLat] = useState<number | null>(initialLat || null)
  const [lng, setLng] = useState<number | null>(initialLng || null)

  return (
    <Card className="border-border shadow-2xl shadow-black/5 rounded-3xl overflow-hidden sticky top-24">
      <CardHeader className="bg-muted/10 border-b border-border/40 p-6">
          <CardTitle className="text-sm font-black tracking-widest uppercase flex items-center gap-2">
              <Filter size={16} className="text-[#ea9010]" /> Filtrează Căutarea
          </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
          <form action="/search" className="space-y-6">
              
              <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Cuvânt cheie</label>
                  <Input name="q" defaultValue={initialQuery} placeholder="Ce dorești să cauți?" className="h-11 rounded-xl bg-muted/10 border-border font-medium" />
              </div>

              <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Categorie</label>
                  <Select name="category" defaultValue={initialCategory}>
                      <SelectTrigger className="h-11 rounded-xl bg-muted/10 border-border font-bold">
                          <SelectValue placeholder="Oriunde pe platformă" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                          <SelectItem value="all">Orice Categorie</SelectItem>
                          {allCategories?.map((c: any) => (
                              <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>
                          ))}
                      </SelectContent>
                  </Select>
              </div>

              <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Tip Anunț</label>
                  <Select name="type" defaultValue={initialType}>
                      <SelectTrigger className="h-11 rounded-xl bg-muted/10 border-border font-bold text-primary">
                          <SelectValue placeholder="Orice tip" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                          <SelectItem value="all">Toate tipurile</SelectItem>
                          <SelectItem value="donatie">Doar Donații (Gratuit)</SelectItem>
                          <SelectItem value="schimb">Doar Schimburi (Barter)</SelectItem>
                          <SelectItem value="vreau">Doar Cereri (Vreau)</SelectItem>
                      </SelectContent>
                  </Select>
              </div>

              {/* LOCATION & RADIUS FILTER */}
              <div className="space-y-3 pt-2 border-t border-border/40">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#10b981] ml-1">Locație (Centru Căutare)</label>
                    <input type="hidden" name="lat" value={lat || ''} />
                    <input type="hidden" name="lng" value={lng || ''} />
                    <div className="relative">
                      {/* We make the map smaller using CSS or just rely on MapLocationPicker's internal structure 
                          Actually MapLocationPicker renders a large map. We'll add a boolean later to hide the map if we just want text. 
                          For now, a big map is cool in the sidebar. */}
                      <MapLocationPicker 
                         initialLat={lat || undefined}
                         initialLng={lng || undefined}
                         onChange={(newLat, newLng) => {
                           setLat(newLat)
                           setLng(newLng)
                         }}
                      />
                    </div>
                  </div>

                  {lat && lng && (
                    <div className="space-y-2 animate-in fade-in zoom-in-95 duration-200">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[#10b981] ml-1">Rază de căutare</label>
                        <Select name="radius" defaultValue={initialRadius ? String(initialRadius) : "15"}>
                            <SelectTrigger className="h-11 rounded-xl bg-muted/10 border-border font-bold text-[#10b981]">
                                <SelectValue placeholder="Alege distanța" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="5">+5 km</SelectItem>
                                <SelectItem value="10">+10 km</SelectItem>
                                <SelectItem value="15">+15 km</SelectItem>
                                <SelectItem value="30">+30 km</SelectItem>
                                <SelectItem value="50">+50 km</SelectItem>
                                <SelectItem value="100">+100 km</SelectItem>
                                <SelectItem value="500">+500 km (Național)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                  )}
              </div>

              <div className="flex flex-col gap-2 pt-4">
                  <Button type="submit" className="w-full bg-[#37371f] hover:bg-[#202012] text-white font-black h-12 rounded-xl text-md">
                      Aplică filtrele
                  </Button>
                  {(initialQuery || initialCategory !== 'all' || initialType !== 'all' || lat) && (
                      <Button asChild variant="ghost" className="w-full font-bold h-11 rounded-xl text-muted-foreground hover:bg-muted/50">
                          <Link href="/search">Resetează Căutarea</Link>
                      </Button>
                  )}
              </div>
          </form>
      </CardContent>
    </Card>
  )
}
