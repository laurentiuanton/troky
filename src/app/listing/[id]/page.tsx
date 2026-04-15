import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { MapPin, Clock, Tag, User, MessageCircle, AlertCircle } from 'lucide-react'
import { notFound } from 'next/navigation'
import ProductGallery from './ProductGallery'

export const revalidate = 0

export default async function ListingPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // Aflam daca cel care viziteaza este logat
  const { data: { user } } = await supabase.auth.getUser()

  // Preia anuntul specificat dupa ID
  const { data: listing, error } = await supabase
    .from('listings')
    .select(`
      *,
      profiles(full_name, avatar_url, created_at),
      categories(name),
      listing_images(image_url, is_primary)
    `)
    .eq('id', params.id)
    .single()

  // Daca nu exista (eroare de id, gresit etc), dam 404 Nextjs Default Error Page
  if (error || !listing) {
    notFound()
  }

  // Check ownership
  const isOwner = user?.id === listing.user_id

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 1rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
        
        {/* Partea Sângă: Imaginea și Galeria */}
        <div>
          <ProductGallery images={listing.listing_images || []} />
        </div>

        {/* Partea Dreaptă: Detaliile Anunțului */}
        <div>
          <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <span style={{ padding: '0.5rem 1.25rem', borderRadius: '100px', background: listing.tip_anunt === 'donatie' ? 'var(--primary)' : listing.tip_anunt === 'vreau' ? 'var(--accent)' : 'var(--secondary)', color: listing.tip_anunt === 'schimb' ? 'var(--foreground)' : 'var(--background)', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.8rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
              {listing.tip_anunt === 'donatie' ? 'Gratuit (Donez)' : listing.tip_anunt === 'vreau' ? 'Cerere (Vreau)' : 'Pentru Schimb'}
            </span>
            <span style={{ padding: '0.5rem 1.25rem', borderRadius: '100px', background: 'white', border: '1px solid var(--border)', color: 'var(--foreground)', fontWeight: 600, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Tag size={14} style={{ color: 'var(--primary)' }}/> {listing.categories?.name || 'General'}
            </span>
          </div>

          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--foreground)' }}>{listing.title}</h1>
          
          <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--muted-foreground)', marginBottom: '2rem', fontSize: '0.95rem', flexWrap: 'wrap' }}>
             <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MapPin size={16}/> {listing.location}
             </span>
             <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Clock size={16}/> {new Date(listing.created_at).toLocaleDateString('ro-RO')}
             </span>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: 'var(--foreground)' }}>Descrierea produsului</h3>
            <p style={{ margin: 0, color: 'var(--secondary-foreground)', whiteSpace: 'pre-wrap', lineHeight: '1.7' }}>
              {listing.description}
            </p>
            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--muted-foreground)' }}>Stare produs:</span>
              <strong style={{ color: 'var(--foreground)', textTransform: 'capitalize' }}>{listing.stare_produs}</strong>
            </div>
            
            {listing.tip_anunt === 'schimb' && listing.ce_doresc_la_schimb && (
              <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(132, 204, 22, 0.1)', borderRadius: 'var(--radius)', border: '1px solid rgba(132, 204, 22, 0.3)' }}>
                <strong style={{ display: 'block', color: 'var(--accent)', marginBottom: '0.4rem' }}>Ce doresc la schimb:</strong>
                <span style={{ color: 'var(--secondary-foreground)' }}>{listing.ce_doresc_la_schimb}</span>
              </div>
            )}
          </div>

          {/* Zona de Profil & Contact - Aplicam restrictia definita la Arhitectura! */}
          <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted-foreground)', overflow: 'hidden' }}>
                {listing.profiles?.avatar_url ? (
                  <img src={listing.profiles.avatar_url} alt="avatar" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                ) : (
                  <User size={24} />
                )}
              </div>
              <div>
                <h4 style={{ margin: 0 }}>{listing.profiles?.full_name || 'Utilizator Troky'}</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>Pe platformă din {listing.profiles?.created_at ? new Date(listing.profiles.created_at).getFullYear() : new Date().getFullYear()}</p>
              </div>
            </div>

            {/* Aici e INIMA sistemului nostru: Securitatea la Date. Dacă n-ai sesiune, nu poți contacta. */}
            {!user ? (
              <div style={{ padding: '1rem', background: 'var(--background)', borderRadius: 'var(--radius)', border: '1px dashed var(--border)', textAlign: 'center' }}>
                <AlertCircle size={24} style={{ color: 'var(--primary)', marginBottom: '0.5rem' }} />
                <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: 'var(--muted-foreground)' }}>Detaliile complete și interacțiunea sunt ascunse din motive de mediu sigur de schimbare.</p>
                <Link href="/login" className="btn btn-primary" style={{ width: '100%' }}>Autentifică-te pentru a contacta</Link>
              </div>
            ) : isOwner ? (
              <div style={{ padding: '1rem', background: 'var(--background)', borderRadius: 'var(--radius)', textAlign: 'center', color: 'var(--muted-foreground)' }}>
                Acesta este anunțul tău.
              </div>
            ) : (
              <form action={async (formData) => {
                'use server'
                const { cookies } = await import('next/headers')
                const cookieStore = await cookies()
                const { createClient } = await import('@/utils/supabase/server')
                const s = createClient(cookieStore)
                const content = formData.get('content') as string
                
                await s.from('messages').insert({
                   sender_id: user.id,
                   receiver_id: listing.user_id,
                   listing_id: listing.id,
                   content
                })

                /* Optional: Putem invoca aici utlitarul de Resend creat pt a trimite notificarea! */

                const { redirect } = await import('next/navigation')
                redirect('/profile?tab=mesaje')
              }} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <textarea 
                  name="content" 
                  required 
                  placeholder={`Salut, aș dori să facem un schimb pentru ${listing.title}...`} 
                  className="form-input" 
                  style={{ resize: 'vertical', padding: '1rem' }} 
                  rows={3}
                />
                <button type="submit" className="btn btn-primary" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', width: '100%' }}>
                  <MessageCircle size={20} /> Trimite Mesaj direct către {listing.profiles?.full_name?.split(' ')[0] || 'Utilizator'}
                </button>
              </form>
            )}
            
          </div>

        </div>
      </div>
    </div>
  )
}
