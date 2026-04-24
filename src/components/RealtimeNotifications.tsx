'use client'

import { useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'
import { MessageCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function RealtimeNotifications({ userId }: { userId: string | undefined }) {
  const router = useRouter()

  useEffect(() => {
    if (!userId) return

    const supabase = createClient()
    
    const showNotification = (content: string, title: string, listingId?: string, otherUserId?: string) => {
      toast(title, {
        description: (
           <div className="py-2">
             <p className="text-base font-medium leading-tight text-foreground/90">{content.substring(0, 80) + (content.length > 80 ? '...' : '')}</p>
             <p className="text-[10px] mt-2 font-black uppercase tracking-widest text-primary">Apasă pentru a răspunde rapid</p>
           </div>
        ),
        action: {
          label: 'Răspunde',
          onClick: () => {
            const url = listingId && otherUserId 
              ? `/profile?tab=mesaje&listingId=${listingId}&userId=${otherUserId}`
              : `/profile?tab=mesaje`
            router.push(url)
          }
        },
        className: "p-6 min-w-[350px] shadow-2xl border-2 border-primary/20 bg-white/95 backdrop-blur-xl",
        closeButton: true,
        duration: 12000,
        icon: <MessageCircle className="w-8 h-8 text-primary mr-2" />
      })
    }

    // CANAL 1: BAZA DE DATE (SIGURANTA)
    const dbChannel = supabase.channel(`user-db-messages-${userId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages'
      }, (payload: any) => {
          if (payload.new.receiver_id === userId && !payload.new.read_state) {
            showNotification(payload.new.content, 'Mesaj Nou! 💬', payload.new.listing_id, payload.new.sender_id)
          }
      })
      .subscribe()

    // CANAL 2: BROADCAST (VITEZA)
    const broadcastChannel = supabase.channel('global-notifications')
      .on('broadcast', { event: 'new-message' }, (payload: any) => {
          if (payload.payload.receiver_id === userId) {
             showNotification(
               payload.payload.content, 
               `De la ${payload.payload.sender_name} 💬`,
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
