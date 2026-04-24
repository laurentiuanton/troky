import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function ProfilePage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="container py-24 text-center">
      <h1 className="text-4xl font-black">TEST PROFIL ONLINE</h1>
      <p className="mt-4">Dacă vezi acest mesaj, înseamnă că infrastructura paginii este bună.</p>
      <a href="/" className="mt-8 inline-block font-bold underline">Înapoi acasă</a>
    </div>
  )
}
