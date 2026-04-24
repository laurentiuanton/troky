'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, Loader2, MapPin, Navigation } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getAutocompleteSuggestions } from '@/app/search/actions'

export default function HomeSearchBar({ categories }: { categories: any[] }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  
  // Location & Radius states
  const [locationQuery, setLocationQuery] = useState('')
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [radius, setRadius] = useState('15')
  
  // Suggestions states
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isQueryLoading, setIsQueryLoading] = useState(false)
  
  const [locSuggestions, setLocSuggestions] = useState<any[]>([])
  const [showLocSuggestions, setShowLocSuggestions] = useState(false)
  const [isLocLoading, setIsLocLoading] = useState(false)

  const router = useRouter()
  const searchRef = useRef<HTMLDivElement>(null)

  // 1. Suggestii pentru Titlu Anunt
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setIsQueryLoading(true)
        const results = await getAutocompleteSuggestions(query)
        setSuggestions(results)
        setShowSuggestions(true)
        setIsQueryLoading(false)
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  // 2. Suggestii pentru Locatie (OSM Nominatim)
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
    if (category) params.set('category', category)
    if (lat) params.set('lat', lat.toString())
    if (lng) params.set('lng', lng.toString())
    if (radius) params.set('radius', radius)
    
    setShowSuggestions(false)
    setShowLocSuggestions(false)
    router.push(`/search?${params.toString()}`)
  }

  return (
    <div ref={searchRef} className="max-w-[1000px] mx-auto mb-16 relative z-50">
      <form 
        onSubmit={(e) => handleSearch(e)} 
        className="flex flex-col lg:flex-row items-stretch lg:items-center bg-white/50 backdrop-blur-2xl p-2 rounded-[2rem] lg:rounded-full border-2 border-border shadow-2xl focus-within:border-primary/30 focus-within:bg-white transition-all gap-1"
      >
        
        <div className="flex flex-col sm:flex-row flex-1 divide-y lg:divide-y-0 lg:divide-x divide-border/40">
            {/* 1. Category Select (Smallest) */}
            <div className="flex items-center px-6 py-2 lg:py-0 w-full lg:w-[160px]">
              <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="bg-transparent border-none outline-none text-xs font-black uppercase tracking-tighter cursor-pointer w-full text-foreground focus:ring-0"
              >
                  <option value="">Categorii</option>
                  {categories?.map((c: any) => (
                  <option key={c.id} value={c.slug}>
                      {c.name}
                  </option>
                  ))}
              </select>
            </div>

            {/* 2. Listing Search (Main) */}
            <div className="flex-[1.5] flex items-center px-6 py-3 lg:py-4 relative group">
              <Search size={18} className="text-primary mr-3 opacity-60 group-focus-within:opacity-100" />
              <div className="flex flex-col flex-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">Ce cauți?</span>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.length >= 2 && setShowSuggestions(true)}
                    placeholder="Bicicletă, telefon..."
                    autoComplete="off"
                    className="w-full bg-transparent border-none outline-none text-sm font-bold placeholder:text-muted-foreground/40 focus:ring-0 p-0"
                />
              </div>
              {isQueryLoading && <Loader2 className="animate-spin text-primary ml-2" size={14} />}

              {/* Title Suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-[100%] left-0 right-0 bg-white border border-border shadow-2xl rounded-2xl mt-2 overflow-hidden py-2">
                  {suggestions.map((s, i) => (
                    <button key={i} type="button" onClick={() => handleSearch(undefined, s)} className="w-full text-left px-5 py-2.5 hover:bg-muted/50 text-sm font-bold transition-colors">
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Location Search (New) */}
            <div className="flex-1 flex items-center px-6 py-3 lg:py-4 relative group">
              <MapPin size={18} className="text-[#10b981] mr-3 opacity-60 group-focus-within:opacity-100" />
              <div className="flex flex-col flex-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">Unde?</span>
                <input
                    type="text"
                    value={locationQuery}
                    onChange={(e) => { setLocationQuery(e.target.value); if (lat) setLat(null); }}
                    onFocus={() => locSuggestions.length > 0 && setShowLocSuggestions(true)}
                    placeholder="Orașul tău..."
                    autoComplete="off"
                    className="w-full bg-transparent border-none outline-none text-sm font-bold placeholder:text-muted-foreground/40 focus:ring-0 p-0"
                />
              </div>
              {isLocLoading && <Loader2 className="animate-spin text-[#10b981] ml-2" size={14} />}

              {/* Location Suggestions */}
              {showLocSuggestions && locSuggestions.length > 0 && (
                <div className="absolute top-[100%] left-0 right-0 bg-white border border-border shadow-2xl rounded-2xl mt-2 overflow-hidden py-2 min-w-[250px]">
                  {locSuggestions.map((l, i) => (
                    <button key={i} type="button" onClick={() => selectLocation(l)} className="w-full text-left px-5 py-2.5 hover:bg-muted/50 transition-colors">
                      <div className="text-sm font-bold text-foreground">{l.name}</div>
                      <div className="text-[10px] text-muted-foreground truncate">{l.display_name}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 4. Radius Select (New) */}
            <div className="flex items-center px-6 py-2 lg:py-0 w-full lg:w-[130px]">
              <div className="flex flex-col flex-1 uppercase">
                <span className="text-[10px] font-black tracking-widest text-[#ea9010] mb-0.5">Rază</span>
                <select
                    value={radius}
                    onChange={(e) => setRadius(e.target.value)}
                    className="bg-transparent border-none outline-none text-[11px] font-black cursor-pointer w-full text-[#ea9010] focus:ring-0 p-0"
                >
                    <option value="5">+5 km</option>
                    <option value="15">+15 km</option>
                    <option value="30">+30 km</option>
                    <option value="100">+100 km</option>
                    <option value="500">Național</option>
                </select>
              </div>
            </div>
        </div>

        {/* Submit Button */}
        <button type="submit" className="w-full lg:w-auto px-12 py-5 lg:py-4 bg-[#37371f] text-white font-black rounded-[1.5rem] lg:rounded-full hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/10">
          Caută
        </button>
      </form>
    </div>
  )
}
