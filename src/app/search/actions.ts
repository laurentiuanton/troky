'use server'

import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function getAutocompleteSuggestions(query: string): Promise<string[]> {
  if (!query || query.length < 2) return []

  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const words = query.trim().split(/\s+/).filter(w => w.length > 0)
    let queryBuilder = supabase
      .from('listings')
      .select('title')
      .eq('is_active', true)

    // Construim o căutare pentru fiecare cuvânt (ordinea nu mai contează)
    words.forEach(word => {
      queryBuilder = queryBuilder.ilike('title', `%${word}%`)
    })

    const { data, error } = await queryBuilder.limit(10)

    if (error) throw error

    // Returnăm titluri unice și le curățăm
    const titles = data.map((item: { title: string }) => item.title.trim())
    return Array.from(new Set(titles)).slice(0, 6)
  } catch (err) {
    console.error('Autocomplete error:', err)
    return []
  }
}
