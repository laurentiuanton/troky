import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { Search as SearchIcon, Filter, MapPin, Inbox, Tag, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import SearchFiltersSidebar from '@/components/SearchFiltersSidebar'

export const revalidate = 0;

export default async function SearchPage(props: { searchParams: Promise<{ q?: string, category?: string, lat?: string, lng?: string, radius?: string }> }) {
  const searchParams = await props.searchParams
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const queryText = searchParams.q || '';
  const categorySlug = searchParams.category || '';

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
  const radius = searchParams.radius ? parseFloat(searchParams.radius) : 15; // default 15km

  let listings = [];

  if (userLat && userLng) {
     // Radius search
     const { data } = await supabase.rpc('search_listings_by_radius', {
        user_lat: userLat,
        user_lng: userLng,
        radius_km: radius,
        search_query: queryText,
        search_category: categorySlug === 'all' ? '' : categorySlug
     }).select('*, categories(name), listing_images(image_url, is_primary)')
       .order('created_at', { ascending: false });
       
     listings = data || [];
  } else {
     // Standard Search
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
   
     dbQuery = dbQuery.order('created_at', { ascending: false });
     const { data } = await dbQuery;
     listings = data || [];
  }
  const { data: allCategories } = await supabase.from('categories').select('*').order('name');

  return (
    <div className="container max-w-7xl py-12 px-4 animate-fade-in relative z-10">
      
      {/* SEARCH HEADER */}
      <div className="mb-12 text-center md:text-left">
        <h1 className="text-4xl font-black tracking-tight text-foreground mb-3 uppercase italic">
          {queryText ? `Rezultate căutare: "${queryText}"` : categoryName ? `Categorie: ${categoryName}` : 'Explorează Anunțurile'}
        </h1>
        <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">
          Am găsit {listings?.length || 0} oportunități de schimb pentru tine
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* FILTERS SIDEBAR (3/12) */}
        <div className="lg:col-span-4 xl:col-span-3">
            <SearchFiltersSidebar 
                initialQuery={queryText}
                initialCategory={categorySlug || 'all'}
                allCategories={allCategories || []}
                initialLat={userLat || undefined}
                initialLng={userLng || undefined}
                initialRadius={radius}
            />
        </div>

        {/* RESULTS GRID (9/12) */}
        <div className="lg:col-span-8 xl:col-span-9">
          {listings && listings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {listings.map((listing: any) => {
                const primaryImage = listing.listing_images?.find((img: any) => img.is_primary)?.image_url 
                  || listing.listing_images?.[0]?.image_url 
                  || '/placeholder-item.jpg';

                return (
                  <Link href={`/listing/${listing.id}`} key={listing.id} className="group">
                    <Card className="hover-lift h-full border-border bg-white overflow-hidden rounded-3xl transition-all shadow-xl shadow-black/5">
                        <div className="relative aspect-[4/3] overflow-hidden">
                            <img 
                                src={primaryImage} 
                                alt={listing.title} 
                                className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110" 
                            />
                            <div className="absolute top-3 left-3">
                                <Badge 
                                    className={`text-[9px] font-black tracking-widest uppercase px-3 py-1 rounded-full shadow-lg ${
                                        listing.tip_anunt === 'donatie' ? 'bg-[#10b981]' : 
                                        listing.tip_anunt === 'vreau' ? 'bg-[#facc15] text-black' : 
                                        'bg-[#3b82f6]'
                                    }`}
                                >
                                    {listing.tip_anunt === 'donatie' ? 'Donez' : listing.tip_anunt === 'vreau' ? 'Caut' : 'Schimb'}
                                </Badge>
                            </div>
                        </div>
                        <CardContent className="p-5 flex flex-col flex-1">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-lg font-black text-foreground line-clamp-2 leading-tight group-hover:text-[#10b981] transition-colors">
                                    {listing.title}
                                </h3>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">
                                <MapPin size={12} className="text-[#ea9010]" /> {listing.location}
                            </div>
                            <div className="mt-auto pt-4 border-t border-border/40 flex items-center justify-between text-muted-foreground">
                                <span className="text-[10px] font-bold italic uppercase">{new Date(listing.created_at).toLocaleDateString('ro-RO')}</span>
                                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                            </div>
                        </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          ) : (
            <Card className="border-dashed border-2 py-24 text-center rounded-3xl bg-muted/5 flex flex-col items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-muted/20 flex items-center justify-center border border-border/50">
                    <Inbox size={40} className="text-muted-foreground/30" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-2xl font-black tracking-tight text-foreground uppercase italic">Nu am găsit rezultate</h3>
                    <p className="text-muted-foreground font-semibold italic max-w-sm mx-auto">
                        Incearcă să folosești cuvinte cheie mai generale sau să elimini filtrele aplicate.
                    </p>
                </div>
                <Button asChild variant="outline" className="rounded-xl font-bold border-border px-8">
                    <Link href="/search">Resetează toate filtrele</Link>
                </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
