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
      toast(senderName + " 💬", {
        description: (
          <div className="mt-2 space-y-3">
             <p className="text-sm font-semibold italic text-foreground/80 leading-snug">"{content}"</p>
             <div className="flex gap-2 pt-1">
                <button
                  onClick={() => {
                    const url = listingId && otherUserId 
                      ? `/profile?tab=mesaje&listingId=${listingId}&userId=${otherUserId}`
                      : `/profile?tab=mesaje`
                    router.push(url)
                  }}
                  className="px-4 py-2 bg-primary text-white text-[10px] font-black uppercase rounded-full shadow-lg"
                >
                  Răspunde
                </button>
             </div>
          </div>
        ),
        duration: 15000,
        className: "bg-white/95 backdrop-blur-xl border-2 border-primary/10 p-5 rounded-[1.5rem] shadow-2xl",
        icon: (
           <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-black text-lg shadow-lg">
             {senderName.charAt(0).toUpperCase()}
           </div>
        )
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
