'use client'

import { useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'
import { MessageCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function RealtimeNotifications({ userId }: { userId: string | undefined }) {
  const router = useRouter()

  useEffect(() => {
    if (!userId) {
       console.log('Realtime: No userId provided')
       return
    }

    const supabase = createClient()
    
    console.log('Realtime: Subscribing for user', userId)

    // CANAL 1: DATABASE CHANGES (BACKUP & PERSISTENT)
    const dbChannel = supabase.channel(`user-db-messages-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload: any) => {
          if (payload.new.receiver_id === userId && !payload.new.read_state) {
            showNotification(payload.new.content, 'Mesaj Nou! 💬')
          }
        }
      )
      .subscribe()

    // CANAL 2: BROADCAST (INSTANT PING)
    const broadcastChannel = supabase.channel('global-notifications')
      .on(
        'broadcast',
        { event: 'new-message' },
        (payload: any) => {
          if (payload.payload.receiver_id === userId) {
             showNotification(payload.payload.content, `Mesaj de la ${payload.payload.sender_name} 💬`)
          }
        }
      )
      .subscribe()

    const showNotification = (content: string, title: string) => {
      // Evităm duplicarea dacă avem deja un toast deschis (opțional)
      toast(title, {
        description: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
        action: {
          label: 'Răspunde',
          onClick: () => router.push('/profile?tab=mesaje')
        },
        closeButton: true,
        duration: 8000,
        icon: <MessageCircle className="w-5 h-5 text-primary" />
      })
    }

    return () => {
      supabase.removeChannel(dbChannel)
      supabase.removeChannel(broadcastChannel)
    }
  }, [userId, router])

  return null
}
