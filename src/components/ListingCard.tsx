'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ListingCard({ listing }: { listing: any }) {
  const router = useRouter()
  
  const primaryImage = listing.listing_images?.find((img: any) => img.is_primary)?.image_url
    || listing.listing_images?.[0]?.image_url
    || '/placeholder.jpg';

  const handleUserClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    router.push(`/user/${listing.user_id}`)
  }

  return (
    <div className="group relative flex flex-col h-full animate-in fade-in zoom-in-95 duration-500">
      <Link 
        href={`/listing/${listing.id}`} 
        className="glass-panel hover-lift h-full flex flex-col border border-border/60 bg-white shadow-sm hover:shadow-2xl transition-all duration-300 rounded-[1.5rem] overflow-hidden" 
        style={{ textDecoration: 'none', color: 'inherit' }}
      >
        <div style={{ height: '140px', width: '100%', background: `url(${primaryImage}) center/cover no-repeat`, borderBottom: '1px solid var(--border)', position: 'relative' }}>
          <span className="absolute top-3 left-3 z-10 text-[9px] font-black tracking-widest uppercase px-3 py-1 rounded-full bg-white/90 backdrop-blur-md shadow-sm border border-black/5">
            {listing.tip_anunt === 'donatie' ? '🎁 Gratuit' : listing.tip_anunt === 'vreau' ? '🔍 Cerere' : '🔄 Schimb'}
          </span>

          {/* Seller Mini-Link Overlay - Top Right */}
          <div 
            onClick={handleUserClick}
            className="absolute top-3 right-3 z-20 hover:scale-110 active:scale-90 transition-all flex items-center justify-center p-0.5 bg-white/80 backdrop-blur-md rounded-full shadow-lg border border-white/40 cursor-pointer"
            title={`Vezi profilul lui ${listing.profiles?.full_name}`}
          >
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-[10px] font-black text-white overflow-hidden border-2 border-white">
              {listing.profiles?.avatar_url ? (
                <img src={listing.profiles.avatar_url} className="w-full h-full object-cover" />
              ) : (
                listing.profiles?.full_name?.charAt(0) || 'U'
              )}
            </div>
          </div>
        </div>
        
        <div className="p-4 flex flex-col flex-1 gap-2">
          <h3 className="text-sm font-black text-foreground leading-tight line-clamp-2 min-h-[40px]">
            {listing.title}
          </h3>
          <div className="flex items-center gap-1.5 text-[10px] font-black text-[#10b981] uppercase tracking-wider mt-auto">
            <span className="opacity-50">📍</span> {listing.location}
          </div>
        </div>
      </Link>
    </div>
  )
}
