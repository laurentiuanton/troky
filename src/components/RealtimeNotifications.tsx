'use client'

import { useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'
import { MessageCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

export function RealtimeNotifications({ userId }: { userId: string | undefined }) {
  const router = useRouter()

  useEffect(() => {
    if (!userId) return

    const supabase = createClient()
    console.log('🔔 Realtime: Sistem activat pentru user:', userId)
    
    const showNotification = (content: string, senderName: string, listingId?: string, otherUserId?: string) => {
      console.log('🔔 Realtime: Se afișează notificarea de la', senderName)
      
      toast.custom((t: any) => (
        <div 
          onClick={() => {
            const url = listingId && otherUserId 
              ? `/profile?tab=mesaje&listingId=${listingId}&userId=${otherUserId}`
              : `/profile?tab=mesaje`
            router.push(url)
            toast.dismiss(t.id)
          }}
          className={cn(
            "cursor-pointer w-[92vw] max-w-md bg-white border border-border shadow-[0_15px_40px_rgba(0,0,0,0.2)] rounded-[2rem] p-5 flex items-center gap-4 transition-all duration-300 transform active:scale-95",
            "translate-y-0 opacity-100 animate-in slide-in-from-bottom-5"
          )}
        >
          {/* iOS Style Avatar */}
          <div className="shrink-0 w-12 h-12 rounded-full bg-[#10b981] flex items-center justify-center border border-white/20 overflow-hidden shadow-md">
             <div className="text-white font-black text-lg">{senderName.charAt(0).toUpperCase()}</div>
          </div>

          {/* iOS Style Content */}
          <div className="flex-1 min-w-0 pr-2">
            <div className="flex items-center justify-between">
               <span className="text-[10px] font-black uppercase tracking-widest text-[#10b981] mb-0.5">Troky • Mesaj</span>
               <span className="text-[9px] font-bold text-muted-foreground/60 uppercase">Acum</span>
            </div>
            <h4 className="text-sm font-black text-foreground leading-tight truncate">{senderName}</h4>
            <p className="text-sm font-medium text-muted-foreground truncate leading-tight mt-0.5">
              {content}
            </p>
          </div>

          {/* Indication label */}
          <div className="w-1.5 h-10 bg-[#10b981]/20 rounded-full shrink-0" />
        </div>
      ), {
        duration: 10000,
        id: `msg-${Date.now()}` // ID unic pentru a nu se suprapune
      })
    }

    // CANAL: BROADCAST (PING INSTANT)
    const broadcastChannel = supabase.channel('global-notifications')
      .on('broadcast', { event: 'new-message' }, (payload: any) => {
          console.log('🔔 Broadcast primit:', payload)
          if (payload.payload.receiver_id === userId) {
             showNotification(
               payload.payload.content, 
               payload.payload.sender_name || 'Utilizator Troky',
               payload.payload.listing_id,
               payload.payload.sender_id
             )
          }
      })
      .subscribe((status: any) => console.log('🔔 Broadcast Status:', status))

    return () => {
      console.log('🔔 Realtime: Curățăm subscripția')
      supabase.removeChannel(broadcastChannel)
    }
  }, [userId, router])

  return null
}
