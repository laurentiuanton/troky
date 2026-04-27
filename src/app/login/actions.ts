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

  // Note: fullName goes into raw_user_meta_data to trigger our SQL handle_new_user profile creation
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        username: username,
      }
    }
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/')
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

export async function signInWithGoogle() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://troky.vercel.app'}/auth/callback`,
    },
  })

  if (error) {
    console.error('Google login error:', error)
    return { error: error.message }
  }

  if (data.url) {
    redirect(data.url)
  }
}
