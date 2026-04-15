'use client'

import { useState, useEffect } from 'react'
import { createListing } from './actions'
import { ImagePlus, Loader2, Star, Trash2 } from 'lucide-react'

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
    
    // We remove the default 'image' if any and append our state images
    formData.delete('image')
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
    <div className="container animate-fade-in" style={{ maxWidth: '800px', marginTop: '2rem' }}>
      
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Adaugă un anunț nou</h1>
        <p style={{ color: 'var(--muted-foreground)' }}>Încarcă poze clare și detalii complete pentru un schimb reușit.</p>
      </div>

      {errorMsg && (
        <div style={{ padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', borderRadius: 'var(--radius)', marginBottom: '1.5rem' }}>
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '2.5rem' }}>
        
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <label style={{ flex: 1, padding: '1.25rem 1rem', border: `2px solid ${tipAnunt === 'donatie' ? 'var(--color-donez)' : 'var(--border)'}`, borderRadius: 'var(--radius)', background: tipAnunt === 'donatie' ? 'rgba(16, 185, 129, 0.12)' : 'var(--background)', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s', opacity: tipAnunt === 'donatie' ? 1 : 0.6 }}>
            <input type="radio" name="tip_anunt" value="donatie" checked={tipAnunt === 'donatie'} onChange={() => setTipAnunt('donatie')} style={{ display: 'none' }} />
            <h3 style={{ margin: 0, color: 'var(--foreground)', textTransform: 'uppercase', fontSize: '1rem', fontWeight: 800 }}>Donez</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--foreground)', fontWeight: 500, opacity: 0.8 }}>Ofer gratuit</span>
          </label>
          <label style={{ flex: 1, padding: '1.25rem 1rem', border: `2px solid ${tipAnunt === 'schimb' ? 'var(--color-schimb)' : 'var(--border)'}`, borderRadius: 'var(--radius)', background: tipAnunt === 'schimb' ? 'rgba(59, 130, 246, 0.12)' : 'var(--background)', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s', opacity: tipAnunt === 'schimb' ? 1 : 0.6 }}>
            <input type="radio" name="tip_anunt" value="schimb" checked={tipAnunt === 'schimb'} onChange={() => setTipAnunt('schimb')} style={{ display: 'none' }} />
            <h3 style={{ margin: 0, color: 'var(--foreground)', textTransform: 'uppercase', fontSize: '1rem', fontWeight: 800 }}>Schimb</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--foreground)', fontWeight: 500, opacity: 0.8 }}>Propun Barter</span>
          </label>
          <label style={{ flex: 1, padding: '1.25rem 1rem', border: `2px solid ${tipAnunt === 'vreau' ? 'var(--color-vreau)' : 'var(--border)'}`, borderRadius: 'var(--radius)', background: tipAnunt === 'vreau' ? 'rgba(250, 204, 21, 0.15)' : 'var(--background)', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s', opacity: tipAnunt === 'vreau' ? 1 : 0.6 }}>
            <input type="radio" name="tip_anunt" value="vreau" checked={tipAnunt === 'vreau'} onChange={() => setTipAnunt('vreau')} style={{ display: 'none' }} />
            <h3 style={{ margin: 0, color: 'var(--foreground)', textTransform: 'uppercase', fontSize: '1rem', fontWeight: 800 }}>Vreau</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--foreground)', fontWeight: 500, opacity: 0.8 }}>Caut produs</span>
          </label>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700 }}>{tipAnunt === 'vreau' ? 'Ce cauți? *' : 'Titlu Anunț *'}</label>
            <input type="text" name="title" className="form-input" required style={{ paddingLeft: '1rem' }} placeholder="Ex: Bicicletă Pegas, Stare Bună" />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700 }}>Descriere Detaliată *</label>
            <textarea name="description" className="form-input" rows={4} required style={{ paddingLeft: '1rem', resize: 'vertical' }} placeholder="Povestește-ne mai multe despre produs..."></textarea>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700 }}>Stare Produs *</label>
              <select name="stare_produs" className="form-input" style={{ paddingLeft: '1rem' }} defaultValue="folosit">
                <option value="nou">Nou</option>
                <option value="impecabil">Impecabil</option>
                <option value="folosit">Folosit</option>
                <option value="nefunctional">Pentru piese</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700 }}>Locație *</label>
              <input type="text" name="location" className="form-input" required style={{ paddingLeft: '1rem' }} placeholder="Oraș, Județ" />
            </div>
          </div>

          {(tipAnunt === 'schimb' || tipAnunt === 'vreau') && (
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, color: 'var(--accent)' }}>
                {tipAnunt === 'vreau' ? 'Ce poți oferi tu la schimb?' : 'Ce dorești la schimb?'}
              </label>
              <input type="text" name="ce_doresc_la_schimb" className="form-input" style={{ paddingLeft: '1rem', borderColor: 'var(--accent)' }} placeholder="Ex: Carti, Gadget-uri, etc." />
            </div>
          )}

          {/* MULTI IMAGE UPLOAD AREA */}
          <div 
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); }}
            className="glass"
            style={{ padding: '2rem', border: `2px dashed ${isDragging ? 'var(--accent)' : 'var(--border)'}`, textAlign: 'center', transition: 'all 0.3s' }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', marginBottom: images.length > 0 ? '1.5rem' : '0' }}>
               {images.map((img, i) => (
                 <div key={i} style={{ position: 'relative', width: '120px', height: '120px', borderRadius: 'var(--radius)', overflow: 'hidden', border: i === primaryIndex ? '3px solid var(--accent)' : '1px solid var(--border)' }}>
                    <img src={img.preview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button type="button" onClick={() => removeImage(i)} style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(239, 68, 68, 0.8)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer' }}>✕</button>
                    <button type="button" onClick={() => setPrimaryIndex(i)} style={{ position: 'absolute', bottom: '5px', left: '5px', background: i === primaryIndex ? 'var(--accent)' : 'rgba(255,255,255,0.8)', color: i === primaryIndex ? 'white' : 'var(--foreground)', border: 'none', padding: '2px', borderRadius: '4px', cursor: 'pointer' }}>
                       <Star size={14} fill={i === primaryIndex ? 'white' : 'none'} />
                    </button>
                 </div>
               ))}
               
               <label style={{ width: '120px', height: '120px', border: '2px dashed var(--border)', borderRadius: 'var(--radius)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'rgba(255,255,255,0.5)' }}>
                  <ImagePlus size={24} style={{ color: 'var(--muted-foreground)' }} />
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, marginTop: '0.5rem' }}>Adaugă Foto</span>
                  <input type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFiles(e.target.files)} />
               </label>
            </div>
            
            {images.length === 0 && (
              <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem' }}>Trage mai multe poze aici pentru a crea o galerie</p>
            )}
            {images.length > 0 && (
              <p style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 600 }}>Cea mai frumoasă poză (cu steluță) va fi poza principală!</p>
            )}
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '1.2rem', fontSize: '1.1rem', marginTop: '1rem', gap: '0.5rem' }}>
            {loading ? <Loader2 className="animate-spin" /> : 'Publică noul anunț'}
          </button>
        </div>
      </form>
    </div>
  )
}
