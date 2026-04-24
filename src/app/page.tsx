import Link from 'next/link'
import { PlusCircle, RefreshCw, HeartHandshake, Search } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

// Enable revalidation for dynamic content
export const revalidate = 0;

export default async function Home() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // Fetch categories
  const { data: categories } = await supabase.from('categories').select('*').order('name', { ascending: true })

  // Fetch active listings grouped by category (simple approach: fetch all active, then group mapped in React)
  // For production with massive rows, pagination or RPC is preferred.
  const { data: listings } = await supabase
    .from('listings')
    .select('*, profiles(full_name, avatar_url), listing_images(image_url, is_primary)')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  return (
    <div className="container animate-fade-in">
      <section style={{ textAlign: 'center', padding: '5rem 0 6rem 0' }}>
        <h1 style={{
          fontSize: '3.6rem',
          marginBottom: '2rem',
          letterSpacing: '-1.5px',
          background: 'linear-gradient(to right, #ea9010, #10b981, #3b82f6, #facc15)',
          color: '#000',
          display: 'inline-block',
          padding: '1rem 3rem',
          borderRadius: '1.25rem',
          fontWeight: 900,
          boxShadow: '0 15px 35px rgba(0,0,0,0.12)',
          border: '2px solid rgba(255,255,255,0.2)'
        }}>
          Dăruiește. Schimbă. Reciclează.
        </h1>
        <p style={{ fontSize: '1.9rem', color: '#1a1a10', maxWidth: '850px', margin: '0 auto 3.5rem', fontFamily: "'Dancing Script', cursive", fontWeight: 700, lineHeight: '1.2' }}>
          „Aici, banii n-au valoare, singura plată acceptată este strângerea de mână.”
        </p>

        {/* PREMIUM SEARCH BAR: AIRBNB STYLE ADAPTIVE */}
        <div style={{ maxWidth: '850px', margin: '0 auto 4rem auto', position: 'relative' }}>
          <form action="/search" className="flex flex-col md:flex-row items-stretch md:items-center bg-white/40 backdrop-blur-xl p-2 rounded-[2rem] md:rounded-full border-2 border-border shadow-xl focus-within:border-primary/30 transition-all gap-1">
            
            <div className="flex flex-col sm:flex-row flex-1 divide-y md:divide-y-0 md:divide-x divide-border/40">
                {/* Category Side */}
                <div className="flex items-center px-6 py-2 md:py-0 w-full md:w-[200px]">
                <select
                    name="category"
                    className="bg-transparent border-none outline-none text-sm font-bold cursor-pointer w-full text-foreground"
                >
                    <option value="">Toate Categoriile</option>
                    {categories?.map((c: any) => (
                    <option key={c.id} value={c.slug}>
                        {c.name}
                    </option>
                    ))}
                </select>
                </div>

                {/* Input Side */}
                <div className="flex-1 flex items-center px-6 py-3 md:py-0">
                <Search size={18} className="text-secondary mr-3 opacity-60" />
                <input
                    type="text"
                    name="q"
                    placeholder="Ce cauți astăzi pe Troky?"
                    className="flex-1 bg-transparent border-none outline-none text-sm font-semibold placeholder:text-muted-foreground/60"
                />
                </div>
            </div>

            {/* Submit Button */}
            <button type="submit" className="w-full md:w-auto px-10 py-4 md:py-3.5 bg-primary text-white font-black rounded-[1.5rem] md:rounded-full hover:scale-105 transition-transform shadow-lg shadow-primary/20">
              Caută
            </button>
          </form>
        </div>

        {/* PRIMARY ACTIONS: BOLD COLORED CIRCLES */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', maxWidth: '1000px', margin: '0 auto', padding: '0 1rem' }}>

          <Link href="/add?type=donez" className="glass-panel hover-lift" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '1.5rem', borderRadius: '1.25rem', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', background: '#10b981', color: '#000', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }}>
              <HeartHandshake size={32} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#000', fontWeight: 900, lineHeight: '1.2', textTransform: 'uppercase', letterSpacing: '1px' }}>Donez</h3>
            </div>
          </Link>

          <Link href="/add?type=schimb" className="glass-panel hover-lift" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '1.5rem', borderRadius: '1.25rem', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', background: '#3b82f6', color: '#000', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }}>
              <RefreshCw size={32} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#000', fontWeight: 900, lineHeight: '1.2', textTransform: 'uppercase', letterSpacing: '1px' }}>Schimb</h3>
            </div>
          </Link>

          <Link href="/add?type=vreau" className="glass-panel hover-lift" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '1.5rem', borderRadius: '1.25rem', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', background: '#facc15', color: '#000', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(250, 204, 21, 0.3)' }}>
              <Search size={32} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#000', fontWeight: 900, lineHeight: '1.2', textTransform: 'uppercase', letterSpacing: '1px' }}>Vreau</h3>
            </div>
          </Link>
        </div>
      </section>

      {/* SECTIONS BY TYPE: DONEZ, SCHIMB, VREAU */}
      <section style={{ padding: '1rem 0', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

        {/* SECTION: DONEZ */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--primary)', paddingBottom: '0.3rem', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--foreground)', margin: 0 }}>🎁 Donez</h2>
            <Link href="/search?type=donez" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.8rem' }}>Vezi tot</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
            {listings?.filter((l: any) => l.tip_anunt === 'donatie').slice(0, 6).map((listing: any) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </div>

        {/* SECTION: SCHIMB */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--secondary)', paddingBottom: '0.3rem', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--foreground)', margin: 0 }}>🔄 Schimb</h2>
            <Link href="/search?type=schimb" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.8rem' }}>Vezi tot</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
            {listings?.filter((l: any) => l.tip_anunt === 'schimb').slice(0, 6).map((listing: any) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </div>

        {/* SECTION: VREAU */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--accent)', paddingBottom: '0.3rem', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--foreground)', margin: 0 }}>🔍 Vreau</h2>
            <Link href="/search?type=vreau" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.8rem' }}>Vezi tot</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
            {listings?.filter((l: any) => l.tip_anunt === 'vreau').slice(0, 6).map((listing: any) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </div>

      </section>
    </div>
  )
}

function ListingCard({ listing }: { listing: any }) {
  const primaryImage = listing.listing_images?.find((img: any) => img.is_primary)?.image_url
    || listing.listing_images?.[0]?.image_url
    || 'https://via.placeholder.com/400x300?text=Fără+Imagine';

  return (
    <Link href={`/listing/${listing.id}`} className="glass-panel hover-lift" style={{ borderRadius: '0.5rem', overflow: 'hidden', textDecoration: 'none', color: 'inherit', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <div style={{ height: '130px', width: '100%', background: `url(${primaryImage}) center/cover no-repeat`, borderBottom: '1px solid var(--border)', position: 'relative' }}>
        <span style={{ position: 'absolute', top: '5px', left: '5px', fontSize: '0.55rem', padding: '0.1rem 0.4rem', borderRadius: '100px', background: listing.tip_anunt === 'donatie' ? 'var(--primary)' : listing.tip_anunt === 'vreau' ? 'var(--accent)' : 'var(--secondary)', color: listing.tip_anunt === 'schimb' ? 'var(--foreground)' : 'var(--background)', fontWeight: 800, textTransform: 'uppercase' }}>
          {listing.tip_anunt === 'donatie' ? 'Gratuit' : listing.tip_anunt === 'vreau' ? 'Cerere' : 'Schimb'}
        </span>
      </div>
      <div style={{ padding: '0.5rem', flex: 1 }}>
        <h3 style={{ fontSize: '0.85rem', margin: '0 0 0.2rem 0', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{listing.title}</h3>
        <p style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', margin: 0 }}>📍 {listing.location}</p>
      </div>
    </Link>
  )
}
