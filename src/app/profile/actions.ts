'use server'

import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function updatePassword(formData: FormData) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  
  const password = formData.get('new_password') as string

  if (!password || password.length < 6) {
    return { error: 'Parola trebuie să conțină minim 6 caractere.' }
  }

  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return { error: 'Eroare la securizarea contului. Încercați din nou.' }
  }

  return { success: 'Parola a fost actualizată cu succes!' }
}

export async function deleteListing(listingId: string, formData: FormData) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { error } = await supabase
    .from('listings')
    .delete()
    .eq('id', listingId)
    .eq('user_id', user.id) // Security check

  if (error) {
    console.error('Delete error:', error)
    return
  }

  const { revalidatePath } = await import('next/cache')
  revalidatePath('/profile')
}
