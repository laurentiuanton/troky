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
        <div className={cn(
          "w-full max-w-md bg-white/90 backdrop-blur-2xl border border-white/50 shadow-[0_20px_60px_rgba(0,0,0,0.15)] rounded-[2rem] p-5 flex items-start gap-4 animate-in slide-in-from-right-10 duration-500 ring-1 ring-black/5",
          t.visible ? "opacity-100" : "opacity-0"
        )}>
          {/* Avatar side */}
          <div className="relative shrink-0 pt-1">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-[#10b981] flex items-center justify-center text-white text-xl font-black shadow-lg shadow-primary/20">
              {senderName.charAt(0).toUpperCase()}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
              <MessageCircle size={12} className="text-primary fill-primary/10" />
            </div>
          </div>

          {/* Content side */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-1">
              <h4 className="text-sm font-black text-foreground uppercase tracking-tight">{senderName} 💬</h4>
              <button 
                onClick={() => toast.dismiss(t.id)}
                className="text-muted-foreground/40 hover:text-foreground transition-colors p-1"
              >
                <X size={14} />
              </button>
            </div>
            <p className="text-sm font-semibold text-muted-foreground leading-snug line-clamp-2 italic mb-4">
              "{content}"
            </p>
            
            <div className="flex items-center gap-2">
               <button
                  onClick={() => {
                    const url = listingId && otherUserId 
                      ? `/profile?tab=mesaje&listingId=${listingId}&userId=${otherUserId}`
                      : `/profile?tab=mesaje`
                    router.push(url)
                    toast.dismiss(t.id)
                  }}
                  className="px-6 py-2.5 bg-[#37371f] text-white text-[10px] font-black uppercase tracking-[0.1em] rounded-full hover:bg-black hover:scale-105 transition-all shadow-lg active:scale-95 flex items-center gap-2"
                >
                  Răspunde Acum <ArrowRight size={12} />
                </button>
                <button 
                  onClick={() => toast.dismiss(t.id)}
                  className="px-4 py-2.5 bg-muted/30 text-muted-foreground text-[10px] font-black uppercase tracking-[0.1em] rounded-full hover:bg-muted/50 transition-all"
                >
                  Ignoră
                </button>
            </div>
          </div>
        </div>
      ), {
        duration: 12000,
        position: 'top-right'
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
