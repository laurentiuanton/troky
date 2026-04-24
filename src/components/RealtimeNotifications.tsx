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
          table: 'messages'
          // Am scos filtrul de aici :)
        },
        (payload: any) => {
          console.log('Realtime: Payload primit:', payload)
          
          // Filtram manual aici in cod
          if (payload.new.receiver_id === userId) {
            console.log('Realtime: Mesajul este pentru noi! Afisam toast.')
            
            toast('Mesaj Nou! 💬', {
              description: payload.new.content.substring(0, 50) + (payload.new.content.length > 50 ? '...' : ''),
              action: {
                label: 'Răspunde',
                onClick: () => router.push('/profile?tab=mesaje')
              },
              closeButton: true,
              duration: 10000,
              icon: <MessageCircle className="w-5 h-5 text-primary" />
            })
          }
        }
      )
      .subscribe((status: any) => {
        console.log('Realtime Status:', status)
      })

    return () => {
      console.log('Realtime: Cleaning up subscription')
      supabase.removeChannel(channel)
    }
  }, [userId, router])

  return null
}
