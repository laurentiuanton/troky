import Link from 'next/link'
import { PlusCircle, RefreshCw, HeartHandshake, Search } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import HomeSearchBar from '@/components/HomeSearchBar'
import ListingCard from '@/components/ListingCard'

// Enable revalidation for dynamic content
export const revalidate = 0;

export default async function Home() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // Fetch active listings grouped by category
  const { data: listings } = await supabase
    .from('listings')
    .select('*, profiles(full_name, avatar_url), listing_images(image_url, is_primary)')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-[#fcfcf9]">
      {/* 🌟 HERO SECTION: THE HEART OF TROKY */}
      <section className="relative pt-20 pb-24 md:pt-28 md:pb-36 px-4 overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[50%] bg-[#10b981]/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[0%] right-[-5%] w-[30%] h-[40%] bg-[#ea9010]/10 blur-[100px] rounded-full" />
        
        <div className="container max-w-6xl mx-auto text-center relative z-10 space-y-8">
          <div className="space-y-4">
            <Badge className="bg-[#10b981]/10 text-[#10b981] hover:bg-[#10b981]/20 border-none font-black uppercase tracking-[0.2em] text-[10px] py-1.5 px-4 mb-4">
               Comunitatea #1 de Troc din România
            </Badge>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-foreground leading-[0.95]">
              Dăruiește. <span className="text-[#10b981]">Schimbă.</span><br/>
              Reciclează.
            </h1>
          </div>
          
          <p className="text-xl md:text-3xl text-[#37371f]/60 max-w-2xl mx-auto font-medium italic leading-snug">
            „Aici, banii n-au valoare, singura plată acceptată este <span className="text-foreground font-black underline decoration-[#ea9010] decoration-4 underline-offset-4">strângerea de mână</span>.”
          </p>

          {/* SEARCH BAR INTEGRATION */}
          <div className="max-w-3xl mx-auto pt-4">
             <HomeSearchBar />
          </div>

          {/* PRIMARY ACTIONS: PREMIUM GLASS CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto pt-10">
            {[
              { href: "/add?type=donez", label: "Donez", icon: <HeartHandshake size={32} />, color: "#10b981", bg: "bg-[#10b981]/5" },
              { href: "/add?type=schimb", label: "Schimb", icon: <RefreshCw size={32} />, color: "#3b82f6", bg: "bg-[#3b82f6]/5" },
              { href: "/add?type=vreau", label: "Vreau", icon: <Search size={32} />, color: "#facc15", bg: "bg-[#facc15]/5" }
            ].map((action) => (
              <Link 
                key={action.label}
                href={action.href} 
                className={`group relative overflow-hidden glass-panel ${action.bg} border-border/40 p-8 rounded-[2.5rem] flex flex-col items-center gap-4 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2`}
              >
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-12"
                  style={{ background: action.color, color: '#fff', boxShadow: `0 10px 25px ${action.color}44` }}
                >
                  {action.icon}
                </div>
                <h3 className="text-sm font-black uppercase tracking-[0.15em] text-foreground transition-colors group-hover:text-foreground/70">{action.label}</h3>
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                   <PlusCircle size={18} className="text-foreground/30" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 📦 LISTINGS SECTIONS */}
      <section className="container max-w-6xl mx-auto px-4 pb-32 space-y-20">
        
        {/* SECTION MAPPING */}
        {[
          { type: "donatie", title: "🎁 Cele mai noi Donații", color: "text-[#10b981]", border: "border-[#10b981]/30", link: "/search?type=donez" },
          { type: "schimb", title: "🔄 Schimburi Active", color: "text-[#3b82f6]", border: "border-[#3b82f6]/30", link: "/search?type=schimb" },
          { type: "vreau", title: "🔍 Cereri din Comunitate", color: "text-[#ea9010]", border: "border-[#ea9010]/30", link: "/search?type=vreau" }
        ].map((sec) => (
          <div key={sec.type} className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            <div className="flex items-end justify-between px-2">
              <div className="space-y-1">
                <h2 className={`text-2xl md:text-4xl font-black tracking-tight ${sec.color}`}>
                  {sec.title}
                </h2>
                <div className={`h-1 w-20 rounded-full bg-current opacity-20`} />
              </div>
              <Link 
                href={sec.link} 
                className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors py-2 px-6 border border-border/60 rounded-full flex items-center gap-2 hover:bg-white"
              >
                Vezi Colecția <RefreshCw size={10} />
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 md:gap-8">
              {listings?.filter((l: any) => l.tip_anunt === sec.type).slice(0, 3).map((listing: any) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </div>
        ))}

        {/* CTA SECTION */}
        <Card className="bg-[#37371f] rounded-[4rem] p-12 md:p-20 text-center space-y-8 overflow-hidden relative border-none shadow-3xl group">
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 transition-transform duration-700 group-hover:scale-150" />
           <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24 transition-transform duration-700 group-hover:scale-150" />
           
           <h2 className="text-4xl md:text-6xl font-black text-white leading-tight relative z-10">
              Ai ceva ce nu mai folosești? <br/>
              <span className="text-[#10b981]">Dă-i o viață nouă pe Troky.</span>
           </h2>
           <div className="relative z-10 pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild className="h-16 px-10 rounded-2xl bg-[#10b981] hover:bg-[#0d9668] text-[#37371f] font-black text-lg shadow-xl">
                 <Link href="/add">Postează un Anunț Gratuit</Link>
              </Button>
              <Button asChild variant="outline" className="h-16 px-10 rounded-2xl border-white/20 text-white hover:bg-white/10 font-bold text-lg">
                 <Link href="/search">Explorează Comunitatea</Link>
              </Button>
           </div>
        </Card>

      </section>
    </div>
  )
}
