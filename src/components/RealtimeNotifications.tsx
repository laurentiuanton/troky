'use client'

import { useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'
import { MessageCircle, X, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

export function RealtimeNotifications({ userId }: { userId: string | undefined }) {
  const router = useRouter()

  useEffect(() => {
    if (!userId) return

    const supabase = createClient()
    
    const showNotification = (content: string, senderName: string, listingId?: string, otherUserId?: string) => {
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
            "cursor-pointer w-[92vw] max-w-md bg-white/80 backdrop-blur-3xl border border-white/20 shadow-[0_15px_40px_rgba(0,0,0,0.12)] rounded-[2.5rem] p-4 flex items-center gap-4 transition-all duration-500 transform active:scale-95",
            t.visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          )}
        >
          {/* iOS Style Avatar */}
          <div className="shrink-0 w-12 h-12 rounded-full bg-gradient-to-tr from-primary/10 to-[#10b981]/20 flex items-center justify-center border border-primary/10 overflow-hidden shadow-inner">
             <div className="text-primary font-black text-lg">{senderName.charAt(0).toUpperCase()}</div>
          </div>

          {/* iOS Style Content */}
          <div className="flex-1 min-w-0 pr-2">
            <div className="flex items-center justify-between">
               <span className="text-[11px] font-black uppercase tracking-widest text-[#10b981] mb-0.5">WhatsApp • Troky</span>
               <span className="text-[9px] font-bold text-muted-foreground/60 uppercase">Acum</span>
            </div>
            <h4 className="text-sm font-black text-foreground leading-tight truncate">{senderName}</h4>
            <p className="text-sm font-medium text-muted-foreground truncate leading-tight mt-0.5">
              {content}
            </p>
          </div>

          {/* Indication of more */}
          <div className="w-1 h-8 bg-muted-foreground/10 rounded-full shrink-0" />
        </div>
      ), {
        duration: 12000
      })
    }

    // CANAL 1: DATABASE (SIGURANTA)
    const dbChannel = supabase.channel(`user-db-messages-${userId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, async (payload: any) => {
          if (payload.new.receiver_id === userId && !payload.new.read_state) {
            // AICI AFLĂM NUMELE DACĂ LIPSEȘTE
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', payload.new.sender_id)
              .single()
            
            showNotification(
              payload.new.content, 
              profile?.full_name || 'Utilizator Troky', 
              payload.new.listing_id, 
              payload.new.sender_id
            )
          }
      })
      .subscribe()

    // CANAL 2: BROADCAST (VITEZA)
    const broadcastChannel = supabase.channel('global-notifications')
      .on('broadcast', { event: 'new-message' }, (payload: any) => {
          if (payload.payload.receiver_id === userId) {
             showNotification(
               payload.payload.content, 
               payload.payload.sender_name || 'Utilizator Troky',
               payload.payload.listing_id,
               payload.payload.sender_id
             )
          }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(dbChannel)
      supabase.removeChannel(broadcastChannel)
    }
  }, [userId, router])

  return null
}
