import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { Search as SearchIcon, Filter, MapPin, Inbox, Tag, ArrowRight, Sparkles } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import SearchFiltersSidebar from '@/components/SearchFiltersSidebar'
import { cn } from "@/lib/utils"

export const revalidate = 0;

export default async function SearchPage(props: { searchParams: Promise<{ q?: string, category?: string, lat?: string, lng?: string, radius?: string, type?: string }> }) {
  const searchParams = await props.searchParams
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const queryText = searchParams.q || '';
  const categorySlug = searchParams.category || '';
  const listingType = searchParams.type || 'all';

  let categoryId = null;
  let categoryName = null;
  if (categorySlug && categorySlug !== 'all') {
    const { data: catData } = await supabase.from('categories').select('id, name').eq('slug', categorySlug).single();
    if (catData) {
      categoryId = catData.id;
      categoryName = catData.name;
    }
  }

  const userLat = searchParams.lat ? parseFloat(searchParams.lat) : null;
  const userLng = searchParams.lng ? parseFloat(searchParams.lng) : null;
  const radius = searchParams.radius ? parseFloat(searchParams.radius) : 15;

  let listings = [];

  if (userLat && userLng) {
     let rpcQuery = supabase.rpc('search_listings_by_radius', {
        user_lat: userLat,
        user_lng: userLng,
        radius_km: radius,
        search_query: queryText,
        search_category: categorySlug === 'all' ? '' : categorySlug
     })
     
     if (listingType && listingType !== 'all') {
        rpcQuery = rpcQuery.eq('tip_anunt', listingType)
     }

     const { data } = await rpcQuery
       .select('*, categories(name), listing_images(image_url, is_primary)')
       .order('created_at', { ascending: false });
       
     listings = data || [];
  } else {
     let dbQuery = supabase
       .from('listings')
       .select('*, categories(name), listing_images(image_url, is_primary)')
       .eq('is_active', true)
       
     if (categoryId) {
       dbQuery = dbQuery.eq('category_id', categoryId);
     }
   
     if (queryText) {
       dbQuery = dbQuery.ilike('title', `%${queryText}%`);
     }
     
     if (listingType && listingType !== 'all') {
       dbQuery = dbQuery.eq('tip_anunt', listingType);
     }
   
     dbQuery = dbQuery.order('created_at', { ascending: false });
     const { data } = await dbQuery;
     listings = data || [];
  }
  const { data: allCategories } = await supabase.from('categories').select('*').order('name');

  return (
    <div className="min-h-screen pb-24">
      <div className="container max-w-7xl mx-auto px-4 pt-12 md:pt-20 animate-fade-in relative z-10">
        
        {/* SEARCH HEADER */}
        <div className="mb-16 text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 rounded-full text-secondary font-black text-[10px] uppercase tracking-[0.2em] animate-in slide-in-from-top-4 duration-700">
             <Sparkles size={14} /> Descoperă Oportunitatea Ta
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-primary leading-tight">
            {queryText ? (
                <>Rezultate: <span className="text-secondary">"{queryText}"</span></>
            ) : categoryName ? (
                <>Explorăm <span className="text-secondary">{categoryName}</span></>
            ) : (
                <>Explorează <span className="text-secondary">Comunitatea</span></>
            )}
          </h1>
          <p className="text-[#37371f]/50 text-xl font-bold italic leading-relaxed">
            Am selectat special pentru tine {listings?.length || 0} anunțuri care s-ar putea să te intereseze astăzi.
          </p>
        </div>

        {/* SEARCH BAR & FILTERS SIDEBAR */}
        <div className="sticky top-24 z-30 mb-20 group">
            <SearchFiltersSidebar 
                initialQuery={queryText}
                initialCategory={categorySlug || 'all'}
                initialType={listingType}
                allCategories={allCategories || []}
                initialLat={userLat || undefined}
                initialLng={userLng || undefined}
                initialRadius={radius}
            />
        </div>

        {/* RESULTS GRID */}
        <div className="px-2">
            {listings && listings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-10 md:gap-14">
                {listings.map((listing: any, i: number) => {
                  const primaryImage = listing.listing_images?.find((img: any) => img.is_primary)?.image_url 
                    || listing.listing_images?.[0]?.image_url 
                    || '/placeholder-item.jpg';

                  return (
                    <Link href={`/listing/${listing.id}`} key={listing.id} className="group animate-in fade-in slide-in-from-bottom-8 duration-700" style={{ animationDelay: `${i * 50}ms` }}>
                      <Card className="border-none bg-white overflow-hidden rounded-[3rem] transition-all duration-500 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] group-hover:shadow-[0_48px_80px_-12px_rgba(0,0,0,0.12)] group-hover:-translate-y-2 h-full flex flex-col">
                          <div className="relative aspect-square overflow-hidden bg-muted/20">
                              <img 
                                  src={primaryImage} 
                                  alt={listing.title} 
                                  className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105" 
                              />
                              <div className="absolute top-6 left-6">
                                  <div className={cn(
                                      "text-[10px] font-black tracking-[0.2em] uppercase px-5 py-2.5 rounded-2xl shadow-2xl backdrop-blur-md text-white",
                                      listing.tip_anunt === 'donatie' ? 'bg-secondary/90' : 
                                      listing.tip_anunt === 'vreau' ? 'bg-accent/90' : 
                                      'bg-[#3b82f6]/90'
                                  )}>
                                      {listing.tip_anunt === 'donatie' ? 'Donez' : listing.tip_anunt === 'vreau' ? 'Caut' : 'Schimb'}
                                  </div>
                              </div>
                          </div>
                          <CardContent className="p-8 md:p-10 flex flex-col flex-1 gap-6">
                              <div className="space-y-4">
                                  <h3 className="text-2xl font-black text-primary line-clamp-2 leading-[1.2] group-hover:text-secondary transition-colors italic">
                                      {listing.title}
                                  </h3>
                                  <div className="flex items-center gap-3 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                                      <div className="w-8 h-8 rounded-full bg-secondary/5 flex items-center justify-center text-secondary border border-secondary/10">
                                          <MapPin size={14} />
                                      </div>
                                      <span className="truncate">{listing.location}</span>
                                  </div>
                              </div>
                              
                              <div className="mt-auto pt-8 border-t border-border/40 flex items-center justify-between">
                                  <div className="space-y-1">
                                      <span className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">Data Publicării</span>
                                      <span className="text-[11px] font-black italic text-primary">{new Date(listing.created_at).toLocaleDateString('ro-RO')}</span>
                                  </div>
                                  <div className="w-12 h-12 rounded-2xl bg-muted/20 flex items-center justify-center text-primary group-hover:bg-secondary group-hover:text-white transition-all duration-300">
                                      <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
                                  </div>
                              </div>
                          </CardContent>
                      </Card>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="max-w-xl mx-auto py-32 text-center flex flex-col items-center gap-10 opacity-60">
                  <div className="w-32 h-32 rounded-[3.5rem] bg-white shadow-2xl flex items-center justify-center text-muted-foreground/20 animate-soft-float">
                      <Inbox size={64} />
                  </div>
                  <div className="space-y-4">
                      <h3 className="text-3xl font-black tracking-tighter text-primary uppercase italic">Nimic deocamdată...</h3>
                      <p className="text-muted-foreground font-bold italic leading-relaxed uppercase tracking-[0.1em] text-xs">
                          Incearcă să folosești cuvinte cheie mai generale sau să elimini filtrele aplicate pentru a găsi trocul perfect.
                      </p>
                  </div>
                  <Button asChild variant="ghost" className="rounded-2xl font-black uppercase tracking-widest px-10 h-14 border border-border/40 hover:bg-secondary/10 hover:text-secondary group transition-all">
                      <Link href="/search" className="flex items-center gap-3"><Filter size={18} className="group-hover:rotate-12 transition-transform" /> Resetează toate filtrele</Link>
                  </Button>
              </div>
            )}
        </div>
      </div>
    </div>
  )
}
