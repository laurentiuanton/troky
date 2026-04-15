'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  PlusCircle, 
  Home, 
  Search, 
  User, 
  MessageSquare, 
  LogOut, 
  Settings,
  Heart,
  Package,
  ChevronLeft,
  ChevronRight,
  Menu
} from 'lucide-react'
import { useState } from 'react'

export default function Sidebar({ user, logoutAction }: { user: any, logoutAction: any }) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const navItems = [
    { name: 'Acasă', href: '/', icon: Home },
    { name: 'Explorează', href: '/search', icon: Search },
    { name: 'Anunțurile Mele', href: '/profile?tab=anunturi', icon: Package },
    { name: 'Mesaje', href: '/profile?tab=mesaje', icon: MessageSquare },
  ]

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`} style={{ 
      width: isCollapsed ? '80px' : '280px',
      background: '#1a1a10', // Versiune mai inchisa a Dark Khaki pt contrast
      color: '#eaefbd',
      height: '100vh',
      position: 'sticky',
      top: 0,
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      borderRight: '1px solid rgba(234, 239, 189, 0.1)',
      zIndex: 100
    }}>
      
      {/* Header / Logo */}
      <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {!isCollapsed && (
          <Link href="/" style={{ fontSize: '1.8rem', fontWeight: 900, color: '#30f2f2', textDecoration: 'none', letterSpacing: '-1px' }}>
            Troky
          </Link>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{ background: 'none', border: 'none', color: '#eaefbd', cursor: 'pointer', padding: '0.5rem', borderRadius: '8px', hover: { background: 'rgba(255,255,255,0.1)' } }}
        >
          {isCollapsed ? <Menu size={24} /> : <ChevronLeft size={24} />}
        </button>
      </div>

      {/* New Listing Button */}
      <div style={{ padding: '0 1rem 1.5rem 1rem' }}>
        <Link 
          href="/add" 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            gap: '0.8rem',
            padding: '0.8rem',
            background: 'linear-gradient(to right, var(--primary), #30f2f2)',
            color: '#000',
            borderRadius: '12px',
            textDecoration: 'none',
            fontWeight: 700,
            fontSize: '0.95rem',
            transition: 'transform 0.2s',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
          }}
          className="hover-lift"
        >
          <PlusCircle size={22} />
          {!isCollapsed && <span>Anunț Nou</span>}
        </Link>
      </div>

      {/* Navigation History style */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 0.8rem' }}>
        <div style={{ marginBottom: '2rem' }}>
            {!isCollapsed && <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'rgba(234, 239, 189, 0.5)', fontWeight: 800, marginBottom: '0.8rem', paddingLeft: '0.5rem' }}>Navigare</p>}
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                {navItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <li key={item.name}>
                            <Link href={item.href} style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '1rem', 
                                padding: '0.8rem', 
                                borderRadius: '10px',
                                textDecoration: 'none',
                                color: isActive ? '#30f2f2' : '#eaefbd',
                                background: isActive ? 'rgba(48, 242, 242, 0.1)' : 'transparent',
                                transition: 'all 0.2s',
                                justifyContent: isCollapsed ? 'center' : 'flex-start'
                            }} className="sidebar-link">
                                <item.icon size={22} />
                                {!isCollapsed && <span style={{ fontWeight: isActive ? 700 : 500 }}>{item.name}</span>}
                            </Link>
                        </li>
                    )
                })}
            </ul>
        </div>

        {/* Recently Viewed / Active Listings Placeholder */}
        {!isCollapsed && (
            <div>
                <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'rgba(234, 239, 189, 0.5)', fontWeight: 800, marginBottom: '0.8rem', paddingLeft: '0.5rem' }}>Recente</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingLeft: '0.5rem' }}>
                    <div style={{ fontSize: '0.85rem', color: 'rgba(234, 239, 189, 0.7)', cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>🍃 Bicicletă Pegas...</div>
                    <div style={{ fontSize: '0.85rem', color: 'rgba(234, 239, 189, 0.7)', cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>📚 Colecție cărți...</div>
                </div>
            </div>
        )}
      </div>

      {/* User / Profile Section at current bottom */}
      <div style={{ padding: '1rem', borderTop: '1px solid rgba(234, 239, 189, 0.1)' }}>
        {user ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Link href="/profile?tab=setari" style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '1rem', 
                    padding: '0.8rem', 
                    borderRadius: '10px',
                    textDecoration: 'none',
                    color: '#eaefbd',
                    justifyContent: isCollapsed ? 'center' : 'flex-start'
                }} className="sidebar-link">
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        {user.user_metadata?.avatar_url ? <img src={user.user_metadata.avatar_url} /> : <User size={18} />}
                    </div>
                    {!isCollapsed && (
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                            <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email.split('@')[0]}</p>
                            <p style={{ margin: 0, fontSize: '0.7rem', color: 'rgba(234, 239, 189, 0.5)' }}>Plan Gratuit</p>
                        </div>
                    )}
                </Link>
                <form action={logoutAction} style={{ width: '100%' }}>
                    <button type="submit" style={{ 
                        width: '100%',
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '1rem', 
                        padding: '0.8rem', 
                        borderRadius: '10px',
                        background: 'none',
                        border: 'none',
                        color: 'rgba(234, 239, 189, 0.7)',
                        cursor: 'pointer',
                        justifyContent: isCollapsed ? 'center' : 'flex-start'
                    }} className="sidebar-link">
                        <LogOut size={20} />
                        {!isCollapsed && <span style={{ fontSize: '0.9rem' }}>Deconectare</span>}
                    </button>
                </form>
            </div>
        ) : (
            <Link href="/login" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1rem', 
                padding: '0.8rem', 
                borderRadius: '10px',
                textDecoration: 'none',
                color: '#30f2f2',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                border: '1px solid rgba(48, 242, 242, 0.3)'
            }}>
                <User size={20} />
                {!isCollapsed && <span style={{ fontWeight: 700 }}>Autentificare</span>}
            </Link>
        )}
      </div>

      <style jsx>{`
        .sidebar-link:hover {
            background: rgba(255,255,255,0.05) !important;
            color: #30f2f2 !important;
        }
      `}</style>
    </div>
  )
}
