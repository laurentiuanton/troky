import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { MapPin, Clock, Tag, User, MessageCircle, AlertCircle, Calendar } from 'lucide-react'
import { notFound } from 'next/navigation'
import dynamic from 'next/dynamic'
import ProductGallery from './ProductGallery'

const MapLocationView = dynamic(() => import('@/components/MapLocationView'), { ssr: false, loading: () => <div className="w-full h-[250px] md:h-[350px] bg-muted/20 animate-pulse rounded-2xl border-2 border-border/50"></div> })
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export const revalidate = 0

export default async function ListingPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()

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

  if (error || !listing) {
    notFound()
  }

  const isOwner = user?.id === listing.user_id

  return (
    <div className="container max-w-7xl py-12 px-4 animate-fade-in relative z-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* PARTEA STÂNGĂ: IMAGINI (7 COLOANE) */}
        <div className="lg:col-span-7">
          <ProductGallery images={listing.listing_images || []} />
        </div>

        {/* PARTEA DREAPTĂ: DETALII (5 COLOANE) */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              <Badge 
                className={`text-[10px] font-black tracking-widest uppercase px-4 py-1.5 rounded-full ${
                  listing.tip_anunt === 'donatie' ? 'bg-[#10b981] hover:bg-[#10b981]' : 
                  listing.tip_anunt === 'vreau' ? 'bg-[#facc15] text-black hover:bg-[#facc15]' : 
                  'bg-[#3b82f6] hover:bg-[#3b82f6]'
                }`}
              >
                {listing.tip_anunt === 'donatie' ? 'Gratuit (Donez)' : listing.tip_anunt === 'vreau' ? 'Cerere (Vreau)' : 'Schimb (Barter)'}
              </Badge>
              <Badge variant="outline" className="text-[10px] font-bold tracking-wider uppercase px-4 py-1.5 rounded-full border-border">
                <Tag size={12} className="mr-1.5 text-primary" /> {listing.categories?.name || 'General'}
              </Badge>
            </div>

            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground leading-[1.1]">
              {listing.title}
            </h1>

            <div className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <MapPin size={16} className="text-[#ea9010]" /> {listing.location}
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar size={16} className="text-[#10b981]" /> {new Date(listing.created_at).toLocaleDateString('ro-RO')}
              </div>
            </div>
          </div>

          <Separator className="bg-border/60" />

          {/* DESCRIERE */}
          <div className="space-y-4">
            <h3 className="text-sm font-black tracking-widest text-[#000] uppercase">Descrierea produsului</h3>
            <p className="text-lg leading-relaxed text-foreground/80 font-medium italic">
              "{listing.description}"
            </p>
            
            <div className="flex justify-between items-center p-4 bg-muted/30 rounded-xl border border-border/40">
              <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Stare produs:</span>
              <Badge variant="secondary" className="font-bold text-sm px-4 py-1 rounded-lg uppercase">
                {listing.stare_produs}
              </Badge>
            </div>
            
            {listing.tip_anunt === 'schimb' && listing.ce_doresc_la_schimb && (
              <div className="p-4 bg-[#3b82f6]/5 rounded-xl border border-[#3b82f6]/20">
                <strong className="block text-xs font-black tracking-widest text-[#3b82f6] uppercase mb-2">Ce dorește la schimb:</strong>
                <p className="text-foreground font-semibold leading-snug">{listing.ce_doresc_la_schimb}</p>
              </div>
            )}
          </div>

          {/* HARTA PRODUSULUI */}
          {listing.lat && listing.lng && (
             <div className="space-y-3 p-1">
               <h3 className="text-sm font-black tracking-widest text-[#000] uppercase flex items-center gap-2"><MapPin size={16} className="text-[#10b981]"/> Zona Aproximativă</h3>
               <div className="rounded-3xl overflow-hidden border-2 border-border/60 shadow-lg relative z-0 h-[250px]">
                  <MapLocationView lat={listing.lat} lng={listing.lng} radiusMarker={true} zoom={14} />
               </div>
             </div>
          )}

          {/* CONTACT & PROFIL */}
          <Card className="border-border shadow-2xl shadow-black/5 overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/40">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                  <AvatarImage src={listing.profiles?.avatar_url} />
                  <AvatarFallback className="bg-[#10b981] text-white">
                    <User size={20} />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-black text-lg text-foreground leading-none mb-1">
                    {listing.profiles?.full_name || 'Utilizator Troky'}
                  </h4>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                    Pe platformă din {listing.profiles?.created_at ? new Date(listing.profiles.created_at).getFullYear() : new Date().getFullYear()}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {!user ? (
                <div className="space-y-4">
                   <Alert className="bg-[#ea9010]/5 border-[#ea9010]/20 rounded-xl">
                    <AlertCircle className="h-4 w-4 text-[#ea9010]" />
                    <AlertTitle className="text-xs font-black uppercase tracking-widest text-[#ea9010]">Acces Restricționat</AlertTitle>
                    <AlertDescription className="text-sm font-medium text-muted-foreground">
                      Trebuie să fii autentificat pentru a contacta acest utilizator.
                    </AlertDescription>
                  </Alert>
                  <Button asChild className="w-full bg-[#37371f] hover:bg-[#202012] text-white font-bold h-12 rounded-xl text-md">
                    <Link href="/login">Autentifică-te pentru contact</Link>
                  </Button>
                </div>
              ) : isOwner ? (
                <div className="text-center py-4 text-sm font-bold text-muted-foreground italic uppercase tracking-widest">
                  Gestionează acest anunț din profilul tău.
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

                  const { redirect } = await import('next/navigation')
                  redirect('/profile?tab=mesaje')
                }} className="space-y-4">
                  <Textarea 
                    name="content" 
                    required 
                    placeholder={`Salut, mă interesează "${listing.title}"...`} 
                    className="min-h-[100px] rounded-xl border-border bg-muted/10 text-md font-medium"
                  />
                  <Button type="submit" className="w-full bg-[#10b981] hover:bg-[#0d9668] text-white font-black h-12 rounded-xl text-md">
                    <MessageCircle className="mr-2 h-5 w-5" /> Trimite Mesaj Direct
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}
