'use server'

import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function createListing(formData: FormData) {
  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: 'Trebuie să fii autentificat pentru a posta un anunț.' }
    }

    // Verificam daca utilizatorul are profil, daca nu, il cream automat
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!existingProfile) {
      await supabase.from('profiles').insert({
        id: user.id,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Utilizator',
        avatar_url: user.user_metadata?.avatar_url || null,
      })
    }

    // Parse fields
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const tip_anunt = formData.get('tip_anunt') as string 
    const stare_produs = formData.get('stare_produs') as string
    const location = formData.get('location') as string
    const latField = formData.get('lat') as string
    const lngField = formData.get('lng') as string
    const lat = latField ? parseFloat(latField) : null
    const lng = lngField ? parseFloat(lngField) : null
    
    const ce_doresc_la_schimb = formData.get('ce_doresc_la_schimb') as string || null
    const images = formData.getAll('images') as File[]
    const primaryImageName = formData.get('primary_image_name') as string
    const category_slug = formData.get('category_slug') as string

    // Find category ID by slug
    let category_id = null
    if (category_slug) {
      const { data: catData } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', category_slug)
        .single()
      category_id = catData?.id
    }

    // 1. Insert Listing
    const { data: listingData, error: listingError } = await supabase
      .from('listings')
      .insert({
        title,
        description,
        tip_anunt,
        stare_produs,
        location: location || 'Necunoscut',
        lat,
        lng,
        ce_doresc_la_schimb,
        category_id,
        user_id: user.id
      })
      .select('id')
      .single()

    if (listingError) {
      console.error('Listing insert error:', listingError)
      return { error: `Eroare creare anunț: ${listingError.message}` }
    }

    // 2. Handle Multiple Images Upload
    if (images && images.length > 0) {
      for (const file of images) {
        if (file.size === 0) continue

        const fileExt = file.name.split('.').pop()
        const fileName = `${listingData.id}-${Math.random()}.${fileExt}`

        const { error: uploadError } = await supabase
          .storage
          .from('anunturi')
          .upload(fileName, file)

        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage.from('anunturi').getPublicUrl(fileName)
          
          const isPrimary = file.name === primaryImageName

          await supabase.from('listing_images').insert({
            listing_id: listingData.id,
            image_url: publicUrlData.publicUrl,
            is_primary: isPrimary
          })
        } else {
          console.error('Upload error:', uploadError)
        }
      }
    }

    revalidatePath('/')
    return { success: true }
  } catch (err: any) {
    console.error('Server action error:', err)
    return { error: `Eroare server: ${err?.message || 'Încearcă din nou.'}` }
  }
}
