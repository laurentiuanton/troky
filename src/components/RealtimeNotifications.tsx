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

    const channel = supabase.channel('realtime-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${userId}`
        },
        async (payload: any) => {
          // You could optionally ignore if the current path is the chat window with this specific user
          // But as a global notification, we can just show it.
          toast('Ai primit un mesaj nou! 💬', {
            description: 'Intră în profil > Mesaje pentru a răspunde.',
            action: {
              label: 'Vezi mesajul',
              onClick: () => router.push('/profile?tab=mesaje')
            },
            icon: <MessageCircle className="w-4 h-4 text-[#10b981]" />
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, router])

  return null
}
