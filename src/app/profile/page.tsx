import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Package, MessageSquare, Settings, LogOut, MapPin, ShieldCheck, User as UserIcon } from 'lucide-react'
import { logout } from '@/app/login/actions'
import { Button } from "@/components/ui/button"
import { MessagesBadge } from '@/components/MessagesBadge' 
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
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
  const { count } = await supabase.from('messages').select('*', { count: 'exact', head: true }).eq('receiver_id', user.id).eq('read_state', false)
  unreadCount = count || 0

  return (
    <div className="container max-w-7xl py-12 px-4 animate-fade-in relative z-10">
      
      {/* HEADER SECTION */}
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
        
        {/* SIDEBAR */}
        <div className="lg:col-span-3 space-y-2">
            <Card className="border-border shadow-2xl rounded-3xl overflow-hidden p-2 bg-white">
                <nav className="flex flex-col gap-1">
                    <SidebarLink href="/profile?tab=anunturi" icon={<Package size={18} />} label="Anunțurile Mele" isActive={activeTab === 'anunturi'} />
                    <SidebarLink 
                        href="/profile?tab=mesaje" 
                        icon={<MessageSquare size={18} />} 
                        label="Mesaje" 
                        isActive={activeTab === 'mesaje'} 
                        customBadge={<MessagesBadge userId={user.id} initialCount={unreadCount} />}
                    />
                    <SidebarLink href="/profile?tab=setari" icon={<Settings size={18} />} label="Setările Contului" isActive={activeTab === 'setari'} />
                </nav>
                <Separator className="my-2 bg-border/40" />
                <form action={logout}>
                    <Button type="submit" variant="ghost" className="w-full justify-start text-destructive font-bold gap-3 px-4 py-4 rounded-2xl">
                        <LogOut size={18} /> Deconectare
                    </Button>
                </form>
            </Card>
        </div>

        {/* CONTENT */}
        <div className="lg:col-span-9">
           {activeTab === 'anunturi' && (
             <div className="space-y-6">
                <h2 className="text-2xl font-black uppercase px-2">Anunțurile tale ({myListings?.length || 0})</h2>
                <div className="grid grid-cols-1 gap-4">
                  {myListings?.map((listing: any) => (
                    <Card key={listing.id} className="border-border rounded-3xl p-4 flex gap-4 bg-white/50 backdrop-blur-sm transition-all hover:bg-white">
                       <img src={listing.listing_images?.[0]?.image_url || '/placeholder-item.jpg'} alt="" className="w-24 h-24 rounded-2xl object-cover shrink-0" />
                       <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <h3 className="text-lg font-black truncate">{listing.title}</h3>
                          <p className="text-xs text-muted-foreground mb-4 uppercase font-bold flex items-center gap-1"><MapPin size={12} /> {listing.location}</p>
                          <div className="flex gap-2">
                             <Button asChild variant="outline" size="sm" className="rounded-lg h-8 text-[10px] font-black uppercase tracking-widest"><Link href={`/listing/${listing.id}`}>Vezi Anunț</Link></Button>
                          </div>
                       </div>
                    </Card>
                  ))}
                </div>
             </div>
           )}

           {activeTab === 'mesaje' && (
             <div className="p-20 text-center border-2 border-dashed rounded-3xl text-muted-foreground font-bold">
               MODUL MESAJE ÎN RECONSTRUCȚIE...
             </div>
           )}

           {activeTab === 'setari' && (
             <div className="p-20 text-center border-2 border-dashed rounded-3xl text-muted-foreground font-bold">
               SETĂRI ÎN RECONSTRUCȚIE...
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
            isActive ? "bg-[#10b981]/10 text-[#10b981] shadow-sm" : "text-muted-foreground hover:bg-muted"
        )}>
            <Link href={href} className="w-full flex items-center gap-3">
                {icon} <span className="flex-1 text-left">{label}</span>
                {customBadge}
            </Link>
        </Button>
    )
}
