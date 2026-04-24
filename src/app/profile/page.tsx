import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Package, MessageSquare, Settings, LogOut, Edit, Trash2, Eye, MapPin, Clock, User as UserIcon, ShieldCheck } from 'lucide-react'
import { logout } from '@/app/login/actions'
import { deleteListing } from './actions'
import { ClientPasswordUpdate } from './ClientPasswordUpdate'
import ChatContainer from './ChatContainer'
import { MessagesBadge } from '@/components/MessagesBadge'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export const revalidate = 0;

export default async function ProfilePage(props: { searchParams: Promise<{ tab?: string }> }) {
  const searchParams = await props.searchParams
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const activeTab = searchParams.tab || 'anunturi'

  // 1. Fetch Listings
  const { data: myListings } = await supabase
    .from('listings')
    .select('*, listing_images(image_url, is_primary)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // 2. Fetch Profile Safely
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle() // Previne crash-ul dacă profilul lipsește

  // 3. Fetch Unread Count
  const { count: unreadCount } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('receiver_id', user.id)
    .eq('read_state', false)

  // 4. Fetch Conversations if on message tab
  let conversations: any[] = []
  if (activeTab === 'mesaje') {
    const { data: allUserMessages } = await supabase
      .from('messages')
      .select(`
        *,
        listings(title, id),
        sender:profiles!sender_id(full_name, id),
        receiver:profiles!receiver_id(full_name, id)
      `)
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false })

    if (allUserMessages) {
      const convMap = new Map()
      allUserMessages.forEach((msg: any) => {
        const otherUser = msg.sender_id === user.id ? msg.receiver : msg.sender
        if (!otherUser) return;
        
        const convKey = `${msg.listing_id}-${otherUser.id}`
        if (!convMap.has(convKey)) {
          convMap.set(convKey, {
            listing_id: msg.listing_id,
            listing_title: msg.listings?.title || 'Anunț Troky',
            other_user_id: otherUser.id,
            other_user_name: otherUser.full_name || 'Utilizator',
            last_message: msg.content || '📷 Imagine',
            last_date: msg.created_at
          })
        }
      })
      conversations = Array.from(convMap.values())
    }
  }

  return (
    <div className="container max-w-7xl py-12 px-4 animate-fade-in relative z-10">
      
      <div className="flex flex-col md:flex-row items-center gap-6 mb-12 text-center md:text-left">
        <Avatar className="h-24 w-24 border-4 border-white shadow-xl">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback className="bg-[#10b981] text-white text-3xl font-black">
                {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
            </AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-foreground">
            Salut, {profile?.full_name?.split(' ')[0] || 'Utilizator'}!
          </h1>
          <p className="text-muted-foreground font-semibold flex items-center justify-center md:justify-start gap-2 uppercase tracking-widest text-xs">
            <ShieldCheck size={14} className="text-[#10b981]" /> {user.email} &bull; Membru din {profile?.created_at ? new Date(profile.created_at).getFullYear() : new Date().getFullYear()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-3 space-y-2">
            <Card className="border-border shadow-2xl shadow-black/5 rounded-3xl overflow-hidden p-2">
                <nav className="flex flex-col gap-1">
                    <SidebarLink href="/profile?tab=anunturi" icon={<Package size={18} />} label="Anunțuri" count={myListings?.length} isActive={activeTab === 'anunturi'} />
                    <SidebarLink 
                        href="/profile?tab=mesaje" 
                        icon={<MessageSquare size={18} />} 
                        label="Mesaje" 
                        isActive={activeTab === 'mesaje'} 
                        customBadge={<MessagesBadge userId={user.id} initialCount={unreadCount || 0} />}
                    />
                    <SidebarLink href="/profile?tab=setari" icon={<Settings size={18} />} label="Setări Cont" isActive={activeTab === 'setari'} />
                </nav>
                <Separator className="my-2 bg-border/40" />
                <form action={logout}>
                    <Button type="submit" variant="ghost" className="w-full justify-start text-destructive hover:bg-destructive/10 font-bold gap-3 px-4 py-6 rounded-2xl">
                        <LogOut size={18} /> Deconectare
                    </Button>
                </form>
            </Card>
        </div>

        <div className="lg:col-span-9">
           {activeTab === 'anunturi' && (
             <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-2xl font-black tracking-tight uppercase">Anunțurile tale</h2>
                    <Button asChild size="sm" className="bg-[#10b981] hover:bg-[#0d9668] rounded-full font-bold"><Link href="/add">Adaugă Nou</Link></Button>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {myListings?.map((listing: any) => {
                    const primaryImg = listing.listing_images?.find((i:any) => i.is_primary)?.image_url || listing.listing_images?.[0]?.image_url || '/placeholder-item.jpg';
                    return (
                      <Card key={listing.id} className="hover-lift border-border overflow-hidden bg-white/50 backdrop-blur-sm rounded-3xl transition-all p-0 flex flex-col sm:flex-row h-full">
                          <div className="w-full sm:w-[200px] h-[160px] relative overflow-hidden flex-shrink-0">
                              <img src={primaryImg} alt={listing.title} className="w-full h-full object-cover" />
                              <Badge className="absolute top-2 left-2 font-black text-[9px] uppercase">{listing.is_active ? 'Activ' : 'Inactiv'}</Badge>
                          </div>
                          <div className="p-6 flex flex-1 flex-col justify-center">
                              <h3 className="text-xl font-black text-foreground mb-1 leading-tight">{listing.title}</h3>
                              <div className="flex items-center gap-3 text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">
                                  <MapPin size={12} className="text-[#ea9010]" /> {listing.location}
                              </div>
                              <div className="flex flex-wrap gap-2">
                                  <Button asChild variant="outline" size="sm" className="h-8 rounded-lg font-bold"><Link href={`/listing/${listing.id}`}><Eye size={14} className="mr-2" /> Vezi</Link></Button>
                                  <Button asChild variant="outline" size="sm" className="h-8 rounded-lg font-bold"><Link href={`/edit/${listing.id}`}><Edit size={14} className="mr-2" /> Editează</Link></Button>
                                  <form action={deleteListing.bind(null, listing.id)}><Button type="submit" variant="ghost" size="sm" className="h-8 rounded-lg font-bold text-destructive"><Trash2 size={14} className="mr-2" /> Șterge</Button></form>
                              </div>
                          </div>
                      </Card>
                    )
                  })}
                </div>
             </div>
           )}

           {activeTab === 'mesaje' && (
             <div className="space-y-6">
                <h2 className="text-2xl font-black tracking-tight uppercase px-2 mb-6">Conversațiile Tale</h2>
                <ChatContainer currentUser={user} initialConversations={conversations} />
             </div>
           )}

           {activeTab === 'setari' && (
             <div className="space-y-8 animate-in fade-in duration-500">
               <Card className="border-border rounded-3xl overflow-hidden shadow-2xl shadow-black/5 p-8 space-y-6">
                  <h3 className="text-xl font-black uppercase tracking-tight">Informații Cont</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <Label className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground">Nume</Label>
                         <Input defaultValue={profile?.full_name || ''} disabled className="h-12 rounded-xl bg-muted/10 opacity-70 font-bold" />
                      </div>
                      <div className="space-y-2">
                         <Label className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground">E-mail</Label>
                         <Input defaultValue={user.email} disabled className="h-12 rounded-xl bg-muted/10 opacity-70 font-bold" />
                      </div>
                  </div>
               </Card>
               <Card className="border-border rounded-3xl overflow-hidden shadow-2xl shadow-black/5 p-8">
                  <ClientPasswordUpdate />
               </Card>
             </div>
           )}
        </div>
      </div>
    </div>
  )
}

function SidebarLink({ href, icon, label, count, isActive, customBadge }: { href: string, icon: any, label: string, count?: number, isActive: boolean, customBadge?: React.ReactNode }) {
    return (
        <Button asChild variant="ghost" className={`w-full justify-start font-bold gap-3 px-4 py-6 rounded-2xl transition-all ${
            isActive ? 'bg-[#10b981]/10 text-[#10b981] shadow-sm' : 'text-foreground/70 hover:bg-muted/50'
        }`}>
            <Link href={href} className="w-full flex items-center gap-3">
                {icon}
                <span className="flex-1 text-left">{label}</span>
                {customBadge ? customBadge : (count !== undefined && <Badge className="ml-auto bg-muted font-black text-[10px]">{count}</Badge>)}
            </Link>
        </Button>
    )
}
