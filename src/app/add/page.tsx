'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { createListing } from './actions'
import { ImagePlus, Loader2, Star, Trash2, Info, CheckCircle2, ChevronRight } from 'lucide-react'

const MapLocationPicker = dynamic(() => import('@/components/MapLocationPicker'), { ssr: false, loading: () => <div className="h-[350px] w-full bg-muted/10 animate-pulse rounded-3xl border-2 border-dashed border-border/50 flex items-center justify-center text-muted-foreground font-medium italic">Se încarcă harta...</div> })
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
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function AddListingPage() {
  const router = useRouter()
  const [tipAnunt, setTipAnunt] = useState('schimb')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [images, setImages] = useState<{file: File, preview: string}[]>([])
  const [primaryIndex, setPrimaryIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [locationText, setLocationText] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const typeQuery = params.get('type')
    if (typeQuery === 'donez') setTipAnunt('donatie')
    if (typeQuery === 'schimb') setTipAnunt('schimb')
    if (typeQuery === 'vreau') setTipAnunt('vreau')
  }, [])

  const handleFiles = (files: FileList | null) => {
    if (!files) return
    const newImages = Array.from(files).map((file: File) => ({
      file,
      preview: URL.createObjectURL(file)
    }))
    setImages((prev: any[]) => [...prev, ...newImages])
  }

  const removeImage = (index: number) => {
    setImages((prev: any[]) => {
        const filtered = prev.filter((_: any, i: number) => i !== index)
        if (primaryIndex === index) setPrimaryIndex(0)
        else if (primaryIndex > index) setPrimaryIndex(primaryIndex - 1)
        return filtered
    })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    
    const formData = new FormData(e.currentTarget)
    formData.append('tip_anunt', tipAnunt)
    
    formData.delete('images')
    images.forEach((img: any, i: number) => {
        formData.append('images', img.file)
        if (i === primaryIndex) {
            formData.append('primary_image_name', img.file.name)
        }
    })

    try {
      const result = await createListing(formData)
      if (result && result.error) {
        setErrorMsg(result.error)
        setLoading(false)
      } else if (result && result.success) {
        router.push('/profile?tab=anunturi')
      }
    } catch (err) {
      setErrorMsg('Eroare server. Încearcă din nou.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#fcfcf9] pt-12 pb-24 px-4">
      <div className="container max-w-4xl relative z-10">
        
        {/* HEADER SECTION */}
        <div className="text-center mb-16 space-y-4">
            <div className="flex justify-center items-center gap-2 text-[#10b981] font-bold text-xs uppercase tracking-[0.2em] mb-2">
                <CheckCircle2 size={16} /> Proces Simplu și Rapid
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-foreground leading-[1.1]">
                Postează un <span className="text-[#10b981]">Anunț Nou</span>
            </h1>
            <p className="text-[#37371f]/60 text-lg font-medium max-w-2xl mx-auto italic">
                „Fiecare obiect merită o a doua șansă. Găsește-i o nouă casă astăzi.”
            </p>
        </div>

        {errorMsg && (
          <Alert variant="destructive" className="mb-10 rounded-[2rem] border-2 bg-destructive/5 animate-in slide-in-from-top-4">
            <AlertTitle className="uppercase tracking-widest text-xs font-black">Ceva nu a mers bine</AlertTitle>
            <AlertDescription className="font-semibold">{errorMsg}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-12">
          
          {/* STEP 1: CATEGORY SELECTION */}
          <section className="space-y-6">
              <div className="flex items-center gap-4 px-2">
                  <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center font-black text-sm border border-border">1</div>
                  <Label className="text-base font-black tracking-wide uppercase">Ce dorești să faci?</Label>
              </div>
              <Tabs defaultValue="schimb" value={tipAnunt} onValueChange={setTipAnunt} className="w-full">
                  <TabsList className="grid grid-cols-3 h-20 p-2 bg-white/60 backdrop-blur-md rounded-[2rem] border border-border/40 shadow-xl shadow-black/5">
                      <TabsTrigger value="donatie" className="rounded-[1.5rem] font-black text-xs md:text-sm tracking-wider transition-all data-[state=active]:bg-[#10b981] data-[state=active]:text-white">DONEZ</TabsTrigger>
                      <TabsTrigger value="schimb" className="rounded-[1.5rem] font-black text-xs md:text-sm tracking-wider transition-all data-[state=active]:bg-[#3b82f6] data-[state=active]:text-white">SCHIMB</TabsTrigger>
                      <TabsTrigger value="vreau" className="rounded-[1.5rem] font-black text-xs md:text-sm tracking-wider transition-all data-[state=active]:bg-[#ea9010] data-[state=active]:text-white">VREAU</TabsTrigger>
                  </TabsList>
              </Tabs>
          </section>

          {/* STEP 2: MAIN CONTENT CARD */}
          <Card className="border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] bg-white rounded-[3rem] overflow-hidden transition-all">
            <CardContent className="p-10 md:p-14 space-y-12">
                
                {/* BASIC INFO SECTION */}
                <div className="space-y-10">
                    <div className="flex items-center justify-between pb-4 border-b border-muted">
                        <h3 className="text-xl font-black tracking-tight flex items-center gap-3">
                           <Info className="text-[#10b981]" size={24} /> Informații de bază
                        </h3>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground bg-muted/30 px-3 py-1 rounded-full">Obligatoriu (*)</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-3 group">
                            <Label className="font-black text-xs tracking-widest uppercase text-muted-foreground px-1 group-focus-within:text-foreground transition-colors">
                                {tipAnunt === 'vreau' ? 'Ce cauți? *' : 'Titlul Anunțului *'}
                            </Label>
                            <Input 
                                name="title" 
                                required 
                                className="h-16 rounded-2xl bg-muted/20 border-transparent focus:bg-white focus:border-[#10b981] focus:ring-4 focus:ring-[#10b981]/10 text-lg font-bold px-6 transition-all" 
                                placeholder={tipAnunt === 'vreau' ? "Ex: Caut manuale vechi..." : "Ex: Bicicletă vintage..."} 
                            />
                        </div>
                        <div className="space-y-3">
                            <Label className="font-black text-xs tracking-widest uppercase text-muted-foreground px-1">Categorie *</Label>
                            <Select name="category_slug" required>
                                <SelectTrigger className="h-16 rounded-2xl bg-muted/20 border-transparent focus:bg-white focus:border-[#10b981] text-lg font-bold px-6 transition-all">
                                    <SelectValue placeholder="Alege Categoria" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
                                    {[
                                        {v: "auto-vehicule", l: "Auto & Vehicule"},
                                        {v: "imobiliare", l: "Imobiliare"},
                                        {v: "electronice", l: "Electronice & Gadgets"},
                                        {v: "casa-gradina", l: "Casă & Grădină"},
                                        {v: "mama-copil", l: "Mamă & Copil"},
                                        {v: "donatii-generale", l: "Altele / Donații"}
                                    ].map(cat => (
                                        <SelectItem key={cat.v} value={cat.v} className="rounded-xl h-12 font-bold focus:bg-[#10b981]/10 focus:text-[#10b981]">{cat.l}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label className="font-black text-xs tracking-widest uppercase text-muted-foreground px-1">Descriere Detaliată *</Label>
                        <Textarea 
                            name="description" 
                            rows={6} 
                            required 
                            className="rounded-3xl bg-muted/20 border-transparent focus:bg-white focus:border-[#10b981] text-lg font-medium p-8 leading-relaxed transition-all min-h-[200px]" 
                            placeholder="Povestește-ne mai multe despre produs..." 
                        />
                    </div>
                </div>

                {/* CONDITION & LOCATION */}
                <div className="space-y-10">
                    <div className="flex items-center justify-between pb-4 border-b border-muted">
                        <h3 className="text-xl font-black tracking-tight flex items-center gap-3">
                           <Star className="text-[#ea9010]" size={24} /> Stare & Locație
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-3">
                            <Label className="font-black text-xs tracking-widest uppercase text-muted-foreground px-1">Stare Produs *</Label>
                            <Select name="stare_produs" defaultValue="folosit">
                                <SelectTrigger className="h-16 rounded-2xl bg-muted/20 border-transparent focus:bg-white focus:border-[#ea9010] text-lg font-bold px-6 transition-all">
                                    <SelectValue placeholder="Stare produs" />
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
                            <div className="space-y-3 animate-in fade-in zoom-in-95">
                                <Label className="font-black text-xs tracking-widest uppercase text-[#ea9010] px-1">
                                    {tipAnunt === 'vreau' ? 'Ce poți oferi tu? *' : 'Ce vrei la schimb? *'}
                                </Label>
                                <Input 
                                    name="ce_doresc_la_schimb" 
                                    className="h-16 rounded-2xl bg-[#ea9010]/5 border-[#ea9010]/20 focus:bg-white focus:border-[#ea9010] text-lg font-black px-6 transition-all text-[#ea9010]" 
                                    placeholder="Ex: Cărți, Dulciuri, Servicii..." 
                                />
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <Label className="font-black text-xs tracking-widest uppercase text-muted-foreground px-1">Unde se află obiectul? *</Label>
                        <input type="hidden" name="location" value={locationText} />
                        <input type="hidden" name="lat" value={lat || ''} />
                        <input type="hidden" name="lng" value={lng || ''} />
                        
                        <div className="rounded-[2.5rem] border-4 border-muted/50 overflow-hidden shadow-inner group">
                            <MapLocationPicker 
                                onChange={(newLat, newLng, newAddress) => {
                                    setLat(newLat)
                                    setLng(newLng)
                                    setLocationText(newAddress)
                                }}
                            />
                        </div>
                        <p className="text-center text-xs font-semibold text-muted-foreground italic px-4">
                            Schimburile locale sunt cu 80% mai sigure și mai rapide! 📍
                        </p>
                    </div>
                </div>

                {/* PHOTO GALLERY */}
                <div className="space-y-10">
                    <div className="flex items-center justify-between pb-4 border-b border-muted">
                        <h3 className="text-xl font-black tracking-tight flex items-center gap-3">
                           <ImagePlus className="text-[#3b82f6]" size={24} /> Galerie Foto
                        </h3>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground bg-muted/30 px-3 py-1 rounded-full">{images.length} poze selectate</span>
                    </div>

                    <div 
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); }}
                        className={`p-12 border-4 border-dashed rounded-[3rem] transition-all duration-500 flex flex-col items-center gap-10 ${
                             isDragging ? 'border-[#3b82f6] bg-[#3b82f6]/5' : 'border-muted bg-muted/10 hover:bg-muted/20'
                        }`}
                    >
                        {images.length > 0 && (
                            <div className="flex flex-wrap gap-6 justify-center animate-in fade-in slide-in-from-bottom-4">
                                {images.map((img: any, i: number) => (
                                    <div key={i} className={`relative group/img w-36 h-36 rounded-3xl overflow-hidden border-4 transition-all duration-500 ${
                                        i === primaryIndex ? 'border-[#3b82f6] scale-110 shadow-2xl' : 'border-white shadow-lg opacity-90'
                                    }`}>
                                        <img src={img.preview} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <Button 
                                                type="button" 
                                                variant="destructive" 
                                                size="icon" 
                                                onClick={() => removeImage(i)}
                                                className="h-10 w-10 rounded-2xl shadow-xl"
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                            <button 
                                                type="button" 
                                                onClick={() => setPrimaryIndex(i)} 
                                                className={`h-10 w-10 rounded-2xl flex items-center justify-center shadow-xl transition-all ${
                                                    i === primaryIndex ? 'bg-[#3b82f6] text-white' : 'bg-white text-foreground hover:bg-[#3b82f6] hover:text-white'
                                                }`}
                                            >
                                                <Star size={16} fill={i === primaryIndex ? 'currentColor' : 'none'} />
                                            </button>
                                        </div>
                                        {i === primaryIndex && (
                                            <div className="absolute bottom-2 inset-x-2 bg-white/90 backdrop-blur rounded-xl py-1 text-[8px] font-black uppercase text-center tracking-tighter text-[#3b82f6]">Copertă</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        <div className="flex flex-col items-center gap-6">
                            <Label htmlFor="image-upload" className="cursor-pointer group">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-24 h-24 rounded-[2rem] bg-white border-2 border-border shadow-xl flex items-center justify-center text-muted-foreground group-hover:text-[#3b82f6] group-hover:border-[#3b82f6] group-hover:-translate-y-1 transition-all">
                                        <ImagePlus size={40} />
                                    </div>
                                    <span className="font-black text-sm uppercase tracking-widest text-[#37371f]">Click sau Trage Poze</span>
                                </div>
                                <input id="image-upload" type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
                            </Label>
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-muted">
                    <Button 
                        type="submit" 
                        disabled={loading || images.length === 0} 
                        className="w-full h-20 rounded-[2rem] text-xl font-black tracking-wide shadow-2xl shadow-[#10b981]/20 bg-[#10b981] hover:bg-[#0d9668] text-[#37371f] flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-6 w-6 animate-spin" /> Se publică...
                            </>
                        ) : (
                            <>
                                Publică Anunțul pe Troky <ChevronRight size={24} />
                            </>
                        )}
                    </Button>
                    <p className="text-center mt-6 text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-50">
                        Prin publicare, ești de acord cu regulile comunității Troky.
                    </p>
                </div>

            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  )
}
