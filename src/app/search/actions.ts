'use server'

import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function getAutocompleteSuggestions(query: string) {
  if (!query || query.length < 2) return []

  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data, error } = await supabase
      .from('listings')
      .select('title')
      .ilike('title', `%${query}%`)
      .eq('is_active', true)
      .limit(6)

    if (error) throw error

    // Return unique titles
    const titles = data.map(item => item.title)
    return Array.from(new Set(titles))
  } catch (err) {
    console.error('Autocomplete error:', err)
    return []
  }
}
