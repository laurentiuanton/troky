'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { updateListing } from '../actions'
import { ImagePlus, Loader2, Star, Trash2, ArrowLeft, Info, CheckCircle2, ChevronRight, Save } from 'lucide-react'
import Link from 'next/link'
import dynamic from 'next/dynamic'

const MapLocationPicker = dynamic(() => import('@/components/MapLocationPicker'), { ssr: false, loading: () => <div className="h-[300px] w-full bg-muted/10 animate-pulse rounded-3xl border-2 border-dashed border-border/50 flex items-center justify-center text-muted-foreground font-medium italic">Se încarcă harta...</div> })
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function EditListingPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params)
  const router = useRouter()
  const supabase = createClient()
  
  const [listing, setListing] = useState<any>(null)
  const [tipAnunt, setTipAnunt] = useState('schimb')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [images, setImages] = useState<{file?: File, preview: string, id?: string}[]>([])
  const [primaryIndex, setPrimaryIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [locationText, setLocationText] = useState('')

  useEffect(() => {
    fetchListing()
  }, [])

  const fetchListing = async () => {
    const { data, error } = await supabase
        .from('listings')
        .select('*, listing_images(*)')
        .eq('id', params.id)
        .single()
    
    if (data) {
        setListing(data)
        setTipAnunt(data.tip_anunt)
        setLat(data.lat)
        setLng(data.lng)
        setLocationText(data.location)
        const existingImgs = data.listing_images.map((img: any, i:number) => {
            if (img.is_primary) setPrimaryIndex(i)
            return { preview: img.image_url, id: img.id }
        })
        setImages(existingImgs)
    }
  }

  const handleFiles = (files: FileList | null) => {
    if (!files) return
    const newImages = Array.from(files).map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }))
    setImages(prev => [...prev, ...newImages])
  }

  const removeImage = async (index: number) => {
    const imgToRemove = images[index]
    if (imgToRemove.id) {
        await supabase.from('listing_images').delete().eq('id', imgToRemove.id)
    }
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    
    const formData = new FormData(e.currentTarget)
    formData.append('tip_anunt', tipAnunt)
    formData.append('location', locationText)
    formData.append('lat', lat?.toString() || '')
    formData.append('lng', lng?.toString() || '')
    
    // Handle Images
    formData.delete('images')
    images.forEach((img, i) => {
        if (img.file) {
            formData.append('images', img.file)
            if (i === primaryIndex) formData.append('primary_image_name', img.file.name)
        }
    })

    const result = await updateListing(params.id, formData)
    if (result && result.error) {
      setErrorMsg(result.error)
      setLoading(false)
    } else {
      router.push('/profile?tab=anunturi')
    }
  }

  if (!listing) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-muted-foreground font-bold italic animate-pulse">
        <Loader2 className="h-10 w-10 animate-spin text-[#10b981]" />
        Se regăsesc detaliile anunțului...
    </div>
  )

  return (
    <div className="min-h-screen bg-[#fcfcf9] pt-12 pb-24 px-4">
      <div className="container max-w-4xl relative z-10">
        
        <Link href="/profile" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-black uppercase tracking-widest text-[10px] mb-8 group bg-white/50 py-2 px-4 rounded-full border border-border/40">
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Înapoi la profil
        </Link>

        {/* HEADER SECTION */}
        <div className="text-left mb-12 space-y-4">
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-foreground leading-[1.1]">
                Editează <span className="text-[#3b82f6]">Anunțul</span>
            </h1>
            <p className="text-[#37371f]/60 text-lg font-medium italic">
                Actualizează detaliile pentru a menține oferta relevantă în comunitate.
            </p>
        </div>

        {errorMsg && (
          <Alert variant="destructive" className="mb-10 rounded-[2rem] border-2 bg-destructive/5 animate-in slide-in-from-top-4">
            <AlertTitle className="uppercase tracking-widest text-xs font-black">Atenție la editare</AlertTitle>
            <AlertDescription className="font-semibold">{errorMsg}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
          
          {/* TIP ANUNT SELECTOR (READ-ONLY LOOK BUT EDITABLE) */}
          <section className="space-y-6">
              <div className="flex items-center gap-4 px-2">
                  <Label className="text-base font-black tracking-wide uppercase">Tipul Anunțului</Label>
              </div>
              <div className="grid grid-cols-3 gap-4 bg-white/60 backdrop-blur-md rounded-[2rem] p-2 border border-border/40 shadow-xl shadow-black/5">
                {[
                  { id: 'donatie', label: 'DONEZ', active: tipAnunt === 'donatie', color: 'bg-[#10b981]' },
                  { id: 'schimb', label: 'SCHIMB', active: tipAnunt === 'schimb', color: 'bg-[#3b82f6]' },
                  { id: 'vreau', label: 'VREAU', active: tipAnunt === 'vreau', color: 'bg-[#ea9010]' }
                ].map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setTipAnunt(type.id)}
                    className={`h-16 rounded-[1.5rem] font-black text-xs md:text-sm tracking-wider transition-all ${
                      type.active ? `${type.color} text-white shadow-lg scale-[1.02]` : 'bg-transparent text-muted-foreground hover:bg-muted/30'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
          </section>

          {/* MAIN CONTENT CARD */}
          <Card className="border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] bg-white rounded-[3rem] overflow-hidden">
            <CardContent className="p-10 md:p-14 space-y-12">
                
                {/* BASIC INFO */}
                <div className="space-y-10">
                    <div className="flex items-center justify-between pb-4 border-b border-muted text-[#3b82f6]">
                        <h3 className="text-xl font-black tracking-tight flex items-center gap-3 italic">
                           <Info size={24} /> Informații Generale
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-3">
                            <Label className="font-black text-xs tracking-widest uppercase text-muted-foreground px-1">Titlul Publicat *</Label>
                            <Input 
                                name="title" 
                                defaultValue={listing.title}
                                required 
                                className="h-16 rounded-2xl bg-muted/20 border-transparent focus:bg-white focus:border-[#3b82f6] text-lg font-bold px-6 transition-all" 
                            />
                        </div>
                        <div className="space-y-3 text-left">
                            <Label className="font-black text-xs tracking-widest uppercase text-muted-foreground px-1">Categoria *</Label>
                            <Select name="category_slug" defaultValue={listing.category_slug} required>
                                <SelectTrigger className="h-16 rounded-2xl bg-muted/20 border-transparent focus:bg-white focus:border-[#3b82f6] text-lg font-bold px-6 transition-all">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
                                    <SelectItem value="auto-vehicule" className="rounded-xl h-12 font-bold focus:bg-[#3b82f6]/10">Auto & Vehicule</SelectItem>
                                    <SelectItem value="imobiliare" className="rounded-xl h-12 font-bold focus:bg-[#3b82f6]/10">Imobiliare</SelectItem>
                                    <SelectItem value="electronice" className="rounded-xl h-12 font-bold focus:bg-[#3b82f6]/10">Electronice & Gadgets</SelectItem>
                                    <SelectItem value="casa-gradina" className="rounded-xl h-12 font-bold focus:bg-[#3b82f6]/10">Casă & Grădină</SelectItem>
                                    <SelectItem value="mama-copil" className="rounded-xl h-12 font-bold focus:bg-[#3b82f6]/10">Mamă & Copil</SelectItem>
                                    <SelectItem value="donatii-generale" className="rounded-xl h-12 font-bold focus:bg-[#3b82f6]/10">Altele / Donații</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label className="font-black text-xs tracking-widest uppercase text-muted-foreground px-1">Descrierea Produsului *</Label>
                        <Textarea 
                            name="description" 
                            defaultValue={listing.description}
                            rows={6} 
                            required 
                            className="rounded-3xl bg-muted/20 border-transparent focus:bg-white focus:border-[#3b82f6] text-lg font-medium p-8 leading-relaxed transition-all min-h-[200px]" 
                        />
                    </div>
                </div>

                {/* DETAILS & MAP */}
                <div className="space-y-10">
                    <div className="flex items-center justify-between pb-4 border-b border-muted text-[#ea9010]">
                        <h3 className="text-xl font-black tracking-tight flex items-center gap-3 italic">
                           <Star size={24} /> Stare & Locație Curenta
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-3">
                            <Label className="font-black text-xs tracking-widest uppercase text-muted-foreground px-1">Starea Produsului *</Label>
                            <Select name="stare_produs" defaultValue={listing.stare_produs}>
                                <SelectTrigger className="h-16 rounded-2xl bg-muted/20 border-transparent focus:bg-white focus:border-[#3b82f6] text-lg font-bold px-6 transition-all">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
                                    <SelectItem value="nou" className="rounded-xl h-12 font-bold">Nou / Sigilat</SelectItem>
                                    <SelectItem value="impecabil" className="rounded-xl h-12 font-bold">Impecabil</SelectItem>
                                    <SelectItem value="folosit" className="rounded-xl h-12 font-bold">Folosit / Bun</SelectItem>
                                    <SelectItem value="nefunctional" className="rounded-xl h-12 font-bold">Defect / Piese</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {(tipAnunt === 'schimb' || tipAnunt === 'vreau') && (
                            <div className="space-y-3">
                                <Label className="font-black text-xs tracking-widest uppercase text-[#ea9010] px-1 italic">
                                    {tipAnunt === 'vreau' ? 'Eu ofer la schimb:' : 'Eu cer la schimb:'}
                                </Label>
                                <Input 
                                    name="ce_doresc_la_schimb" 
                                    defaultValue={listing.ce_doresc_la_schimb}
                                    className="h-16 rounded-2xl bg-[#ea9010]/5 border-[#ea9010]/20 focus:bg-white focus:border-[#ea9010] text-lg font-black px-6 transition-all text-[#ea9010]" 
                                />
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <input type="hidden" name="location" value={locationText} />
                        <Card className="rounded-[2.5rem] border-4 border-muted/50 overflow-hidden shadow-inner group relative">
                            <MapLocationPicker 
                                initialPos={listing.lat && listing.lng ? {lat: listing.lat, lng: listing.lng} : undefined}
                                onChange={(newLat, newLng, newAddress) => {
                                    setLat(newLat)
                                    setLng(newLng)
                                    setLocationText(newAddress)
                                }}
                            />
                        </Card>
                        <p className="text-center text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                            Locație detectată: <span className="text-foreground">{locationText || 'Căutare...'}</span>
                        </p>
                    </div>
                </div>

                {/* IMAGE EDITING GALLERY */}
                <div className="space-y-10">
                    <div className="flex items-center justify-between pb-4 border-b border-muted text-[#3b82f6]">
                        <h3 className="text-xl font-black tracking-tight flex items-center gap-3 italic">
                           <ImagePlus size={24} /> Galerie Imagini
                        </h3>
                    </div>

                    <div 
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); }}
                        className={`p-10 border-4 border-dashed rounded-[3rem] transition-all duration-500 flex flex-col items-center gap-10 ${
                             isDragging ? 'border-[#3b82f6] bg-[#3b82f6]/5' : 'border-muted bg-muted/10 hover:bg-muted/20'
                        }`}
                    >
                        {images.length > 0 && (
                            <div className="flex flex-wrap gap-6 justify-center">
                                {images.map((img: any, i: number) => (
                                    <div key={i} className={`relative group/img w-32 h-32 rounded-3xl overflow-hidden border-4 transition-all duration-500 ${
                                        i === primaryIndex ? 'border-[#3b82f6] scale-105 shadow-2xl' : 'border-white shadow-lg'
                                    }`}>
                                        <img src={img.preview} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <Button type="button" variant="destructive" size="icon" onClick={() => removeImage(i)} className="h-8 w-8 rounded-xl shadow-xl">
                                                <Trash2 size={14} />
                                            </Button>
                                            <button type="button" onClick={() => setPrimaryIndex(i)} className={`h-8 w-8 rounded-xl flex items-center justify-center shadow-xl transition-all ${
                                                i === primaryIndex ? 'bg-[#3b82f6] text-white' : 'bg-white text-foreground'
                                            }`}>
                                                <Star size={14} fill={i === primaryIndex ? 'currentColor' : 'none'} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        <Label htmlFor="image-edit-upload" className="cursor-pointer group">
                            <div className="flex flex-col items-center gap-3 flex-shrink-0">
                                <div className="w-20 h-20 rounded-full bg-white border-2 border-border shadow-xl flex items-center justify-center text-muted-foreground group-hover:text-[#3b82f6] group-hover:border-[#3b82f6] transition-all">
                                    <ImagePlus size={32} />
                                </div>
                                <span className="font-black text-[10px] uppercase tracking-widest text-[#37371f]">Adaugă poze noi</span>
                            </div>
                            <input id="image-edit-upload" type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
                        </Label>
                    </div>
                </div>

                <div className="pt-6 border-t border-muted">
                    <Button 
                        type="submit" 
                        disabled={loading} 
                        className="w-full h-20 rounded-[2rem] text-xl font-black tracking-wide shadow-2xl shadow-[#3b82f6]/20 bg-[#3b82f6] hover:bg-[#2563eb] text-white flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {loading ? (
                            <><Loader2 className="h-6 w-6 animate-spin" /> Se actualizează...</>
                        ) : (
                            <><Save size={24} /> Salvează Modificările</>
                        )}
                    </Button>
                </div>

            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  )
}
