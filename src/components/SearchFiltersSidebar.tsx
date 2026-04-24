'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Filter, Search, MapPin, X, ChevronDown } from 'lucide-react'
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
import { cn } from '@/lib/utils'

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
  const [showMap, setShowMap] = useState(false)

  return (
    <div className="w-full bg-white/40 backdrop-blur-3xl border border-white/50 shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-[2.5rem] p-3 lg:p-4 mb-10 transition-all">
      <form action="/search" className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 lg:gap-4">
          
          {/* 1. KEYWORD SEARCH */}
          <div className="flex-[1.5] relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-[#10b981] transition-colors" size={18} />
              <Input 
                name="q" 
                defaultValue={initialQuery} 
                placeholder="Caută produse..." 
                className="h-14 pl-12 rounded-full bg-white/80 border-none shadow-sm focus-visible:ring-2 focus-visible:ring-[#10b981]/20 font-semibold" 
              />
          </div>

          {/* 2. CATEGORY SELECT */}
          <div className="flex-1">
              <Select name="category" defaultValue={initialCategory}>
                  <SelectTrigger className="h-14 rounded-full bg-white/80 border-none shadow-sm font-bold text-muted-foreground">
                      <SelectValue placeholder="Toate Categoriile" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none shadow-2xl">
                      <SelectItem value="all">Orice Categorie</SelectItem>
                      {allCategories?.map((c: any) => (
                          <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>
                      ))}
                  </SelectContent>
              </Select>
          </div>

          {/* 3. TYPE SELECT */}
          <div className="flex-1">
              <Select name="type" defaultValue={initialType}>
                  <SelectTrigger className="h-14 rounded-full bg-white/80 border-none shadow-sm font-bold text-[#3b82f6]">
                      <SelectValue placeholder="Tip Anunț" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none shadow-2xl">
                      <SelectItem value="all">Toate tipurile</SelectItem>
                      <SelectItem value="donatie">Donez (Gratis)</SelectItem>
                      <SelectItem value="schimb">Schimb (Barter)</SelectItem>
                      <SelectItem value="vreau">Vreau (Căutare)</SelectItem>
                  </SelectContent>
              </Select>
          </div>

          {/* 4. LOCATION POPUP TRIGGER */}
          <div className="flex-1 relative">
             <Button 
                type="button"
                onClick={() => setShowMap(!showMap)}
                variant="outline"
                className={cn(
                  "w-full h-14 rounded-full border-none shadow-sm font-bold flex items-center justify-between px-6 transition-all",
                  lat ? "bg-[#10b981]/10 text-[#10b981]" : "bg-white/80 text-muted-foreground"
                )}
             >
                <div className="flex items-center gap-2">
                   <MapPin size={18} />
                   <span className="truncate">{lat ? 'Locație Setată' : 'Oriunde în România'}</span>
                </div>
                <ChevronDown size={16} className={cn("transition-transform", showMap && "rotate-180")} />
             </Button>

             {showMap && (
                <div className="absolute top-[110%] left-0 right-0 lg:w-[400px] bg-white rounded-[2.5rem] shadow-[0_30px_70px_rgba(0,0,0,0.15)] p-6 z-[100] animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center justify-between mb-4">
                       <h4 className="text-xs font-black uppercase tracking-widest text-[#10b981]">Alege Locația</h4>
                       <Button variant="ghost" size="icon" onClick={() => setShowMap(false)} className="rounded-full h-8 w-8"><X size={16} /></Button>
                    </div>
                    
                    <input type="hidden" name="lat" value={lat || ''} />
                    <input type="hidden" name="lng" value={lng || ''} />
                    
                    <div className="rounded-3xl overflow-hidden border border-border h-[250px] mb-4">
                        <MapLocationPicker 
                          initialLat={lat || undefined}
                          initialLng={lng || undefined}
                          onChange={(newLat, newLng) => {
                            setLat(newLat)
                            setLng(newLng)
                          }}
                        />
                    </div>

                    {lat && lng && (
                        <div className="space-y-4 animate-in fade-in zoom-in-95">
                            <div className="space-y-2">
                               <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Raza în jurul locației</label>
                               <Select name="radius" defaultValue={initialRadius ? String(initialRadius) : "15"}>
                                  <SelectTrigger className="h-11 rounded-xl bg-muted/5 border-border font-bold">
                                      <SelectValue placeholder="Distanța" />
                                  </SelectTrigger>
                                  <SelectContent className="rounded-xl">
                                      <SelectItem value="15">+15 km</SelectItem>
                                      <SelectItem value="30">+30 km</SelectItem>
                                      <SelectItem value="50">+50 km</SelectItem>
                                      <SelectItem value="100">+100 km</SelectItem>
                                      <SelectItem value="500">+500 km (Național)</SelectItem>
                                  </SelectContent>
                              </Select>
                            </div>
                            <Button type="button" onClick={() => setShowMap(false)} className="w-full bg-[#10b981] hover:bg-black text-white font-black rounded-xl h-12">
                               Salvează Locația
                            </Button>
                        </div>
                    )}
                </div>
             )}
          </div>

          {/* 5. SUBMIT BUTTON */}
          <div className="flex flex-col lg:flex-row gap-2">
              <Button type="submit" className="h-14 px-8 bg-[#37371f] hover:bg-black text-white font-black rounded-full shadow-lg shadow-[#37371f]/20 transition-all hover:-translate-y-0.5 active:scale-95">
                  Caută Acum
              </Button>
              {(initialQuery || initialCategory !== 'all' || initialType !== 'all' || lat) && (
                  <Button asChild variant="ghost" className="h-14 px-6 rounded-full font-bold text-muted-foreground hover:bg-muted/30">
                      <Link href="/search">Resetează</Link>
                  </Button>
              )}
          </div>
      </form>
    </div>
  )
}
