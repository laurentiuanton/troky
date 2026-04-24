'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Filter, Search, MapPin, X, ChevronDown, Sparkles } from 'lucide-react'
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
import { Separator } from "@/components/ui/separator"

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
    <div className="w-full glass-card rounded-[2.5rem] p-3 lg:p-4 border-white/50 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.06)] transition-all">
      <form action="/search" className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
          
          {/* 1. KEYWORD SEARCH */}
          <div className="flex-[1.8] relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-secondary transition-colors" size={20} />
              <Input 
                name="q" 
                defaultValue={initialQuery} 
                placeholder="Ce cauți astăzi pentru troc?" 
                className="premium-input pl-14 h-16 rounded-[1.5rem] bg-white border-transparent shadow-inner" 
              />
          </div>

          {/* 2. CATEGORY SELECT */}
          <div className="flex-1">
              <Select name="category" defaultValue={initialCategory}>
                  <SelectTrigger className="h-16 rounded-[1.5rem] bg-white/80 border-transparent shadow-sm font-black text-xs uppercase tracking-widest text-[#37371f]/70 hover:bg-white transition-all">
                      <SelectValue placeholder="Toate Categoriile" />
                  </SelectTrigger>
                  <SelectContent className="rounded-[1.5rem] border-none shadow-2xl p-2">
                      <SelectItem value="all" className="h-12 rounded-xl font-bold">Orice Categorie</SelectItem>
                      {allCategories?.map((c: any) => (
                          <SelectItem key={c.id} value={c.slug} className="h-12 rounded-xl font-bold">{c.name}</SelectItem>
                      ))}
                  </SelectContent>
              </Select>
          </div>

          {/* 3. TYPE SELECT */}
          <div className="flex-1">
              <Select name="type" defaultValue={initialType}>
                  <SelectTrigger className="h-16 rounded-[1.5rem] bg-white/80 border-transparent shadow-sm font-black text-xs uppercase tracking-widest text-secondary hover:bg-white transition-all">
                      <SelectValue placeholder="Tip Anunț" />
                  </SelectTrigger>
                  <SelectContent className="rounded-[1.5rem] border-none shadow-2xl p-2">
                      <SelectItem value="all" className="h-12 rounded-xl font-bold">Toate tipurile</SelectItem>
                      <SelectItem value="donatie" className="h-12 rounded-xl font-bold">Donez (Gratis)</SelectItem>
                      <SelectItem value="schimb" className="h-12 rounded-xl font-bold">Schimb (Barter)</SelectItem>
                      <SelectItem value="vreau" className="h-12 rounded-xl font-bold">Vreau (Căutare)</SelectItem>
                  </SelectContent>
              </Select>
          </div>

          <Separator orientation="vertical" className="h-8 bg-border/40 hidden lg:block" />

          {/* 4. LOCATION POPUP TRIGGER */}
          <div className="flex-1 relative">
             <Button 
                type="button"
                onClick={() => setShowMap(!showMap)}
                variant="outline"
                className={cn(
                  "w-full h-16 rounded-[1.5rem] border-transparent shadow-sm font-black text-xs uppercase tracking-widest flex items-center justify-between px-6 transition-all hover-scale",
                  lat ? "bg-secondary text-white shadow-xl shadow-secondary/20" : "bg-white/80 text-muted-foreground"
                )}
             >
                <div className="flex items-center gap-3">
                   <MapPin size={20} className={lat ? "text-white" : "text-accent"} />
                   <span className="truncate">{lat ? 'Locație Setată' : 'Rază km'}</span>
                </div>
                <ChevronDown size={18} className={cn("transition-transform duration-500", showMap && "rotate-180")} />
             </Button>

             {showMap && (
                <div className="fixed lg:absolute top-[110%] left-0 right-0 lg:w-[450px] bg-white rounded-[3rem] shadow-[0_48px_80px_-12px_rgba(0,0,0,0.15)] p-8 z-[100] animate-in fade-in slide-in-from-top-6 duration-500">
                    <div className="flex items-center justify-between mb-6">
                       <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary flex items-center gap-2">
                           <Sparkles size={14} /> Filtrare Geografică
                       </h4>
                       <Button variant="ghost" size="icon" onClick={() => setShowMap(false)} className="rounded-2xl h-10 w-10 hover:bg-muted/50"><X size={20} /></Button>
                    </div>
                    
                    <input type="hidden" name="lat" value={lat || ''} />
                    <input type="hidden" name="lng" value={lng || ''} />
                    
                    <div className="rounded-[2rem] overflow-hidden border-4 border-muted/50 h-[280px] mb-6 shadow-inner relative group">
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
                        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
                            <div className="space-y-3">
                               <label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Alege distanța de căutare</label>
                               <Select name="radius" defaultValue={initialRadius ? String(initialRadius) : "15"}>
                                  <SelectTrigger className="h-14 rounded-2xl bg-muted/20 border-transparent font-black tracking-widest text-xs">
                                      <SelectValue placeholder="Distanța" />
                                  </SelectTrigger>
                                  <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
                                      <SelectItem value="15" className="h-11 rounded-xl font-bold">+15 km (Local)</SelectItem>
                                      <SelectItem value="30" className="h-11 rounded-xl font-bold">+30 km</SelectItem>
                                      <SelectItem value="50" className="h-11 rounded-xl font-bold">+50 km</SelectItem>
                                      <SelectItem value="100" className="h-11 rounded-xl font-bold">+100 km (Regiunale)</SelectItem>
                                      <SelectItem value="500" className="h-11 rounded-xl font-bold">+500 km (Național)</SelectItem>
                                  </SelectContent>
                              </Select>
                            </div>
                            <Button type="button" onClick={() => setShowMap(false)} className="w-full bg-primary hover:bg-black text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl h-14 shadow-xl transition-all active:scale-95">
                                Aplică Zona Selectată
                            </Button>
                        </div>
                    )}
                </div>
             )}
          </div>

          {/* 5. SUBMIT BUTTON */}
          <div className="flex flex-col lg:flex-row gap-3">
              <Button type="submit" className="h-16 px-10 bg-secondary hover:bg-secondary/90 text-white font-black uppercase tracking-[0.2em] text-[11px] rounded-[1.5rem] shadow-2xl shadow-secondary/20 transition-all hover-scale">
                  Filtrează Rezultate
              </Button>
              {(initialQuery || initialCategory !== 'all' || initialType !== 'all' || lat) && (
                  <Button asChild variant="ghost" className="h-16 px-6 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all">
                      <Link href="/search">Golește</Link>
                  </Button>
              )}
          </div>
      </form>
    </div>
  )
}
