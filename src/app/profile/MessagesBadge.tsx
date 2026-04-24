'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

export function MessagesBadge({ userId, initialCount }: { userId: string, initialCount: number }) {
  const [unreadCount, setUnreadCount] = useState(initialCount)
  const supabase = createClient()

  useEffect(() => {
    // 1. Ascultăm mesaje noi sau modificări de status
    const channel = supabase
      .channel('unread-messages-count')
      .on('postgres_changes', {
        event: '*', 
        schema: 'public',
        table: 'messages'
      }, () => {
        // Când se schimbă ceva în mesaje, refacem numărătoarea
        updateCount()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  const updateCount = async () => {
    const { count } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', userId)
      .eq('read_state', false)
    
    setUnreadCount(count || 0)
  }

  if (unreadCount === 0) return null

  return (
    <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-black text-white animate-in zoom-in duration-300 shadow-lg shadow-destructive/20">
      {unreadCount > 9 ? '9+' : unreadCount}
    </span>
  )
}
