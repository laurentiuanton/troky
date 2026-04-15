'use server'

import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function updateListing(listingId: string, formData: FormData) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Neautorizat' }

  // Parse fields
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const tip_anunt = formData.get('tip_anunt') as string 
  const stare_produs = formData.get('stare_produs') as string
  const location = formData.get('location') as string
  const ce_doresc_la_schimb = formData.get('ce_doresc_la_schimb') as string || null
  const images = formData.getAll('images') as File[]
  const primaryImageName = formData.get('primary_image_name') as string

  // 1. Update Database Record
  const { error: updateError } = await supabase
    .from('listings')
    .update({
      title,
      description,
      tip_anunt,
      stare_produs,
      location,
      ce_doresc_la_schimb
    })
    .eq('id', listingId)
    .eq('user_id', user.id)

  if (updateError) {
    return { error: 'Eroare la actualizarea datelor.' }
  }

  // 2. Handle Image Updates (Simple approach: if new images are added, we add them to gallery)
  // If user wanted to delete old ones, we'd need more logic. 
  // For now let's just allow adding more or changing primary.
  
  if (images && images.length > 0 && images[0].size > 0) {
    for (const file of images) {
      if (file.size === 0) continue
      const fileExt = file.name.split('.').pop()
      const fileName = `${listingId}-${Math.random()}.${fileExt}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage.from('anunturi').upload(fileName, file)
      
      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage.from('anunturi').getPublicUrl(fileName)
        const isPrimary = file.name === primaryImageName
        
        if (isPrimary) {
            // Unset previous primary
            await supabase.from('listing_images').update({ is_primary: false }).eq('listing_id', listingId)
        }

        await supabase.from('listing_images').insert({
          listing_id: listingId,
          image_url: publicUrlData.publicUrl,
          is_primary: isPrimary
        })
      }
    }
  }

  revalidatePath('/profile')
  revalidatePath(`/listing/${listingId}`)
  redirect('/profile')
}
