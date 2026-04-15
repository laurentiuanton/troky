import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { Search as SearchIcon, Filter, MapPin, Inbox } from 'lucide-react'

export const revalidate = 0;

export default async function SearchPage(props: { searchParams: Promise<{ q?: string, category?: string }> }) {
  const searchParams = await props.searchParams
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const queryText = searchParams.q || '';
  const categorySlug = searchParams.category || '';

  // 1. Daca avem un slug de categorie in URL, ii aflam ID-ul.
  let categoryId = null;
  let categoryName = null;
  if (categorySlug) {
    const { data: catData } = await supabase.from('categories').select('id, name').eq('slug', categorySlug).single();
    if (catData) {
      categoryId = catData.id;
      categoryName = catData.name;
    }
  }

  // 2. Construim Query-ul DB principal
  let dbQuery = supabase
    .from('listings')
    .select('*, categories(name), listing_images(image_url, is_primary)')
    .eq('is_active', true)
    
  // Filtrare optionala pe categorie
  if (categoryId) {
    dbQuery = dbQuery.eq('category_id', categoryId);
  }

  // Filtrare optionala pe text
  if (queryText) {
    // ilike = case insensitive bazat pe search. Supabase foloseste PostgREST.
    dbQuery = dbQuery.ilike('title', `%${queryText}%`);
  }

  // Ordonam de la cele mai noi
  dbQuery = dbQuery.order('created_at', { ascending: false });

  const { data: listings, error } = await dbQuery;

  // 3. Toate categoriile pt Sidebar Filters
  const { data: allCategories } = await supabase.from('categories').select('*').order('name');

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 1rem' }}>
      
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: 'var(--foreground)' }}>
          {queryText ? `Rezultate căutare pentru "${queryText}"` : categoryName ? `Explorezi categoria: ${categoryName}` : 'Toate Anunțurile'}
        </h1>
        <p style={{ color: 'var(--muted-foreground)' }}>Avem {listings?.length || 0} rezultate potrivite pentru dorințele tale.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 1fr) 3fr', gap: '2rem', alignItems: 'start' }} className="profile-grid">
        
        {/* FILTERS SIDEBAR */}
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
           <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--foreground)' }}>
             <Filter size={18}/> Filtrează Modul
           </h3>
           <form action="/search" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
             
             <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--muted-foreground)', fontSize: '0.9rem' }}>Cuvânt cheie</label>
                <input type="text" name="q" className="form-input" defaultValue={queryText} placeholder="Ce dorești să cauți?" style={{ paddingLeft: '0.8rem', paddingRight: '0.8rem' }} />
             </div>

             <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--muted-foreground)', fontSize: '0.9rem' }}>Alege Categoria</label>
                <select name="category" className="form-input" defaultValue={categorySlug} style={{ paddingLeft: '0.8rem', paddingRight: '0.8rem' }}>
                   <option value="">Oriunde pe platformă</option>
                   {allCategories?.map((c) => (
                     <option key={c.id} value={c.slug}>{c.name}</option>
                   ))}
                </select>
             </div>

             <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>Aplică filtrele</button>
             {(queryText || categorySlug) && (
               <Link href="/search" className="btn btn-secondary" style={{ textAlign: 'center' }}>Resetează</Link>
             )}
           </form>
        </div>

        {/* RESULTS GRID */}
        <div>
          {listings && listings.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {listings.map(listing => {
                const primaryImage = listing.listing_images?.find((img: any) => img.is_primary)?.image_url 
                  || listing.listing_images?.[0]?.image_url 
                  || 'https://via.placeholder.com/400x300?text=Fără+Imagine';

                return (
                  <Link href={`/listing/${listing.id}`} key={listing.id} className="glass-panel hover-lift" style={{ borderRadius: 'var(--radius)', overflow: 'hidden', textDecoration: 'none', color: 'inherit', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ height: '200px', width: '100%', background: `url(${primaryImage}) center/cover no-repeat`, borderBottom: '1px solid var(--border)' }} />
                    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem', borderRadius: '100px', background: listing.tip_anunt === 'donatie' ? 'var(--primary)' : listing.tip_anunt === 'vreau' ? 'var(--accent)' : 'var(--secondary)', color: listing.tip_anunt === 'schimb' ? 'var(--foreground)' : 'white', fontWeight: 600, textTransform: 'uppercase' }}>
                          {listing.tip_anunt === 'donatie' ? 'Donez' : listing.tip_anunt === 'vreau' ? 'Caut' : 'Schimb'}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>{new Date(listing.created_at).toLocaleDateString()}</span>
                      </div>
                      <h3 style={{ fontSize: '1.2rem', margin: '0 0 0.5rem 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{listing.title}</h3>
                      <p style={{ margin: 'auto 0 0 0', fontSize: '0.85rem', color: 'var(--muted-foreground)', display: 'flex', alignItems: 'center', gap: '0.3rem', paddingTop: '1rem' }}>
                        <MapPin size={14}/> {listing.location}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--glass-bg)', borderRadius: 'var(--radius)', border: '2px dashed var(--border)' }}>
              <Inbox size={48} style={{ color: 'var(--primary)', marginBottom: '1rem', opacity: 0.5 }} />
              <h3>Nu am găsit niciun produs.</h3>
              <p style={{ color: 'var(--muted-foreground)' }}>Ai putea încerca să folosești alte cuvinte cheie pentru căutarea ta, sau să resetezi categoria aleasă.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
