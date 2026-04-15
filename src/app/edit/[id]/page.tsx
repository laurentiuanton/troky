'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { updateListing } from '../actions'
import { ImagePlus, Loader2, Star, Trash2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

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
        // If it's already in DB, we'd need a delete action. For now just hide from UI or implement delete
        await supabase.from('listing_images').delete().eq('id', imgToRemove.id)
    }
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    
    const formData = new FormData(e.currentTarget)
    
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
    }
  }

  if (!listing) return <div className="container" style={{padding: '5rem', textAlign: 'center'}}><Loader2 className="animate-spin" /> Se încarcă datele...</div>

  return (
    <div className="container animate-fade-in" style={{ maxWidth: '800px', marginTop: '2rem' }}>
      
      <Link href="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted-foreground)', marginBottom: '1rem', fontWeight: 600 }}>
        <ArrowLeft size={18} /> Înapoi la profil
      </Link>

      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Editează Anunțul</h1>
        <p style={{ color: 'var(--muted-foreground)' }}>Modifică detaliile pentru a reflecta starea curentă a produsului.</p>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '2.5rem' }}>
        
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <label style={{ flex: 1, padding: '1rem', border: `2px solid ${tipAnunt === 'donatie' ? 'var(--primary)' : 'var(--border)'}`, borderRadius: 'var(--radius)', background: 'var(--background)', cursor: 'pointer', textAlign: 'center', opacity: tipAnunt === 'donatie' ? 1 : 0.6 }}>
            <input type="radio" name="tip_anunt" value="donatie" checked={tipAnunt === 'donatie'} onChange={() => setTipAnunt('donatie')} style={{ display: 'none' }} />
            <h3 style={{ margin: 0 }}>Donez</h3>
          </label>
          <label style={{ flex: 1, padding: '1rem', border: `2px solid ${tipAnunt === 'schimb' ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 'var(--radius)', background: 'var(--background)', cursor: 'pointer', textAlign: 'center', opacity: tipAnunt === 'schimb' ? 1 : 0.6 }}>
            <input type="radio" name="tip_anunt" value="schimb" checked={tipAnunt === 'schimb'} onChange={() => setTipAnunt('schimb')} style={{ display: 'none' }} />
            <h3 style={{ margin: 0 }}>Schimb</h3>
          </label>
          <label style={{ flex: 1, padding: '1rem', border: `2px solid ${tipAnunt === 'vreau' ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 'var(--radius)', background: 'var(--background)', cursor: 'pointer', textAlign: 'center', opacity: tipAnunt === 'vreau' ? 1 : 0.6 }}>
            <input type="radio" name="tip_anunt" value="vreau" checked={tipAnunt === 'vreau'} onChange={() => setTipAnunt('vreau')} style={{ display: 'none' }} />
            <h3 style={{ margin: 0 }}>Vreau</h3>
          </label>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700 }}>Titlu *</label>
            <input type="text" name="title" defaultValue={listing.title} className="form-input" required style={{ paddingLeft: '1rem' }} />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700 }}>Descriere *</label>
            <textarea name="description" defaultValue={listing.description} className="form-input" rows={6} required style={{ paddingLeft: '1rem' }}></textarea>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700 }}>Stare *</label>
              <select name="stare_produs" defaultValue={listing.stare_produs} className="form-input" style={{ paddingLeft: '1rem' }}>
                <option value="nou">Nou</option>
                <option value="impecabil">Impecabil</option>
                <option value="folosit">Folosit</option>
                <option value="nefunctional">Piese</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700 }}>Locație *</label>
              <input type="text" name="location" defaultValue={listing.location} className="form-input" required style={{ paddingLeft: '1rem' }} />
            </div>
          </div>

          {(tipAnunt === 'schimb' || tipAnunt === 'vreau') && (
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, color: 'var(--accent)' }}>Ce dorești la schimb?</label>
              <input type="text" name="ce_doresc_la_schimb" defaultValue={listing.ce_doresc_la_schimb} className="form-input" style={{ paddingLeft: '1rem', borderColor: 'var(--accent)' }} />
            </div>
          )}

          <div 
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); }}
            className="glass"
            style={{ padding: '2rem', border: `2px dashed var(--border)`, textAlign: 'center' }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
               {images.map((img, i) => (
                 <div key={i} style={{ position: 'relative', width: '100px', height: '100px', borderRadius: 'var(--radius)', overflow: 'hidden', border: i === primaryIndex ? '3px solid var(--accent)' : '1px solid var(--border)' }}>
                    <img src={img.preview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button type="button" onClick={() => removeImage(i)} style={{ position: 'absolute', top: '2px', right: '2px', background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer' }}>✕</button>
                    <button type="button" onClick={() => setPrimaryIndex(i)} style={{ position: 'absolute', bottom: '2px', left: '2px', background: i === primaryIndex ? 'var(--accent)' : 'white', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>
                        <Star size={12} fill={i === primaryIndex ? 'white' : 'none'} />
                    </button>
                 </div>
               ))}
               <label style={{ width: '100px', height: '100px', border: '2px dashed var(--border)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <ImagePlus size={24} />
                  <input type="file" multiple style={{ display: 'none' }} onChange={(e) => handleFiles(e.target.files)} />
               </label>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '1rem', fontSize: '1.1rem' }}>
            {loading ? <Loader2 className="animate-spin" /> : 'Salvează Modificările'}
          </button>
        </div>
      </form>
    </div>
  )
}
