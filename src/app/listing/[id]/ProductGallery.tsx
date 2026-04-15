'use client'

import { useState } from 'react'

export default function ProductGallery({ images }: { images: any[] }) {
  const [activeImage, setActiveImage] = useState(images.find(img => img.is_primary)?.image_url || images[0]?.image_url || '')

  if (!images || images.length === 0) {
    return (
      <div className="glass-panel" style={{ width: '100%', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
        <p style={{ color: 'var(--muted-foreground)' }}>Fără imagini disponibile.</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      
      {/* Main Large Image */}
      <div className="glass-panel" style={{ borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border)', position: 'relative' }}>
        <div 
          style={{ 
            width: '100%', 
            height: '500px', 
            backgroundImage: `url(${activeImage})`,
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundColor: 'rgba(255,255,255,0.5)',
            transition: 'background-image 0.3s ease-in-out'
          }} 
        />
      </div>

      {/* Thumbnails Row */}
      {images.length > 1 && (
        <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {images.map((img, i) => (
            <div 
              key={i} 
              onClick={() => setActiveImage(img.image_url)}
              style={{ 
                width: '80px', 
                height: '80px', 
                borderRadius: 'var(--radius)', 
                overflow: 'hidden', 
                cursor: 'pointer', 
                border: activeImage === img.image_url ? '3px solid var(--accent)' : '2px solid transparent',
                transition: 'all 0.2s',
                opacity: activeImage === img.image_url ? 1 : 0.6
              }}
            >
              <img src={img.image_url} alt={`Thumbnail ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ))}
        </div>
      )}

    </div>
  )
}
