import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MapPin, ShieldCheck, Package, Clock, Calendar } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export default async function PublicProfilePage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // 1. Fetch User Profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (!profile) return notFound()

  // 2. Fetch User Listings
  const { data: listings } = await supabase
    .from('listings')
    .select('*, listing_images(image_url, is_primary)')
    .eq('user_id', id)
    .order('created_at', { ascending: false })

  const joinDate = new Date(profile.created_at).toLocaleDateString('ro-RO', { year: 'numeric', month: 'long' })

  return (
    <div className="min-h-screen bg-[#fbfbf6]">
      <div className="container max-w-6xl py-12 px-4 space-y-12">
        
        {/* PROFILE HEADER CARD */}
        <Card className="border-border shadow-2xl rounded-[3rem] overflow-hidden bg-white p-8 md:p-12 relative">
           <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-[#10b981]/10 to-[#ea9010]/10" />
           
           <div className="relative flex flex-col md:flex-row items-center md:items-end gap-8 mt-4">
              <Avatar className="h-32 w-32 border-[6px] border-white shadow-2xl">
                 <AvatarImage src={profile.avatar_url} />
                 <AvatarFallback className="bg-[#37371f] text-white text-4xl font-black">
                    {profile.full_name?.charAt(0).toUpperCase()}
                 </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center md:text-left space-y-2">
                 <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                    <h1 className="text-4xl font-black tracking-tight text-foreground">{profile.full_name}</h1>
                    <Badge className="bg-[#10b981]/10 text-[#10b981] hover:bg-[#10b981]/20 border-none font-bold uppercase tracking-wider text-[10px] py-1 px-3">
                        <ShieldCheck size={12} className="mr-1" /> Membru Verificat
                    </Badge>
                 </div>
                 
                 <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-muted-foreground font-semibold text-sm">
                    <span className="flex items-center gap-1.5"><Calendar size={16} className="text-muted-foreground/50" /> Pe Troky din {joinDate}</span>
                    <span className="flex items-center gap-1.5"><Package size={16} className="text-muted-foreground/50" /> {listings?.length || 0} anunțuri active</span>
                 </div>
              </div>

              <div className="flex gap-3">
                 <Button className="rounded-2xl h-12 px-8 bg-[#37371f] hover:bg-black font-bold shadow-xl transition-all">
                    Urmărește
                 </Button>
              </div>
           </div>
        </Card>

        {/* LISTINGS GRID */}
        <div className="space-y-8">
           <div className="flex items-center justify-between px-2">
              <h2 className="text-2xl font-black uppercase tracking-tight">Vitrinuța lui {profile.full_name?.split(' ')[0]}</h2>
              <div className="h-px flex-1 bg-border/40 mx-8 hidden sm:block" />
           </div>

           {listings && listings.length > 0 ? (
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {listings.map((item: any) => (
                  <Link key={item.id} href={`/listing/${item.id}`} className="group group-hover:scale-[1.02] transition-all">
                    <Card className="border-border shadow-lg rounded-[2rem] overflow-hidden bg-white hover:shadow-2xl transition-all">
                       <div className="aspect-square relative overflow-hidden">
                          <img 
                            src={item.listing_images?.find((img: any) => img.is_primary)?.image_url || item.listing_images?.[0]?.image_url || '/placeholder.jpg'} 
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute top-4 left-4">
                             <Badge className="bg-white/90 backdrop-blur-md text-foreground border-none font-black text-[9px] uppercase tracking-widest shadow-sm">
                                {item.tip_anunt}
                             </Badge>
                          </div>
                       </div>
                       <div className="p-5 space-y-1">
                          <h3 className="font-bold text-sm text-foreground leading-tight truncate">{item.title}</h3>
                          <div className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground uppercase opacity-60">
                             <MapPin size={10} /> {item.location}
                          </div>
                       </div>
                    </Card>
                  </Link>
                ))}
             </div>
           ) : (
             <div className="py-20 text-center opacity-30 italic font-medium">
                {profile.full_name} nu are niciun anunț activ momentan.
             </div>
           )}
        </div>

      </div>
    </div>
  )
}
