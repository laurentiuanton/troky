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

    const channel = supabase.channel(`user-notifications-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${userId}`
        },
        (payload) => {
          console.log('Realtime: New message received', payload)
          
          toast('Mesaj Nou! 💬', {
            description: payload.new.content.substring(0, 50) + (payload.new.content.length > 50 ? '...' : ''),
            action: {
              label: 'Răspunde',
              onClick: () => router.push('/profile?tab=mesaje')
            },
            closeButton: true,
            duration: 10000, // Sta 10 secunde sa fie vizibil
            icon: <MessageCircle className="w-5 h-5 text-primary" />
          })
        }
      )
      .subscribe((status) => {
        console.log('Realtime Status:', status)
      })

    return () => {
      console.log('Realtime: Cleaning up subscription')
      supabase.removeChannel(channel)
    }
  }, [userId, router])

  return null
}
