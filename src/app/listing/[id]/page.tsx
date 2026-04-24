import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { MapPin, Clock, Tag, User, MessageCircle, AlertCircle, Calendar, Sparkles, ShieldCheck, ArrowLeft, Heart } from 'lucide-react'
import { notFound } from 'next/navigation'
import ProductGallery from './ProductGallery'
import DynamicMapLocationView from '@/components/DynamicMapLocationView'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

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
      profiles(full_name, avatar_url, created_at, username),
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
    <div className="min-h-screen pb-24">
      {/* HEADER NAV SUBTIL */}
      <div className="container max-w-7xl mx-auto px-4 pt-12 md:pt-16 mb-8 flex items-center justify-between">
          <Button asChild variant="ghost" className="rounded-full font-black text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-primary gap-2">
              <Link href="/search"><ArrowLeft size={16} /> Înapoi la căutare</Link>
          </Button>
          <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-destructive transition-all">
                  <Heart size={20} />
              </Button>
          </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 animate-fade-in relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-20">
          
          {/* GALERIE IMAGINI */}
          <div className="lg:col-span-7">
            <div className="sticky top-32">
                <ProductGallery images={listing.listing_images || []} />
            </div>
          </div>

          {/* DETALII PRODUS */}
          <div className="lg:col-span-5 flex flex-col gap-10">
            
            <div className="space-y-8">
              <div className="flex flex-wrap gap-3">
                <div className={cn(
                  "text-[10px] font-black tracking-[0.2em] uppercase px-5 py-2.5 rounded-2xl shadow-xl text-white",
                  listing.tip_anunt === 'donatie' ? 'bg-secondary' : 
                  listing.tip_anunt === 'vreau' ? 'bg-accent text-white' : 
                  'bg-[#3b82f6]'
                )}>
                  {listing.tip_anunt === 'donatie' ? 'Donație (Gratis)' : listing.tip_anunt === 'vreau' ? 'Cerere Specială' : 'Schimb (Barter)'}
                </div>
                <div className="bg-white/40 backdrop-blur border border-border/40 text-[10px] font-black tracking-[0.2em] uppercase px-5 py-2.5 rounded-2xl text-primary flex items-center gap-2">
                  <Tag size={12} className="text-secondary" /> {listing.categories?.name || 'General'}
                </div>
              </div>

              <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-primary leading-[1.1] italic">
                {listing.title}
              </h1>

              <div className="flex items-center gap-8 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                <div className="flex items-center gap-3">
                  <MapPin size={18} className="text-secondary" /> {listing.location}
                </div>
                <div className="flex items-center gap-3">
                  <Calendar size={18} className="text-accent" /> {new Date(listing.created_at).toLocaleDateString('ro-RO')}
                </div>
              </div>
            </div>

            <Separator className="bg-border/20" />

            {/* DESCRIERE & STARE */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-black tracking-[0.3em] text-muted-foreground uppercase">Povestea Produsului</h3>
                  <div className="flex items-center gap-2 px-4 py-1.5 bg-muted/30 rounded-xl">
                      <span className="text-[10px] font-black text-muted-foreground uppercase opacity-40">Stare:</span>
                      <span className="text-[10px] font-black text-secondary uppercase tracking-widest">{listing.stare_produs}</span>
                  </div>
              </div>
              <p className="text-xl leading-relaxed text-primary/80 font-bold italic">
                "{listing.description}"
              </p>
              
              {listing.tip_anunt === 'schimb' && listing.ce_doresc_la_schimb && (
                <div className="p-8 bg-white rounded-[2.5rem] border border-border/40 shadow-xl shadow-black/5 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:rotate-12 transition-transform duration-700">
                      <Sparkles size={60} className="text-secondary" />
                  </div>
                  <strong className="block text-[10px] font-black tracking-[0.3em] text-secondary uppercase mb-4">Ce dorește la schimb:</strong>
                  <p className="text-primary font-black text-lg leading-relaxed italic">
                    {listing.ce_doresc_la_schimb}
                  </p>
                </div>
              )}
            </div>

            {/* HARTA PRODUSULUI */}
            {listing.lat && listing.lng && (
               <div className="space-y-4">
                 <h3 className="text-[10px] font-black tracking-[0.3em] text-muted-foreground uppercase flex items-center gap-3">
                    <MapPin size={16} className="text-secondary"/> Zona de întâlnire
                 </h3>
                 <div className="rounded-[2.5rem] overflow-hidden border-4 border-muted shadow-2xl relative z-0 h-[280px]">
                    <DynamicMapLocationView lat={listing.lat} lng={listing.lng} radiusMarker={true} zoom={14} />
                 </div>
               </div>
            )}

            {/* CONTACT & PROFIL - GLASS CARD */}
            <Card className="glass-card border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.12)] rounded-[3rem] overflow-hidden">
              <CardHeader className="p-8 pb-4">
                <Link href={`/user/${listing.user_id}`} className="flex items-center justify-between group">
                  <div className="flex items-center gap-5">
                    <Avatar className="h-16 w-16 rounded-2xl border-4 border-white shadow-2xl transition-transform group-hover:scale-105">
                      <AvatarImage src={listing.profiles?.avatar_url} />
                      <AvatarFallback className="bg-primary text-white">
                        <User size={24} />
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <h4 className="font-black text-xl text-primary group-hover:text-secondary transition-colors italic">
                        {listing.profiles?.full_name || 'Utilizator Troky'}
                      </h4>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                        @{listing.profiles?.username || 'utilizator'} <ShieldCheck size={12} className="text-secondary" />
                      </p>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-primary shadow-sm hover:bg-secondary hover:text-white transition-all">
                      <ArrowLeft className="rotate-180" size={20} />
                  </div>
                </Link>
              </CardHeader>
              <CardContent className="p-8 pt-6">
                {!user ? (
                  <div className="space-y-6">
                     <Alert className="bg-accent/5 border-accent/20 rounded-2xl p-6">
                      <AlertCircle className="h-5 w-5 text-accent" />
                      <AlertTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-accent mb-2">Comunitate Securizată</AlertTitle>
                      <AlertDescription className="text-sm font-bold text-primary opacity-70 italic leading-relaxed">
                        Pentru a proteja integritatea schimburilor, te rugăm să te autentifici înainte de a trimite o propunere.
                      </AlertDescription>
                    </Alert>
                    <Button asChild className="w-full bg-primary hover:bg-black text-white font-black h-16 rounded-[1.5rem] text-sm uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 hover-scale">
                      <Link href="/login">Intră în comunitate</Link>
                    </Button>
                  </div>
                ) : isOwner ? (
                  <div className="text-center py-8">
                     <div className="w-16 h-16 rounded-full bg-muted/30 mx-auto flex items-center justify-center text-muted-foreground mb-4 opacity-40">
                         <ShieldCheck size={32} />
                     </div>
                     <p className="text-[10px] font-black text-muted-foreground italic uppercase tracking-[0.3em]">Acesta este anunțul tău</p>
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
                  }} className="space-y-5">
                    <Textarea 
                      name="content" 
                      required 
                      placeholder={`Salut, aș vrea să discutăm despre parteneriatul cu "${listing.title}"...`} 
                      className="premium-input min-h-[120px] rounded-[1.5rem] bg-white border-transparent shadow-inner p-6 text-base font-bold italic"
                    />
                    <Button type="submit" className="w-full bg-secondary hover:bg-secondary/90 text-white font-black h-16 rounded-[1.5rem] text-sm uppercase tracking-[0.2em] shadow-2xl shadow-secondary/20 hover-scale">
                      <MessageCircle className="mr-3 h-5 w-5" /> Propune un Barter
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  )
}
