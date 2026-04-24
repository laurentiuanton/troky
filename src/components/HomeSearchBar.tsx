'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getAutocompleteSuggestions } from '@/app/search/actions'

export default function HomeSearchBar({ categories }: { categories: any[] }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setIsLoading(true)
        const results = await getAutocompleteSuggestions(query)
        setSuggestions(results)
        setShowSuggestions(true)
        setIsLoading(false)
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (e?: React.FormEvent, selectedQuery?: string) => {
    if (e) e.preventDefault()
    const finalQuery = selectedQuery || query
    const params = new URLSearchParams()
    if (finalQuery) params.set('q', finalQuery)
    if (category) params.set('category', category)
    
    setShowSuggestions(false)
    router.push(`/search?${params.toString()}`)
  }

  return (
    <div ref={searchRef} className="max-w-[850px] mx-auto mb-16 relative z-50">
      <form 
        onSubmit={(e) => handleSearch(e)} 
        className="flex flex-col md:flex-row items-stretch md:items-center bg-white/40 backdrop-blur-xl p-2 rounded-[2rem] md:rounded-full border-2 border-border shadow-xl focus-within:border-primary/30 focus-within:bg-white transition-all gap-1"
      >
        
        <div className="flex flex-col sm:flex-row flex-1 divide-y md:divide-y-0 md:divide-x divide-border/40">
            {/* Category Select */}
            <div className="flex items-center px-6 py-2 md:py-0 w-full md:w-[200px]">
              <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="bg-transparent border-none outline-none text-sm font-bold cursor-pointer w-full text-foreground focus:ring-0"
              >
                  <option value="">Toate Categoriile</option>
                  {categories?.map((c: any) => (
                  <option key={c.id} value={c.slug}>
                      {c.name}
                  </option>
                  ))}
              </select>
            </div>

            {/* Input Side with Autocomplete */}
            <div className="flex-1 flex items-center px-6 py-3 md:py-0 relative">
              <Search size={18} className="text-secondary mr-3 opacity-60" />
              <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => query.length >= 2 && setShowSuggestions(true)}
                  placeholder="Ce cauți astăzi pe Troky?"
                  autoComplete="off"
                  className="flex-1 bg-transparent border-none outline-none text-sm font-semibold placeholder:text-muted-foreground/60 focus:ring-0"
              />
              {isLoading && <Loader2 className="animate-spin text-muted-foreground ml-2" size={16} />}
            </div>
        </div>

        {/* Submit Button */}
        <button type="submit" className="w-full md:w-auto px-10 py-4 md:py-3.5 bg-primary text-white font-black rounded-[1.5rem] md:rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20">
          Caută
        </button>
      </form>

      {/* Autocomplete Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white border border-border shadow-2xl rounded-3xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 py-3">
          <div className="px-5 pb-2 mb-2 border-b border-border/40 text-[10px] font-black uppercase tracking-widest text-[#10b981]">
            Sugestii potrivite
          </div>
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSearch(undefined, suggestion)}
              className="w-full text-left px-6 py-3 hover:bg-muted/40 transition-colors text-sm font-bold flex items-center gap-3"
            >
              <Search size={14} className="text-muted-foreground opacity-40" />
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
