import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Package, MessageSquare, Settings, LogOut, Edit, Trash2, Eye, MapPin, Clock } from 'lucide-react'
import { logout } from '@/app/login/actions'
import { deleteListing } from './actions'
import { ClientPasswordUpdate } from './ClientPasswordUpdate'
import ChatContainer from './ChatContainer'

export const revalidate = 0;

export default async function ProfilePage(props: { searchParams: Promise<{ tab?: string }> }) {
  const searchParams = await props.searchParams
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const activeTab = searchParams.tab || 'anunturi'

  // Fetch the user's listings
  const { data: myListings } = await supabase
    .from('listings')
    .select('*, listing_images(image_url, is_primary)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Fetch the user's profile info
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch Conversations for the Chat tab
  let conversations: any[] = []
  if (activeTab === 'mesaje') {
    const { data: allUserMessages } = await supabase
      .from('messages')
      .select(`
        *,
        listings(title, id),
        sender:profiles!messages_sender_id_fkey(full_name, id),
        receiver:profiles!messages_receiver_id_fkey(full_name, id)
      `)
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false })

    if (allUserMessages) {
      const convMap = new Map()
      allUserMessages.forEach((msg: any) => {
        const otherUser = msg.sender_id === user.id ? msg.receiver : msg.sender
        const convKey = `${msg.listing_id}-${otherUser?.id}`
        if (!convMap.has(convKey)) {
          convMap.set(convKey, {
            listing_id: msg.listing_id,
            listing_title: msg.listings?.title,
            other_user_id: otherUser?.id,
            other_user_name: otherUser?.full_name,
            last_message: msg.content,
            last_date: msg.created_at
          })
        }
      })
      conversations = Array.from(convMap.values())
    }
  }

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 1rem' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold' }}>
           {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 style={{ fontSize: '2rem', margin: '0 0 0.2rem 0', color: 'var(--foreground)' }}>
            Salut, {profile?.full_name || 'Utilizator'}!
          </h1>
          <p style={{ margin: 0, color: 'var(--muted-foreground)' }}>{user.email}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 1fr) 3fr', gap: '2rem', alignItems: 'start' }} className="profile-grid">
        
        {/* Sidebar Menu OLX Style */}
        <div className="glass-panel" style={{ padding: '1rem 0', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Link href="/profile?tab=anunturi" style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none', color: activeTab === 'anunturi' ? 'var(--primary)' : 'var(--foreground)', background: activeTab === 'anunturi' ? 'rgba(16, 185, 129, 0.1)' : 'transparent', fontWeight: activeTab === 'anunturi' ? 600 : 400, borderRight: activeTab === 'anunturi' ? '4px solid var(--primary)' : '4px solid transparent' }}>
              <Package size={20} />
              Anunțurile mele ({myListings?.length || 0})
            </Link>
            
            <Link href="/profile?tab=mesaje" style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none', color: activeTab === 'mesaje' ? 'var(--primary)' : 'var(--foreground)', background: activeTab === 'mesaje' ? 'rgba(16, 185, 129, 0.1)' : 'transparent', fontWeight: activeTab === 'mesaje' ? 600 : 400, borderRight: activeTab === 'mesaje' ? '4px solid var(--primary)' : '4px solid transparent' }}>
              <MessageSquare size={20} />
              Mesaje
            </Link>
            
            <Link href="/profile?tab=setari" style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none', color: activeTab === 'setari' ? 'var(--primary)' : 'var(--foreground)', background: activeTab === 'setari' ? 'rgba(16, 185, 129, 0.1)' : 'transparent', fontWeight: activeTab === 'setari' ? 600 : 400, borderRight: activeTab === 'setari' ? '4px solid var(--primary)' : '4px solid transparent' }}>
              <Settings size={20} />
              Setări prezență
            </Link>

            <form action={logout} style={{ marginTop: '1rem', borderTop: '1px solid var(--border)' }}>
               <button type="submit" style={{ width: '100%', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none', background: 'none', border: 'none', color: '#ef4444', fontWeight: 500, cursor: 'pointer', textAlign: 'left', fontSize: '1rem' }}>
                  <LogOut size={20} /> Deconectare
               </button>
            </form>
          </div>
        </div>

        {/* Main Content Area */}
        <div style={{ padding: '0 1rem' }}>
           {activeTab === 'anunturi' && (
             <div>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--foreground)' }}>Anunțurile mele</h2>
                
                {myListings && myListings.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {myListings.map((listing: any) => {
                      const primaryImg = listing.listing_images?.find((i:any) => i.is_primary)?.image_url || listing.listing_images?.[0]?.image_url || 'https://via.placeholder.com/150';
                      return (
                        <div key={listing.id} className="glass-panel" style={{ display: 'flex', gap: '1rem', padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', flexWrap: 'wrap' }}>
                          <img src={primaryImg} alt={listing.title} style={{ width: '150px', height: '120px', objectFit: 'cover', borderRadius: 'var(--radius)' }} />
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                               <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', color: 'var(--primary)' }}>{listing.title}</h3>
                               <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem', borderRadius: '100px', background: listing.is_active ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: listing.is_active ? 'var(--primary)' : '#ef4444', fontWeight: 600 }}>
                                 {listing.is_active ? 'Activ' : 'Inactiv'}
                               </span>
                            </div>
                            <p style={{ margin: '0 0 1rem 0', color: 'var(--muted-foreground)', fontSize: '0.9rem' }}><MapPin size={14} style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> {listing.location} &nbsp;&bull;&nbsp; Adăugat la: {new Date(listing.created_at).toLocaleDateString('ro-RO')}</p>
                            
                            <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto' }}>
                               <Link href={`/listing/${listing.id}`} className="btn btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.9rem', gap: '0.4rem', border: '1px solid var(--border)' }}>
                                  <Eye size={16} /> Vezi
                               </Link>
                               <Link href={`/edit/${listing.id}`} className="btn btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.9rem', gap: '0.4rem', border: '1px solid var(--border)' }}>
                                  <Edit size={16} /> Editează
                               </Link>
                               <form action={deleteListing.bind(null, listing.id)}>
                                 <button type="submit" className="btn" style={{ padding: '0.4rem 1rem', fontSize: '0.9rem', gap: '0.4rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', cursor: 'pointer' }}>
                                    <Trash2 size={16} /> Șterge
                                 </button>
                               </form>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--glass-bg)', border: '2px dashed var(--border)', borderRadius: 'var(--radius)' }}>
                     <p style={{ color: 'var(--muted-foreground)', marginBottom: '1rem' }}>Nu ai postat niciun anunț încă.</p>
                     <Link href="/add" className="btn btn-primary">Adaugă primul anunț</Link>
                  </div>
                )}
             </div>
           )}

           {activeTab === 'mesaje' && (
             <div>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--foreground)' }}>Conversațiile Mele</h2>
                <ChatContainer currentUser={user} initialConversations={conversations} />
             </div>
           )}

           {activeTab === 'setari' && (
             <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
               <div style={{ padding: '1.5rem', background: 'var(--glass-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
                 <h3 style={{ color: 'var(--foreground)', marginBottom: '1.5rem' }}>Setări Cont (Informații)</h3>
                 <div style={{ display: 'grid', gap: '1rem', maxWidth: '400px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--muted-foreground)' }}>Numele Public (Afișat pe platformă)</label>
                      <input type="text" className="form-input" defaultValue={profile?.full_name || ''} disabled style={{ opacity: 0.7 }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--muted-foreground)' }}>Adresă E-mail</label>
                      <input type="text" className="form-input" defaultValue={user.email} disabled style={{ opacity: 0.7 }} />
                    </div>
                    <button className="btn btn-primary" style={{ marginTop: '1rem', width: 'fit-content' }} disabled>Salvează modificări (În curând)</button>
                 </div>
               </div>

               {/* Schimbare Parolă Block */}
               <div style={{ padding: '1.5rem', background: 'var(--glass-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
                 <h3 style={{ color: 'var(--foreground)', marginBottom: '1.5rem' }}>Securitate: Schimbă Parola</h3>
                 <ClientPasswordUpdate />
               </div>
             </div>
           )}
        </div>

      </div>
    </div>
  )
}
