'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, Loader2, MapPin, Target, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getAutocompleteSuggestions } from '@/app/search/actions'

export default function HomeSearchBar() {
  const [query, setQuery] = useState('')
  const [locationQuery, setLocationQuery] = useState('')
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [radius, setRadius] = useState('15')
  
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isQueryLoading, setIsQueryLoading] = useState(false)
  
  const [locSuggestions, setLocSuggestions] = useState<any[]>([])
  const [showLocSuggestions, setShowLocSuggestions] = useState(false)
  const [isLocLoading, setIsLocLoading] = useState(false)

  const router = useRouter()
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (query.trim().length === 0) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    const timer = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setIsQueryLoading(true)
        const results = await getAutocompleteSuggestions(query)
        setSuggestions(results)
        setShowSuggestions(true)
        setIsQueryLoading(false)
      }
    }, 200) // Mai rapid: 200ms
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (locationQuery.trim().length >= 3 && !lat) {
        setIsLocLoading(true)
        try {
          const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationQuery)}&limit=5&addressdetails=1`, {
            headers: { 'Accept-Language': 'ro' }
          })
          const data = await resp.json()
          setLocSuggestions(data || [])
          setShowLocSuggestions(true)
        } catch (e) {
          console.error(e)
        }
        setIsLocLoading(false)
      } else {
        setLocSuggestions([])
        setShowLocSuggestions(false)
      }
    }, 600)
    return () => clearTimeout(timer)
  }, [locationQuery, lat])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
        setShowLocSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectLocation = (loc: any) => {
    setLat(parseFloat(loc.lat))
    setLng(parseFloat(loc.lon))
    const name = loc.address.city || loc.address.town || loc.address.village || loc.name
    setLocationQuery(name)
    setShowLocSuggestions(false)
  }

  const handleSearch = (e?: React.FormEvent, selectedQuery?: string) => {
    if (e) e.preventDefault()
    const finalQuery = selectedQuery || query
    const params = new URLSearchParams()
    
    if (finalQuery) params.set('q', finalQuery)
    if (lat) params.set('lat', lat.toString())
    if (lng) params.set('lng', lng.toString())
    if (radius) params.set('radius', radius)
    
    setShowSuggestions(false)
    setShowLocSuggestions(false)
    router.push(`/search?${params.toString()}`)
  }

  return (
    <div ref={searchRef} className="w-full max-w-5xl mx-auto mb-16 px-4">
      <form 
        onSubmit={(e) => handleSearch(e)} 
        className="flex flex-col lg:flex-row items-stretch bg-white/60 backdrop-blur-3xl rounded-[2rem] lg:rounded-full border-2 border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.1)] focus-within:shadow-[0_25px_60px_rgba(0,0,0,0.15)] focus-within:bg-white transition-all relative z-50 ring-1 ring-black/5"
      >
        
        {/* 1. QUERY BOX */}
        <div className="flex-[1.4] relative group">
          <div className="flex items-center px-8 py-5 lg:py-4 h-full">
            <Search size={22} className="text-primary mr-5 opacity-40 group-focus-within:opacity-100 group-focus-within:text-primary transition-all shrink-0" />
            <div className="flex flex-col flex-1">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-0.5">Produse</label>
              <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => query.length >= 2 && setShowSuggestions(true)}
                  placeholder="Ce cauți astăzi?"
                  autoComplete="off"
                  className="w-full bg-transparent border-none outline-none text-base font-bold placeholder:text-muted-foreground/30 focus:ring-0 p-0 text-foreground"
              />
            </div>
            {isQueryLoading && <Loader2 className="animate-spin text-primary ml-2 shrink-0" size={16} />}
          </div>

          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-[105%] left-4 right-4 lg:left-0 lg:right-0 bg-white/95 backdrop-blur-xl border border-border/60 shadow-2xl rounded-3xl mt-2 overflow-hidden py-3 animate-in fade-in slide-in-from-top-2 z-[60]">
               <div className="px-6 pb-2 mb-2 border-b border-border/30 text-[9px] font-black uppercase tracking-widest text-primary/60">Anunțuri potrivite</div>
               {suggestions.map((s, i) => (
                <button key={i} type="button" onClick={() => handleSearch(undefined, s)} className="w-full text-left px-7 py-3 hover:bg-primary/5 text-sm font-bold transition-all flex items-center gap-3">
                  <ArrowRight size={14} className="text-primary/30" /> {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* SEPARATOR DESKTOP */}
        <div className="hidden lg:block w-[1.5px] h-10 bg-border/40 self-center" />

        {/* 2. LOCATION BOX */}
        <div className="flex-1 relative group border-t border-border/20 lg:border-none">
          <div className="flex items-center px-8 py-5 lg:py-4 h-full">
            <MapPin size={22} className="text-[#10b981] mr-5 opacity-40 group-focus-within:opacity-100 group-focus-within:text-[#10b981] transition-all shrink-0" />
            <div className="flex flex-col flex-1">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-0.5">Locație</label>
              <input
                  type="text"
                  value={locationQuery}
                  onChange={(e) => { setLocationQuery(e.target.value); if (lat) setLat(null); }}
                  onFocus={() => locSuggestions.length > 0 && setShowLocSuggestions(true)}
                  placeholder="Oriunde"
                  autoComplete="off"
                  className="w-full bg-transparent border-none outline-none text-base font-bold placeholder:text-muted-foreground/30 focus:ring-0 p-0 text-foreground"
              />
            </div>
            {isLocLoading && <Loader2 className="animate-spin text-[#10b981] ml-2 shrink-0" size={16} />}
          </div>

          {showLocSuggestions && locSuggestions.length > 0 && (
            <div className="absolute top-[105%] left-4 right-4 lg:left-0 lg:right-0 bg-white/95 backdrop-blur-xl border border-border/60 shadow-2xl rounded-3xl mt-2 overflow-hidden py-3 animate-in fade-in slide-in-from-top-2 z-[60] min-w-[280px]">
              <div className="px-6 pb-2 mb-2 border-b border-border/30 text-[9px] font-black uppercase tracking-widest text-[#10b981]/60">Găsite în România</div>
              {locSuggestions.map((l, i) => (
                <button key={i} type="button" onClick={() => selectLocation(l)} className="w-full text-left px-7 py-3 hover:bg-[#10b981]/5 transition-all">
                  <div className="text-sm font-bold text-foreground">{l.name}</div>
                  <div className="text-[10px] text-muted-foreground truncate font-medium">{l.display_name}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* SEPARATOR DESKTOP */}
        <div className="hidden lg:block w-[1.5px] h-10 bg-border/40 self-center" />

        {/* 3. RADIUS BOX */}
        <div className="flex items-center px-8 py-4 lg:py-0 bg-muted/10 lg:bg-transparent border-t border-border/20 lg:border-none">
          <Target size={20} className="text-[#ea9010] mr-4 opacity-40 shrink-0" />
          <div className="flex flex-col flex-1">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ea9010]/60 mb-0.5">Rază</label>
            <select
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                className="bg-transparent border-none outline-none text-xs font-black cursor-pointer w-full text-foreground focus:ring-0 p-0 appearance-none"
            >
                <option value="5">Rază 5 km</option>
                <option value="15">Rază 15 km</option>
                <option value="30">Rază 30 km</option>
                <option value="100">Rază 100 km</option>
                <option value="500">Toată Țara</option>
            </select>
          </div>
        </div>

        {/* SEARCH BUTTON */}
        <div className="p-2 lg:p-3 bg-muted/20 lg:bg-transparent">
          <button 
            type="submit" 
            className="w-full lg:w-auto px-10 py-5 lg:py-4 bg-[#37371f] text-white font-black rounded-3xl lg:rounded-full hover:bg-black transition-all shadow-[0_10px_20px_rgba(0,0,0,0.1)] active:scale-[0.98] flex items-center justify-center gap-3 group"
          >
            <span className="lg:hidden uppercase tracking-widest text-sm">Caută pe Troky</span>
            <Search size={20} className="group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </form>
    </div>
  )
}

