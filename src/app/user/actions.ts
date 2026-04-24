'use server'

import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function toggleFollow(followingId: string) {
  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Trebuie să fii autentificat.' }
    if (user.id === followingId) return { error: 'Nu te poți urmări pe tine însuți.' }

    // Check if following already
    const { data: existingFollow } = await supabase
      .from('followers')
      .select('*')
      .eq('follower_id', user.id)
      .eq('following_id', followingId)
      .maybeSingle()

    if (existingFollow) {
      // Unfollow
      await supabase
        .from('followers')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', followingId)
    } else {
      // Follow
      await supabase
        .from('followers')
        .insert({
          follower_id: user.id,
          following_id: followingId
        })
    }

    revalidatePath(`/user/${followingId}`)
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}
