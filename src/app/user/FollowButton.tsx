'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { toggleFollow } from './actions'
import { toast } from 'sonner'
import { UserPlus, UserMinus, Loader2 } from 'lucide-react'

export function FollowButton({ followingId, isInitialFollowing, currentUserId }: { followingId: string, isInitialFollowing: boolean, currentUserId?: string }) {
  const [isFollowing, setIsFollowing] = useState(isInitialFollowing)
  const [loading, setLoading] = useState(false)

  if (currentUserId === followingId) return null

  const handleToggle = async () => {
    if (!currentUserId) {
      toast.error('Trebuie să fii autentificat pentru a urmări utilizatori.')
      return
    }

    setLoading(true)
    const res = await toggleFollow(followingId)
    setLoading(false)

    if (res.error) {
      toast.error(res.error)
    } else {
      setIsFollowing(!isFollowing)
      toast.success(isFollowing ? 'Nu mai urmărești acest utilizator.' : 'Urmărești acum acest utilizator!')
    }
  }

  return (
    <Button 
      onClick={handleToggle}
      disabled={loading}
      variant={isFollowing ? "outline" : "default"}
      className="rounded-2xl h-12 px-8 font-bold shadow-xl transition-all gap-2"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isFollowing ? (
        <>
          <UserMinus className="h-5 w-5" /> Renunță
        </>
      ) : (
        <>
          <UserPlus className="h-5 w-5" /> Urmărește
        </>
      )}
    </Button>
  )
}
