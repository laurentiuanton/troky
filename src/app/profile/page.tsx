import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Package, MessageSquare, Settings, LogOut, MapPin, ShieldCheck, Eye, Edit, Trash2, ArrowRight, Sparkles, User as UserIcon } from 'lucide-react'
import { logout } from '@/app/login/actions'
import { Button } from "@/components/ui/button"
import { MessagesBadge } from '@/components/MessagesBadge' 
import { Badge } from "@/components/ui/badge"
import { ClientPasswordUpdate } from './ClientPasswordUpdate'
import ChatContainer from './ChatContainer'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { cn } from '@/lib/utils'

export const revalidate = 0;

export default async function ProfilePage(props: { searchParams: Promise<{ tab?: string }> }) {
  const searchParams = await props.searchParams
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const activeTab = searchParams.tab || 'anunturi'

  // Fetch initial safe data
  const { data: myListings } = await supabase.from('listings').select('*, listing_images(image_url, is_primary)').eq('user_id', user.id).order('created_at', { ascending: false })
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()

  // Fetch Unread Count Safely
  let unreadCount = 0
  try {
    const { count } = await supabase.from('messages').select('*', { count: 'exact', head: true }).eq('receiver_id', user.id).eq('read_state', false)
    unreadCount = count || 0
  } catch (e) {
    console.error('Error fetching unread count:', e)
  }

  // Fetch Conversations (Zero-Join Strategy)
  let conversations: any[] = []
  if (activeTab === 'mesaje') {
    const { data: rawMessages } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false })

    if (rawMessages && rawMessages.length > 0) {
      const convMap = new Map()
      const otherUserIds = Array.from(new Set(rawMessages.map((m: any) => m.sender_id === user.id ? m.receiver_id : m.sender_id)))
      const listingIds = Array.from(new Set(rawMessages.map((m: any) => m.listing_id)))

      const { data: profiles } = await supabase.from('profiles').select('id, full_name, username').in('id', otherUserIds)
      const { data: listings } = await supabase.from('listings').select('id, title').in('id', listingIds)

      rawMessages.forEach((msg: any) => {
        const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id
        const convKey = `${msg.listing_id}-${otherId}`
        if (!convMap.has(convKey)) {
          const p = profiles?.find((p: any) => p.id === otherId)
          const l = listings?.find((l: any) => l.id === msg.listing_id)
          convMap.set(convKey, {
            listing_id: msg.listing_id,
            listing_title: l?.title || 'Anunț Troky',
            other_user_id: otherId,
            other_user_name: p?.full_name || 'Utilizator',
            last_message: msg.content,
            last_date: msg.created_at
          })
        }
      })
      conversations = Array.from(convMap.values())
    }
  }

  return (
    <div className="container max-w-7xl py-12 md:py-20 px-4 animate-fade-in relative z-10">
      
      {/* HEADER DASHBOARD */}
      <div className="flex flex-col md:flex-row items-center gap-8 mb-16 text-center md:text-left bg-white/40 backdrop-blur-xl p-10 rounded-[3rem] border border-white/60 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.06)] relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:rotate-12 transition-transform duration-1000">
            <Sparkles size={120} className="text-secondary" />
        </div>
        
        <Avatar className="h-32 w-32 border-[6px] border-white shadow-2xl relative z-10">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback className="bg-primary text-white text-4xl font-black italic">
                {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
            </AvatarFallback>
        </Avatar>
        
        <div className="space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary/10 rounded-full text-secondary font-black text-[9px] uppercase tracking-[0.2em] mb-1">
             <ShieldCheck size={12} /> Comunitate Verificată
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-primary italic tracking-tighter italic">Salut, {profile?.full_name?.split(' ')[0] || 'Utilizator'}!</h1>
          <p className="text-muted-foreground font-black flex items-center justify-center md:justify-start gap-3 uppercase tracking-[0.2em] text-[10px]">
            <span className="opacity-40">Identitate:</span> <span className="text-primary">{user.email}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-14">
        
        {/* SIDEBAR NAVIGATION */}
        <div className="lg:col-span-3 space-y-4">
            <Card className="glass-card border-none shadow-xl rounded-[2.5rem] overflow-hidden p-3">
                <nav className="flex flex-col gap-2">
                    <SidebarLink href="/profile?tab=anunturi" icon={<Package size={20} />} label="Anunțuri" isActive={activeTab === 'anunturi'} />
                    <SidebarLink 
                        href="/profile?tab=mesaje" 
                        icon={<MessageSquare size={20} />} 
                        label="Mesaje" 
                        isActive={activeTab === 'mesaje'} 
                        customBadge={unreadCount > 0 ? <div className="ml-auto bg-destructive text-white text-[9px] font-black w-6 h-6 rounded-full flex items-center justify-center shadow-lg animate-pulse">{unreadCount}</div> : null}
                    />
                    <SidebarLink href="/profile?tab=setari" icon={<Settings size={20} />} label="Setări" isActive={activeTab === 'setari'} />
                </nav>
                <Separator className="my-4 bg-border/40" />
                <form action={logout}>
                    <Button type="submit" variant="ghost" className="w-full justify-start text-destructive font-black text-[10px] uppercase tracking-[0.2em] gap-4 px-6 py-8 rounded-[1.5rem] hover:bg-destructive/5 transition-all">
                        <LogOut size={20} /> Deconectare
                    </Button>
                </form>
            </Card>

            <Card className="bg-secondary p-8 rounded-[2rem] text-white shadow-2xl shadow-secondary/20 relative overflow-hidden group">
                <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                    <Sparkles size={100} />
                </div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 opacity-70 italic">Troky Insight</h4>
                <p className="text-xs font-bold leading-relaxed">„Prin fiecare troc pe care îl faci, contribui la o lume mai sustenabilă.”</p>
            </Card>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="lg:col-span-9 min-h-[600px]">
           {activeTab === 'anunturi' && (
             <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
                <div className="flex items-center justify-between px-4">
                    <h2 className="text-2xl font-black uppercase tracking-tight text-primary italic">Anunțurile Tale <span className="text-secondary tracking-normal not-italic text-sm ml-2 bg-secondary/10 px-3 py-1 rounded-full">{myListings?.length || 0}</span></h2>
                    <Button asChild className="rounded-2xl bg-primary font-black uppercase tracking-widest text-[9px] px-8 hover-scale">
                        <Link href="/add">+ Adaugă Nou</Link>
                    </Button>
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                  {myListings && myListings.length > 0 ? myListings.map((listing: any) => (
                    <Card key={listing.id} className="border-none rounded-[2.5rem] overflow-hidden p-0 flex flex-col md:flex-row bg-white/70 backdrop-blur-sm transition-all hover:bg-white shadow-[0_20px_50px_rgba(0,0,0,0.04)] group animate-in zoom-in-95 duration-500">
                       <div className="w-full md:w-[260px] aspect-[4/3] md:aspect-auto relative shrink-0 overflow-hidden">
                          <img src={listing.listing_images?.[0]?.image_url || '/placeholder-item.jpg'} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                       </div>
                       <div className="p-8 flex-1 min-w-0 flex flex-col justify-center gap-6">
                          <div>
                            <h3 className="text-2xl font-black text-primary truncate mb-2 italic group-hover:text-secondary transition-colors">{listing.title}</h3>
                            <div className="flex items-center gap-2 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-40">
                               <MapPin size={12} className="text-accent" /> {listing.location}
                            </div>
                          </div>
                          <div className="flex gap-3">
                             <Button asChild variant="outline" className="rounded-2xl h-12 border-border/60 font-black text-[9px] uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-all shadow-sm"><Link href={`/listing/${listing.id}`}><Eye size={16} className="mr-3" /> Detalii</Link></Button>
                             <Button asChild variant="outline" className="rounded-2xl h-12 border-border/60 font-black text-[9px] uppercase tracking-[0.2em] hover:bg-secondary hover:text-white transition-all shadow-sm"><Link href={`/edit/${listing.id}`}><Edit size={16} className="mr-3" /> Editare</Link></Button>
                             <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl text-destructive/40 hover:text-destructive hover:bg-destructive/5 ml-auto">
                                <Trash2 size={20} />
                             </Button>
                          </div>
                       </div>
                    </Card>
                  )) : (
                    <div className="py-24 text-center opacity-40">
                        <Package size={64} className="mx-auto mb-6 text-muted-foreground/30" />
                        <p className="text-lg font-black italic uppercase tracking-widest text-primary">Nu ai postat niciun anunț încă</p>
                    </div>
                  )}
                </div>
             </div>
           )}

           {activeTab === 'mesaje' && (
              <div className="animate-in fade-in slide-in-from-right-8 duration-700 h-full">
                 <div className="flex items-center justify-between px-4 mb-8">
                    <h2 className="text-2xl font-black uppercase tracking-tight text-primary italic">Conversații Active <span className="text-secondary tracking-normal not-italic text-sm ml-2 bg-secondary/10 px-3 py-1 rounded-full">{conversations.length}</span></h2>
                 </div>
                 <ChatContainer currentUser={user} initialConversations={conversations} />
              </div>
           )}

           {activeTab === 'setari' && (
             <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-700">
               <Card className="border-none shadow-xl rounded-[3rem] overflow-hidden bg-white/70 backdrop-blur-xl">
                  <CardHeader className="bg-muted/5 border-b border-border/40 p-10">
                     <CardTitle className="text-xl font-black uppercase tracking-[0.2em] text-primary italic">Informații Cont</CardTitle>
                     <CardDescription className="italic font-bold text-muted-foreground mt-2">Personalizează modul în care apari pe platforma Troky.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-10 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                           <Label className="text-[10px] font-black uppercase tracking-[0.2em] ml-2 text-muted-foreground/60">Identitate (E-mail)</Label>
                           <Input defaultValue={user.email} disabled className="premium-input h-14 rounded-2xl bg-white/50 border-transparent shadow-inner font-bold opacity-60 cursor-not-allowed" />
                        </div>
                        <div className="space-y-3">
                           <Label className="text-[10px] font-black uppercase tracking-[0.2em] ml-2 text-muted-foreground/60">Alias (Nume Afișat)</Label>
                           <Input defaultValue={profile?.full_name || ''} disabled className="premium-input h-14 rounded-2xl bg-white/50 border-transparent shadow-inner font-bold opacity-60 cursor-not-allowed" />
                        </div>
                    </div>
                  </CardContent>
               </Card>

               <Card className="border-none shadow-xl rounded-[3rem] overflow-hidden bg-white/70 backdrop-blur-xl">
                  <CardHeader className="bg-destructive/5 border-b border-border/40 p-10">
                     <CardTitle className="text-xl font-black uppercase tracking-[0.2em] text-destructive italic">Securitate</CardTitle>
                     <CardDescription className="italic font-bold text-muted-foreground mt-2">Schimbă parola contului tău pentru o protecție sporită.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-10">
                    <ClientPasswordUpdate />
                  </CardContent>
               </Card>
             </div>
           )}
        </div>
      </div>
    </div>
  )
}

function SidebarLink({ href, icon, label, isActive, customBadge }: { href: string, icon: any, label: string, isActive: boolean, customBadge?: React.ReactNode }) {
    return (
        <Button asChild variant="ghost" className={cn(
            "w-full justify-start font-black text-[10px] uppercase tracking-[0.2em] h-16 gap-5 px-8 rounded-2xl transition-all relative overflow-hidden group",
            isActive ? "bg-white text-secondary shadow-[0_8px_24px_rgba(0,0,0,0.06)]" : "text-primary/60 hover:bg-white/50 hover:text-secondary"
        )}>
            <Link href={href} className="w-full flex items-center gap-5">
                <span className={cn("transition-transform duration-500 group-hover:scale-110", isActive ? "text-secondary" : "text-muted-foreground")}>{icon}</span>
                <span className="flex-1 text-left">{label}</span>
                {customBadge}
                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-secondary rounded-full" />}
            </Link>
        </Button>
    )
}
