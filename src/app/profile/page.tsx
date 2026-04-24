import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Package, MessageSquare, Settings, LogOut, MapPin, ShieldCheck, Eye, Edit, Trash2 } from 'lucide-react'
import { logout } from '@/app/login/actions'
import { Button } from "@/components/ui/button"
import { MessagesBadge } from '@/components/MessagesBadge' 
import { Badge } from "@/components/ui/badge"
import { ClientPasswordUpdate } from './ClientPasswordUpdate'
import ChatContainer from './ChatContainer'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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

      const { data: profiles } = await supabase.from('profiles').select('id, full_name').in('id', otherUserIds)
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
    <div className="container max-w-7xl py-12 px-4 animate-fade-in relative z-10">
      
      <div className="flex flex-col md:flex-row items-center gap-6 mb-12 text-center md:text-left">
        <Avatar className="h-24 w-24 border-4 border-white shadow-xl">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback className="bg-[#10b981] text-white text-3xl font-black">
                {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
            </AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-foreground">Salut, {profile?.full_name?.split(' ')[0] || 'Utilizator'}!</h1>
          <p className="text-muted-foreground font-semibold flex items-center justify-center md:justify-start gap-2 uppercase tracking-widest text-[10px]">
            <ShieldCheck size={14} className="text-[#10b981]" /> {user.email}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <div className="lg:col-span-3 space-y-2">
            <Card className="border-border shadow-2xl rounded-3xl overflow-hidden p-2 bg-white">
                <nav className="flex flex-col gap-1">
                    <SidebarLink href="/profile?tab=anunturi" icon={<Package size={18} />} label="Anunțurile Mele" isActive={activeTab === 'anunturi'} />
                    <SidebarLink 
                        href="/profile?tab=mesaje" 
                        icon={<MessageSquare size={18} />} 
                        label="Mesaje" 
                        isActive={activeTab === 'mesaje'} 
                        customBadge={unreadCount > 0 ? <Badge variant="destructive" className="ml-auto flex h-5 w-5 items-center justify-center rounded-full p-0 text-[10px]">{unreadCount}</Badge> : null}
                    />
                    <SidebarLink href="/profile?tab=setari" icon={<Settings size={18} />} label="Setări Cont" isActive={activeTab === 'setari'} />
                </nav>
                <Separator className="my-2 bg-border/40" />
                <form action={logout}>
                    <Button type="submit" variant="ghost" className="w-full justify-start text-destructive font-bold gap-3 px-4 py-4 rounded-2xl">
                        <LogOut size={18} /> Deconectare
                    </Button>
                </form>
            </Card>
        </div>

        <div className="lg:col-span-9">
           {activeTab === 'anunturi' && (
             <div className="space-y-6">
                <h2 className="text-2xl font-black uppercase px-2 text-foreground">Anunțurile tale ({myListings?.length || 0})</h2>
                <div className="grid grid-cols-1 gap-4">
                  {myListings?.map((listing: any) => (
                    <Card key={listing.id} className="border-border rounded-[2rem] overflow-hidden p-0 flex flex-col sm:flex-row h-full bg-white/60 backdrop-blur-sm transition-all hover:bg-white shadow-xl shadow-black/5">
                       <div className="w-full sm:w-[200px] h-[160px] relative shrink-0">
                          <img src={listing.listing_images?.[0]?.image_url || '/placeholder-item.jpg'} alt="" className="w-full h-full object-cover" />
                       </div>
                       <div className="p-6 flex-1 min-w-0 flex flex-col justify-center">
                          <h3 className="text-xl font-black text-foreground truncate mb-1">{listing.title}</h3>
                          <p className="text-[10px] font-black text-muted-foreground mb-4 uppercase tracking-widest flex items-center gap-2">
                             <MapPin size={12} className="text-[#ea9010]" /> {listing.location}
                          </p>
                          <div className="flex gap-2">
                             <Button asChild variant="outline" size="sm" className="rounded-xl h-9 border-border font-bold hover:bg-muted"><Link href={`/listing/${listing.id}`}><Eye size={14} className="mr-2" /> Vezi</Link></Button>
                             <Button asChild variant="outline" size="sm" className="rounded-xl h-9 border-border font-bold hover:bg-muted"><Link href={`/edit/${listing.id}`}><Edit size={14} className="mr-2" /> Editează</Link></Button>
                          </div>
                       </div>
                    </Card>
                  ))}
                </div>
             </div>
           )}

           {activeTab === 'mesaje' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <h2 className="text-2xl font-black uppercase px-2 mb-6">Conversațiile Tale</h2>
                 <ChatContainer currentUser={user} initialConversations={conversations} />
              </div>
           )}

           {activeTab === 'setari' && (
             <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <Card className="border-border shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
                  <CardHeader className="bg-muted/10 border-b border-border/50 p-8">
                     <CardTitle className="text-xl font-black uppercase tracking-tight">Informații Profil</CardTitle>
                     <CardDescription className="italic font-semibold">Gestionează datele contului tău Troky.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <Label className="text-[10px] font-black uppercase tracking-widest ml-1">E-mail (Login)</Label>
                           <Input defaultValue={user.email} disabled className="h-12 rounded-xl bg-muted/20 border-none font-bold opacity-70" />
                        </div>
                        <div className="space-y-2">
                           <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Nume Afișat</Label>
                           <Input defaultValue={profile?.full_name || ''} disabled className="h-12 rounded-xl bg-muted/20 border-none font-bold opacity-70" />
                        </div>
                    </div>
                  </CardContent>
               </Card>

               <Card className="border-border shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
                  <CardHeader className="bg-muted/10 border-b border-border/50 p-8">
                     <CardTitle className="text-xl font-black uppercase tracking-tight text-destructive">Securitate</CardTitle>
                     <CardDescription className="italic font-semibold">Schimbă parola periodic pentru a-ți proteja contul.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8">
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
            "w-full justify-start font-bold gap-3 px-4 py-6 rounded-2xl transition-all",
            isActive ? "bg-[#10b981]/10 text-[#10b981] shadow-sm" : "text-foreground/70 hover:bg-muted"
        )}>
            <Link href={href} className="w-full flex items-center gap-3">
                {icon} <span className="flex-1 text-left">{label}</span>
                {customBadge}
            </Link>
        </Button>
    )
}
