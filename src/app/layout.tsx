import type { Metadata } from 'next'
import './globals.css'
import Link from 'next/link'
import { User, LogOut, PlusCircle } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { logout } from '@/app/login/actions'
import { Button } from '@/components/ui/button'
import { Toaster } from 'sonner'
import { RealtimeNotifications } from '@/components/RealtimeNotifications'

export const metadata: Metadata = {
  title: 'Troky - Platformă Premium de Barter & Schimburi',
  description: 'Schimbă lucrurile de care nu mai ai nevoie. Platformă gratuită pentru schimburi între utilizatori, fără prețuri, doar barter curat.',
}

async function Header() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <header className="navbar border-b-2 border-primary/10 bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between">
        {/* LOGO LEFT */}
        <Link href="/" className="text-2xl font-black tracking-tighter text-primary">
          Troky<span className="text-[#10b981]">.</span>
        </Link>

        {/* ACTIONS RIGHT */}
        <nav className="flex items-center gap-2 md:gap-4">
          {user ? (
            <>
              <Button asChild variant="default" className="font-bold bg-[#ea9010] hover:bg-[#d07f0e] text-white rounded-full px-4 md:px-6 h-10 md:h-11">
                <Link href="/add">
                  <PlusCircle className="h-4 w-4 md:mr-2" /> 
                  <span className="hidden md:inline">Anunț Nou</span>
                </Link>
              </Button>
              <Button asChild variant="ghost" className="font-bold gap-2 px-2 md:px-4">
                <Link href="/profile">
                  <User size={18} /> 
                  <span className="hidden md:inline">Contul Meu</span>
                </Link>
              </Button>
              <form action={logout}>
                <Button type="submit" variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive px-2">
                  <LogOut size={16} />
                </Button>
              </form>
            </>
          ) : (
            <Button asChild variant="default" className="font-bold bg-[#37371f] hover:bg-[#202012] text-white rounded-full px-6 md:px-8">
              <Link href="/login">
                <User className="mr-2 h-4 w-4" /> Autentificare
              </Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  )
}

function Footer() {
    return (
      <footer style={{ borderTop: '1px solid var(--border)', padding: '2rem 0', marginTop: 'auto', textAlign: 'center', color: 'var(--muted-foreground)', fontSize: '0.9rem' }}>
        <div className="container">
          <p>&copy; {new Date().getFullYear()} Troky. Toate drepturile rezervate.</p>
        </div>
      </footer>
    )
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <html lang="ro">
      <body suppressHydrationWarning className="flex flex-col min-h-screen">
        <div className="bg-map" />
        <Header />
        <main className="main-content">
          {children}
        </main>
        <Footer />
        <Toaster position="top-right" richColors />
        {user && <RealtimeNotifications userId={user.id} />}
      </body>
    </html>
  )
}
