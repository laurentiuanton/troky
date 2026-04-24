'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function login(formData: FormData) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: 'E-mail sau parolă incorectă' }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string
  const username = formData.get('username') as string

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  // Note: fullName goes into raw_user_meta_data to trigger our SQL handle_new_user profile creation
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        username: username,
      },
      emailRedirectTo: `${siteUrl}/auth/callback`,
    }
  })

  if (error) {
    return { error: error.message }
  }

  // Nu mai facem direct redirect pentru că utilizatorul trebuie să-și confirme contul pe email.
  return { success: 'Contul a fost creat! Te rugăm să verifici adresa de email (inclusiv folderul Spam) și să accesezi link-ul de confirmare.' }
}

export async function logout(formData?: FormData) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  
  await supabase.auth.signOut()
  
  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function resetPassword(formData: FormData) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const email = formData.get('email') as string

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'https://troky.vercel.app/auth/callback?next=/profile?tab=setari',
  })

  if (error) {
    console.error('Reset error:', error)
  }
}
