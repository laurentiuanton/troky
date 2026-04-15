'use client'

import { useState, useEffect } from 'react'
import { createListing } from './actions'
import { ImagePlus, Loader2, Star, Trash2, Info } from 'lucide-react'
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function AddListingPage() {
  const [tipAnunt, setTipAnunt] = useState('schimb')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [images, setImages] = useState<{file: File, preview: string}[]>([])
  const [primaryIndex, setPrimaryIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const typeQuery = params.get('type')
    if (typeQuery === 'donez') setTipAnunt('donatie')
    if (typeQuery === 'schimb') setTipAnunt('schimb')
    if (typeQuery === 'vreau') setTipAnunt('vreau')
  }, [])

  const handleFiles = (files: FileList | null) => {
    if (!files) return
    const newImages = Array.from(files).map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }))
    setImages(prev => [...prev, ...newImages])
  }

  const removeImage = (index: number) => {
    setImages(prev => {
        const filtered = prev.filter((_, i) => i !== index)
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
    images.forEach((img, i) => {
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
      }
    } catch (err) {
      setErrorMsg('Eroare server. Încearcă din nou.')
      setLoading(false)
    }
  }

  return (
    <div className="container max-w-4xl py-12 px-4 animate-fade-in relative z-10">
      
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-foreground">
            Adaugă un anunț nou
        </h1>
        <p className="text-muted-foreground font-medium text-lg">
            Încarcă poze clare și detalii complete pentru un schimb reușit.
        </p>
      </div>

      {errorMsg && (
        <Alert variant="destructive" className="mb-8 font-bold border-2 animate-in slide-in-from-top-4">
          <AlertTitle className="uppercase tracking-widest text-xs">Atenție</AlertTitle>
          <AlertDescription>{errorMsg}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-10">
        
        {/* TIP ANUNT SELECTOR */}
        <div className="space-y-4 text-center">
            <Label className="text-sm font-black tracking-widest uppercase">Ce fel de anunț dorești să publici?</Label>
            <Tabs defaultValue="schimb" value={tipAnunt} onValueChange={setTipAnunt} className="w-full max-w-2xl mx-auto">
                <TabsList className="grid grid-cols-3 h-16 p-1.5 bg-muted/50 rounded-2xl border border-border">
                    <TabsTrigger value="donatie" className="rounded-xl font-black transition-all data-[state=active]:bg-[#10b981] data-[state=active]:text-white">DONEZ</TabsTrigger>
                    <TabsTrigger value="schimb" className="rounded-xl font-black transition-all data-[state=active]:bg-[#3b82f6] data-[state=active]:text-white">SCHIMB</TabsTrigger>
                    <TabsTrigger value="vreau" className="rounded-xl font-black transition-all data-[state=active]:bg-[#ea9010] data-[state=active]:text-white">VREAU</TabsTrigger>
                </TabsList>
            </Tabs>
        </div>

        <Card className="border-border shadow-2xl shadow-black/5 rounded-3xl overflow-hidden">
            <CardHeader className="bg-muted/20 border-b border-border/40 p-8">
                <CardTitle className="text-xl font-black tracking-tight flex items-center gap-2">
                    <Info className="text-primary" size={20} /> Detalii Anunț
                </CardTitle>
                <CardDescription className="font-semibold italic">Completează câmpurile cu steluță (*) obligatorii</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <Label className="font-bold text-sm tracking-wide">{tipAnunt === 'vreau' ? 'Ce cauți? *' : 'Titlu Anunț *'}</Label>
                        <Input 
                            name="title" 
                            required 
                            className="h-12 rounded-xl bg-muted/10 border-border focus-visible:ring-primary font-medium" 
                            placeholder="Ex: Bicicletă Pegas, Stare Bună" 
                        />
                    </div>
                    <div className="space-y-3">
                        <Label className="font-bold text-sm tracking-wide">Categorie *</Label>
                        <Select name="category_slug" required>
                            <SelectTrigger className="h-12 rounded-xl bg-muted/10 border-border font-medium">
                                <SelectValue placeholder="Alege o categorie" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="auto-vehicule">Auto & Vehicule</SelectItem>
                                <SelectItem value="imobiliare">Imobiliare</SelectItem>
                                <SelectItem value="electronice">Electronice</SelectItem>
                                <SelectItem value="casa-gradina">Casă & Grădină</SelectItem>
                                <SelectItem value="servicii">Servicii</SelectItem>
                                <SelectItem value="locuri-de-munca">Locuri de muncă</SelectItem>
                                <SelectItem value="mama-copil">Mamă & Copil</SelectItem>
                                <SelectItem value="donatii-generale">Donații</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-3">
                    <Label className="font-bold text-sm tracking-wide">Descriere Detaliată *</Label>
                    <Textarea 
                        name="description" 
                        rows={6} 
                        required 
                        className="rounded-2xl bg-muted/10 border-border text-md font-medium leading-relaxed" 
                        placeholder="Povestește-ne mai multe despre produs, de ce vrei să îl oferi sau de ce îl cauți..." 
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <Label className="font-bold text-sm tracking-wide">Stare Produs *</Label>
                        <Select name="stare_produs" defaultValue="folosit">
                            <SelectTrigger className="h-12 rounded-xl bg-muted/10 border-border font-medium">
                                <SelectValue placeholder="Stare produs" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="nou">Nou / Sigilat</SelectItem>
                                <SelectItem value="impecabil">Impecabil / Ca nou</SelectItem>
                                <SelectItem value="folosit">Folosit / Funcțional</SelectItem>
                                <SelectItem value="nefunctional">Pentru piese / Defect</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-3">
                        <Label className="font-bold text-sm tracking-wide">Locație *</Label>
                        <Input 
                            name="location" 
                            required 
                            className="h-12 rounded-xl bg-muted/10 border-border font-medium" 
                            placeholder="Oraș, Județ" 
                        />
                    </div>
                </div>

                {(tipAnunt === 'schimb' || tipAnunt === 'vreau') && (
                    <div className="space-y-3 p-6 bg-accent/5 border border-accent/20 rounded-2xl animate-in fade-in zoom-in-95 duration-300">
                        <Label className="font-black text-xs tracking-widest text-[#ea9010] uppercase">
                            {tipAnunt === 'vreau' ? 'Ce poți oferi tu la schimb?' : 'Ce dorești la schimb?'}
                        </Label>
                        <Input 
                            name="ce_doresc_la_schimb" 
                            className="h-12 rounded-xl bg-background border-accent focus-visible:ring-accent font-bold placeholder:font-medium placeholder:italic text-accent" 
                            placeholder="Ex: Cărți, Gadget-uri, etc." 
                        />
                    </div>
                )}

                {/* GALERIE FOTO UPLOAD */}
                <div className="space-y-4">
                    <Label className="text-sm font-black tracking-widest uppercase">Încarcă Fotografii</Label>
                    <div 
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); }}
                        className={`p-10 border-2 border-dashed rounded-3xl text-center transition-all duration-300 flex flex-col items-center gap-6 ${
                             isDragging ? 'border-[#ea9010] bg-[#ea9010]/5' : 'border-border bg-muted/10 hover:bg-muted/20'
                        }`}
                    >
                        {images.length > 0 && (
                            <div className="flex flex-wrap gap-4 justify-center">
                                {images.map((img, i) => (
                                    <div key={i} className={`relative w-28 h-28 rounded-2xl overflow-hidden border-2 transition-all ${
                                        i === primaryIndex ? 'border-[#ea9010] scale-110 shadow-lg' : 'border-border opacity-80 hover:opacity-100'
                                    }`}>
                                        <img src={img.preview} className="w-full h-full object-cover" />
                                        <Button 
                                            type="button" 
                                            variant="destructive" 
                                            size="icon" 
                                            onClick={() => removeImage(i)}
                                            className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full shadow-lg"
                                        >
                                            <Trash2 size={12} />
                                        </Button>
                                        <button 
                                            type="button" 
                                            onClick={() => setPrimaryIndex(i)} 
                                            className={`absolute bottom-1.5 left-1.5 p-1 rounded-md transition-colors ${
                                                i === primaryIndex ? 'bg-[#ea9010] text-white' : 'bg-white/80 text-foreground'
                                            }`}
                                        >
                                            <Star size={12} fill={i === primaryIndex ? 'currentColor' : 'none'} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        <div className="flex flex-col items-center gap-4">
                            <Label htmlFor="image-upload" className="cursor-pointer">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-16 h-16 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground shadow-sm hover:text-primary transition-colors">
                                        <ImagePlus size={32} />
                                    </div>
                                    <span className="font-bold text-sm">Adaugă fotografii</span>
                                </div>
                                <input id="image-upload" type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
                            </Label>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider italic">
                                Sfat: Prima poză (cea cu steluță) este imaginea de copertă.
                            </p>
                        </div>
                    </div>
                </div>

                <Button 
                    type="submit" 
                    disabled={loading || images.length === 0} 
                    className="w-full h-16 rounded-2xl text-lg font-black tracking-wide shadow-xl shadow-black/5 bg-[#37371f] hover:bg-[#202012] text-white"
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-6 w-6 animate-spin" /> Se publică...
                        </>
                    ) : 'Publică Anunțul pe Troky'}
                </Button>

            </CardContent>
        </Card>
      </form>
    </div>
  )
}
