'use client'

import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export default function ProductGallery({ images }: { images: any[] }) {
  const [activeImage, setActiveImage] = useState(images.find(img => img.is_primary)?.image_url || images[0]?.image_url || '')

  if (!images || images.length === 0) {
    return (
      <Card className="w-full h-[400px] flex items-center justify-center bg-muted/20 border-dashed">
        <p className="text-muted-foreground font-medium italic">Fără imagini disponibile.</p>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      
      {/* Imaginea Principală - Premium Display */}
      <Card className="bg-white/50 backdrop-blur-sm rounded-3xl overflow-hidden border-border shadow-2xl shadow-black/5">
        <div 
          className="w-full h-[550px] transition-all duration-700 ease-in-out hover:scale-[1.02] cursor-zoom-in"
          style={{ 
            backgroundImage: `url(${activeImage})`,
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundColor: '#fff'
          }} 
        />
      </Card>

      {/* Rândul de Miniaturi (Thumbnails) */}
      {images.length > 1 && (
        <div className="flex gap-4 flex-wrap">
          {images.map((img, i) => (
            <button 
              key={i} 
              onClick={() => setActiveImage(img.image_url)}
              className={cn(
                "relative w-20 h-20 rounded-2xl overflow-hidden transition-all duration-300",
                activeImage === img.image_url 
                  ? "ring-4 ring-[#10b981] scale-110 shadow-lg z-10" 
                  : "opacity-60 hover:opacity-100 hover:scale-105"
              )}
            >
              <img 
                src={img.image_url} 
                alt={`Miniatura ${i}`} 
                className="w-full h-full object-cover" 
              />
            </button>
          ))}
        </div>
      )}

    </div>
  )
}
