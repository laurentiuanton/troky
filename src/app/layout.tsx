import type { Metadata } from 'next'
import './globals.css'
import Link from 'next/link'
import { User, LogOut } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { logout } from '@/app/login/actions'

export const metadata: Metadata = {
  title: 'Troky - Platformă Premium de Barter & Schimburi',
  description: 'Schimbă lucrurile de care nu mai ai nevoie. Platformă gratuită pentru schimburi între utilizatori, fără prețuri, doar barter curat.',
}

async function Header() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <header className="navbar">
      <div className="container navbar-container">
        <Link href="/" className="navbar-brand" style={{ fontSize: '1.8rem', fontWeight: 900, color: '#30f2f2' }}>
          Troky
        </Link>
        <nav className="navbar-nav">
          {user ? (
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <Link href="/add" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                 Anunț Nou
              </Link>
              <Link href="/profile" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, background: 'none' }}>
                <User size={18} /> Contul Meu
              </Link>
              <form action={logout}>
                <button type="submit" className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.95rem', fontWeight: 500 }}>
                  <LogOut size={18} /> Ieșire
                </button>
              </form>
            </div>
          ) : (
            <Link href="/login" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
              <User size={18} /> Autentificare
            </Link>
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
      <body suppressHydrationWarning style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />
        <main className="main-content">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
