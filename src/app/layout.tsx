import type { Metadata } from 'next'
import './globals.css'
import Link from 'next/link'
import { User, LogOut, PlusCircle, Search, MessageSquare, ShieldCheck } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { logout } from '@/app/login/actions'
import { Button } from '@/components/ui/button'
import { Toaster } from 'sonner'
import { RealtimeNotifications } from '@/components/RealtimeNotifications'
import { MessagesBadge } from '@/components/MessagesBadge'

export const metadata: Metadata = {
  title: 'Troky - Platformă Premium de Barter & Schimburi',
  description: 'Schimbă lucrurile de care nu mai ai nevoie. Platformă gratuită pentru schimburi între utilizatori, fără prețuri, doar barter curat.',
}

async function Header() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()

  let unreadCount = 0
  if (user) {
    const { count } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', user.id)
      .eq('read_state', false)
    unreadCount = count || 0
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-4 md:pt-6">
      <div className="container max-w-7xl mx-auto">
        <div className="bg-white/70 backdrop-blur-2xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.05)] rounded-[2rem] h-16 md:h-20 flex items-center justify-between px-6 md:px-10 transition-all duration-500">
          
          {/* LOGO LEFT */}
          <Link href="/" className="group flex items-center gap-1">
            <span className="text-2xl md:text-3xl font-black tracking-tighter text-primary group-hover:scale-105 transition-transform duration-300">
              Troky<span className="text-[#10b981]">.</span>
            </span>
          </Link>

          {/* ACTIONS RIGHT */}
          <nav className="flex items-center gap-3 md:gap-5">
            {user ? (
              <>
                <Button asChild variant="ghost" className="hidden lg:flex font-black text-[10px] tracking-widest uppercase hover:text-secondary group transition-all px-4">
                  <Link href="/search" className="flex items-center gap-2">
                    <Search size={16} className="group-hover:rotate-12 transition-transform" /> Caută
                  </Link>
                </Button>

                <Button asChild className="hidden sm:flex font-black bg-accent hover:bg-accent/90 text-white rounded-[1.2rem] h-10 md:h-12 px-6 shadow-lg shadow-accent/20 hover:scale-105 active:scale-95 transition-all">
                  <Link href="/add">
                    <PlusCircle className="h-5 w-5 md:mr-2" /> 
                    <span className="hidden md:inline uppercase text-xs tracking-widest">Anunț Nou</span>
                  </Link>
                </Button>

                <div className="h-8 w-[1px] bg-border mx-1 hidden sm:block" />

                <div className="flex items-center gap-1 md:gap-2">
                  <Button asChild variant="ghost" className="rounded-2xl w-10 md:w-12 h-10 md:h-12 p-0 relative hover:bg-secondary/10 group">
                    <Link href="/profile">
                      <User size={22} className="text-primary group-hover:text-secondary transition-colors" />
                      <MessagesBadge userId={user.id} initialCount={unreadCount} />
                    </Link>
                  </Button>

                  <form action={logout}>
                    <Button type="submit" variant="ghost" className="rounded-2xl w-10 md:w-12 h-10 md:h-12 p-0 hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
                      <LogOut size={20} />
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <Button asChild className="font-black bg-primary hover:bg-primary/90 text-white rounded-[1.2rem] h-10 md:h-12 px-6 md:px-10 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                <Link href="/login" className="flex items-center gap-2">
                  <User size={18} /> <span className="uppercase text-xs tracking-widest">Autentificare</span>
                </Link>
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}

function Footer() {
    return (
      <footer className="bg-white border-t border-border pt-20 pb-10 mt-24 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-border to-transparent" />
        
        <div className="container max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-1 space-y-6">
              <Link href="/" className="text-3xl font-black tracking-tighter text-primary">
                Troky<span className="text-[#10b981]">.</span>
              </Link>
              <p className="text-muted-foreground font-medium leading-relaxed max-w-xs">
                Cea mai mare comunitate de barter premium din România. Schimbă inteligent, trăiește sustenabil.
              </p>
            </div>
            
            <div className="space-y-6">
              <h4 className="text-sm font-black uppercase tracking-[0.2em] text-primary">Platformă</h4>
              <ul className="space-y-4 font-bold text-sm text-muted-foreground">
                <li><Link href="/search" className="hover:text-secondary transition-colors">Caută Anunțuri</Link></li>
                <li><Link href="/add" className="hover:text-secondary transition-colors">Adaugă Anunț</Link></li>
                <li><Link href="/profile" className="hover:text-secondary transition-colors">Contul Meu</Link></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="text-sm font-black uppercase tracking-[0.2em] text-primary">Informații</h4>
              <ul className="space-y-4 font-bold text-sm text-muted-foreground">
                <li><Link href="/privacy" className="hover:text-secondary transition-colors">Confidențialitate</Link></li>
                <li><Link href="#" className="hover:text-secondary transition-colors">Termeni & Condiții</Link></li>
                <li><Link href="#" className="hover:text-secondary transition-colors">Reguli Barter</Link></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="text-sm font-black uppercase tracking-[0.2em] text-primary">Siguranță</h4>
              <div className="p-6 rounded-[2rem] bg-secondary/5 border border-secondary/10 flex flex-col items-center text-center gap-3">
                <ShieldCheck size={32} className="text-secondary" />
                <p className="text-xs font-bold leading-tight">Tranzacții 100% securizate prin evaluare comunitară.</p>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">
              &copy; {new Date().getFullYear()} Troky România. Built with passion for exchange.
            </p>
            <div className="flex gap-8 italic font-black text-[10px] text-[#10b981]">
              <span>#BeGreen</span>
              <span>#BarterClub</span>
              <span>#TrokyImpact</span>
            </div>
          </div>
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
        <main className="main-content w-full pt-28 md:pt-36">
          {children}
        </main>
        <Footer />
        <Toaster position="bottom-center" richColors />
        {user && <RealtimeNotifications userId={user.id} />}
      </body>
    </html>
  )
}
