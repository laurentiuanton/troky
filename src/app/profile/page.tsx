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
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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

  try {
    // 1. Fetch Basic Data
    const { data: myListings } = await supabase.from('listings').select('*, listing_images(image_url, is_primary)').eq('user_id', user.id).order('created_at', { ascending: false })
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
    
    // FETCH UNREAD COUNT SAFELY
    let unreadCount = 0;
    try {
      const { count } = await supabase.from('messages').select('*', { count: 'exact', head: true }).eq('receiver_id', user.id).eq('read_state', false)
      unreadCount = count || 0
    } catch (e) { console.error('Unread count fetch error:', e) }

    // 2. Fetch Conversations (Simple Query)
    let conversations: any[] = []
    if (activeTab === 'mesaje') {
      const { data: rawMessages } = await supabase.from('messages').select('*').or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`).order('created_at', { ascending: false })
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
              listing_id: msg.listing_id, listing_title: l?.title || 'Anunț', other_user_id: otherId, other_user_name: p?.full_name || 'Utilizator', last_message: msg.content, last_date: msg.created_at
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
            <p className="text-muted-foreground font-semibold flex items-center justify-center md:justify-start gap-2 uppercase tracking-widest text-xs">
              <ShieldCheck size={14} className="text-[#10b981]" /> {user.email}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-3 space-y-2">
              <Card className="border-border shadow-2xl rounded-3xl overflow-hidden p-2 bg-white">
                  <nav className="flex flex-col gap-1">
                      <SidebarLink href="/profile?tab=anunturi" icon={<Package size={18} />} label="Anunțuri" count={myListings?.length} isActive={activeTab === 'anunturi'} />
                      <SidebarLink href="/profile?tab=mesaje" icon={<MessageSquare size={18} />} label="Mesaje" isActive={activeTab === 'mesaje'} customBadge={<MessagesBadge userId={user.id} initialCount={unreadCount} />} />
                      <SidebarLink href="/profile?tab=setari" icon={<Settings size={18} />} label="Setări" isActive={activeTab === 'setari'} />
                  </nav>
                  <Separator className="my-2 bg-border/40" />
                  <form action={logout}><Button type="submit" variant="ghost" className="w-full justify-start text-destructive font-bold gap-3 px-4 py-6 rounded-2xl"><LogOut size={18} /> Deconectare</Button></form>
              </Card>
          </div>
          <div className="lg:col-span-9">
             {activeTab === 'anunturi' && (
               <div className="grid grid-cols-1 gap-4">
                 {myListings?.map((listing: any) => (
                   <Card key={listing.id} className="border-border rounded-3xl p-4 flex gap-4 bg-white/50 backdrop-blur-sm">
                      <img src={listing.listing_images?.[0]?.image_url || '/placeholder-item.jpg'} alt="" className="w-24 h-24 rounded-2xl object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                         <h3 className="text-lg font-black truncate">{listing.title}</h3>
                         <p className="text-xs text-muted-foreground mb-4 uppercase font-bold">{listing.location}</p>
                         <div className="flex gap-2">
                            <Button asChild variant="outline" size="sm" className="rounded-lg h-8"><Link href={`/listing/${listing.id}`}>Vezi</Link></Button>
                            <Button asChild variant="outline" size="sm" className="rounded-lg h-8"><Link href={`/edit/${listing.id}`}>Edit</Link></Button>
                         </div>
                      </div>
                   </Card>
                 ))}
               </div>
             )}
             {activeTab === 'mesaje' && <ChatContainer currentUser={user} initialConversations={conversations} />}
             {activeTab === 'setari' && <div className="space-y-6"><Card className="p-8 rounded-3xl"><h3 className="font-bold mb-4">Profilul tău</h3><p>Email: {user.email}</p></Card><Card className="p-8 rounded-3xl"><ClientPasswordUpdate /></Card></div>}
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('SERVER COMPONENT CRASH:', error)
    return <div className="p-20 text-center font-black">ECHIPĂ TEHNICĂ: EROARE RENDERING PROFIL</div>
  }
}

function SidebarLink({ href, icon, label, count, isActive, customBadge }: { href: string, icon: any, label: string, count?: number, isActive: boolean, customBadge?: React.ReactNode }) {
    return (
        <Button asChild variant="ghost" className={cn("w-full justify-start font-bold gap-3 px-4 py-6 rounded-2xl", isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted")}>
            <Link href={href} className="w-full flex items-center gap-3">
                {icon} <span className="flex-1 text-left">{label}</span>
                {customBadge ? customBadge : (count !== undefined && <Badge className="ml-auto">{count}</Badge>)}
            </Link>
        </Button>
    )
}
