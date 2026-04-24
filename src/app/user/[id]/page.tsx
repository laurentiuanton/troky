import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MapPin, ShieldCheck, Package, Clock, Calendar, Sparkles, ArrowRight, User as UserIcon } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { FollowButton } from "../FollowButton"
import { cn } from "@/lib/utils"

export default async function PublicProfilePage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user: currentUser } } = await supabase.auth.getUser()

  // 1. Fetch User Profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (!profile) return notFound()

  // 2. Fetch Follow status
  let isFollowing = false
  if (currentUser) {
    const { data: followData } = await supabase
      .from('followers')
      .select('*')
      .eq('follower_id', currentUser.id)
      .eq('following_id', id)
      .maybeSingle()
    isFollowing = !!followData
  }

  // 3. Fetch User Listings
  const { data: listings } = await supabase
    .from('listings')
    .select('*, listing_images(image_url, is_primary)')
    .eq('user_id', id)
    .order('created_at', { ascending: false })

  const joinDate = new Date(profile.created_at).toLocaleDateString('ro-RO', { year: 'numeric', month: 'long' })

  return (
    <div className="min-h-screen pb-24">
      <div className="container max-w-6xl py-16 md:py-24 px-4 space-y-20">
        
        {/* PROFILE HEADER CARD */}
        <Card className="border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.12)] rounded-[3rem] overflow-hidden bg-white/70 backdrop-blur-xl p-10 md:p-16 relative group">
           <div className="absolute top-0 right-0 p-16 opacity-[0.03] group-hover:rotate-12 transition-transform duration-1000">
                <UserIcon size={180} className="text-secondary" />
           </div>
           
           <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end gap-10">
              <Avatar className="h-40 w-40 border-[8px] border-white shadow-2xl rounded-[2.5rem]">
                 <AvatarImage src={profile.avatar_url} />
                 <AvatarFallback className="bg-primary text-white text-5xl font-black italic">
                    {profile.full_name?.charAt(0).toUpperCase()}
                 </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center md:text-left space-y-4">
                 <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                    <h1 className="text-5xl font-black tracking-tighter text-primary italic">{profile.full_name}</h1>
                    <div className="bg-secondary/10 text-secondary px-4 py-1.5 rounded-full font-black uppercase tracking-[0.2em] text-[9px] flex items-center gap-2">
                        <ShieldCheck size={14} /> Membru Verificat
                    </div>
                 </div>
                 
                 <div className="flex flex-wrap items-center justify-center md:justify-start gap-8 text-muted-foreground/60 font-black text-[10px] uppercase tracking-[0.3em]">
                    <span className="flex items-center gap-3"><Calendar size={18} className="text-secondary" /> Din {joinDate}</span>
                    <span className="flex items-center gap-3"><Package size={18} className="text-accent" /> {listings?.length || 0} anunțuri active</span>
                 </div>
              </div>

              <div className="pt-4 md:pt-0">
                 <FollowButton 
                    followingId={id} 
                    isInitialFollowing={isFollowing} 
                    currentUserId={currentUser?.id} 
                 />
              </div>
           </div>
        </Card>

        {/* LISTINGS GRID */}
        <div className="space-y-12">
           <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-4">
              <div className="space-y-2 text-center md:text-left">
                  <h2 className="text-3xl font-black uppercase tracking-tight text-primary italic">Vitrinuța lui {profile.full_name?.split(' ')[0]}</h2>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-40">Produse disponibile pentru barter</p>
              </div>
              <div className="h-px flex-1 bg-border/20 mx-10 hidden lg:block" />
              <div className="flex items-center gap-2 bg-muted/30 px-4 py-2 rounded-2xl">
                 <Sparkles size={16} className="text-secondary" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-primary opacity-60">Cele mai recente</span>
              </div>
           </div>

           {listings && listings.length > 0 ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-10 px-2">
                {listings.map((item: any) => (
                  <Link key={item.id} href={`/listing/${item.id}`} className="group animate-in zoom-in-95 duration-500">
                    <Card className="border-none shadow-[0_20px_50px_rgba(0,0,0,0.04)] rounded-[2.5rem] overflow-hidden bg-white/70 backdrop-blur-sm hover:bg-white hover:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] transition-all h-full flex flex-col">
                       <div className="aspect-square relative overflow-hidden bg-muted/10">
                          <img 
                            src={item.listing_images?.find((img: any) => img.is_primary)?.image_url || item.listing_images?.[0]?.image_url || '/placeholder.jpg'} 
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute top-5 left-5">
                             <div className="bg-white/90 backdrop-blur-md text-primary px-4 py-2 rounded-2xl font-black text-[9px] uppercase tracking-widest shadow-sm">
                                {item.tip_anunt}
                             </div>
                          </div>
                       </div>
                       <div className="p-8 space-y-4 flex flex-col flex-1">
                          <h3 className="font-black text-xl text-primary leading-tight italic truncate group-hover:text-secondary transition-colors">{item.title}</h3>
                          <div className="mt-auto pt-4 border-t border-border/40 flex items-center justify-between text-[9px] font-black text-muted-foreground/60 uppercase tracking-[0.2em]">
                             <div className="flex items-center gap-2">
                                <MapPin size={12} className="text-accent" /> {item.location}
                             </div>
                             <div className="w-8 h-8 rounded-xl bg-muted/20 flex items-center justify-center text-primary group-hover:bg-secondary group-hover:text-white transition-all">
                                <ArrowRight size={14} />
                             </div>
                          </div>
                       </div>
                    </Card>
                  </Link>
                ))}
             </div>
           ) : (
             <div className="py-32 text-center flex flex-col items-center gap-8 opacity-40">
                <Package size={64} className="text-muted-foreground/20" />
                <p className="text-lg font-black italic uppercase tracking-[0.2em] text-primary">Nu sunt anunțuri active momentan</p>
             </div>
           )}
        </div>

      </div>
    </div>
  )
}
