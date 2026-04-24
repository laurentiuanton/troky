import React from 'react'
import { ShieldCheck, Lock, Eye, Mail, Scale, Info, Sparkles } from 'lucide-react'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen pb-24">
      <div className="container max-w-4xl py-16 md:py-24 px-6 mx-auto animate-fade-in text-primary">
        
        {/* HEADER PRIVACY */}
        <div className="text-center mb-20 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 rounded-full text-secondary font-black text-[10px] uppercase tracking-[0.2em] mb-4 overflow-hidden relative">
                <div className="absolute inset-0 bg-secondary/5 animate-pulse" />
                <ShieldCheck size={14} className="relative z-10" /> <span className="relative z-10">Protecție Totală</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter italic">Politică de <span className="text-secondary">Confidențialitate</span></h1>
            <p className="text-muted-foreground font-bold italic text-lg opacity-60">Ultima actualizare: {new Date().toLocaleDateString('ro-RO')}</p>
        </div>

        {/* SUMAR PRIVACY (Versiune Scurtă) - ECO MODERN CARD */}
        <div className="glass-card border-none rounded-[3rem] p-10 md:p-14 mb-20 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:rotate-12 transition-transform duration-1000">
                <Lock size={120} className="text-secondary" />
            </div>
            
            <h2 className="text-xl font-black mb-10 uppercase tracking-[0.3em] text-secondary flex items-center gap-3">
                <Info size={20} /> Rezumat: Pe scurt despre datele tale
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <SummaryItem 
                    icon={<Sparkles size={18} />} 
                    title="Scopul Schimbului" 
                    text="Folosim datele tale pentru a-ți permite să publici anunțuri, să comunici și să facem schimburile sigure." 
                />
                <SummaryItem 
                    icon={<Lock size={18} />} 
                    title="Securitate Avansată" 
                    text="Datele tale sunt criptate și nu vindem niciodată baza noastră de date către terți." 
                />
                <SummaryItem 
                    icon={<Eye size={18} />} 
                    title="Control Locație" 
                    text="Colectăm locația ta doar dacă o setezi explicit pentru a găsi parteneri de schimb în apropiere." 
                />
                <SummaryItem 
                    icon={<Mail size={18} />} 
                    title="Dreptul de a fi uitat" 
                    text="Poți solicita oricând ștergerea contului sau exportul datelor printr-un simplu e-mail." 
                />
            </div>
        </div>

        <article className="prose prose-slate max-w-none prose-h2:text-3xl prose-h2:font-black prose-h2:italic prose-h2:tracking-tighter prose-h2:text-primary prose-h2:mt-20 prose-h2:mb-8 prose-p:text-primary/70 prose-p:text-lg prose-p:leading-relaxed prose-li:text-primary/70 prose-li:font-medium prose-strong:text-secondary">
            <section>
                <h2>1. Informații Generale</h2>
                <p>
                    Prezenta Politică de Confidențialitate descrie modul în care <strong>Echipa Troky</strong> colectează, utilizează 
                    și protejează datele tale cu caracter personal în calitate de utilizator al platformei noastre de barter sustenabil.
                </p>
                <p>
                    Suntem dedicați protejării vieții tale private în conformitate cu Regulamentul (UE) 2016/679 (GDPR) și legislația națională (Legea 190/2018).
                </p>
            </section>

            <section>
                <h2>2. Datele pe care le colectăm</h2>
                <p>Colectăm doar datele strict necesare pentru funcționarea serviciului de barter:</p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 list-none p-0">
                    <li className="bg-muted/30 p-4 rounded-2xl border border-border/40"><strong>Identificare:</strong> Nume, prenume, adresa de e-mail verificate.</li>
                    <li className="bg-muted/30 p-4 rounded-2xl border border-border/40"><strong>Profil:</strong> Username, avatar, locația furnizată voluntar.</li>
                    <li className="bg-muted/30 p-4 rounded-2xl border border-border/40"><strong>Conținut:</strong> Textul anunțurilor, fotografii și mesaje chat.</li>
                    <li className="bg-muted/30 p-4 rounded-2xl border border-border/40"><strong>Tehnic:</strong> Adresa IP, tipul browserului și date de trafic.</li>
                </ul>
            </section>

            <section>
                <h2>3. Temeiuri Legale</h2>
                <p>Prelucrăm datele tale în baza următoarelor principii:</p>
                <div className="overflow-hidden rounded-[2rem] border border-border/40 shadow-sm mt-8">
                    <table className="min-w-full border-collapse m-0">
                        <thead>
                            <tr className="bg-primary text-white">
                                <th className="p-5 text-left text-[10px] font-black uppercase tracking-widest">Scopul Prelucrării</th>
                                <th className="p-5 text-left text-[10px] font-black uppercase tracking-widest">Temeiul Legal</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white/50">
                            <tr className="border-b border-border/40">
                                <td className="p-5 font-bold text-sm">Crearea contului și marketplace</td>
                                <td className="p-5 italic text-sm">Executarea contractului</td>
                            </tr>
                            <tr className="border-b border-border/40">
                                <td className="p-5 font-bold text-sm">Comunicarea între utilizatori (Chat)</td>
                                <td className="p-5 italic text-sm">Tranzacționare directă</td>
                            </tr>
                            <tr>
                                <td className="p-5 font-bold text-sm">Prevenirea fraudelor</td>
                                <td className="p-5 italic text-sm">Interes legitim</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <section>
                <h2>4. Mesageria și Moderarea</h2>
                <p>
                    Pentru a asigura un mediu sigur, <strong>sistemul de chat pe Troky este moderat</strong>. Conținutul poate fi analizat 
                    automat pentru a detecta tentative de fraudă sau limbaj neadecvat, protejând astfel comunitatea noastră sustenabilă.
                </p>
            </section>

            <div className="mt-24 p-10 bg-primary rounded-[2.5rem] text-white flex flex-col md:flex-row items-center gap-10 shadow-2xl shadow-primary/20">
                <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center shrink-0">
                    <Scale size={32} />
                </div>
                <div className="space-y-2">
                    <h4 className="text-xl font-black italic tracking-tight">Drepturile Tale sunt Prorejate</h4>
                    <p className="opacity-70 text-sm font-medium leading-relaxed">Ai dreptul la acces, rectificare, ștergere și portabilitate a datelor. Pentru orice solicitare, echipa noastră îți stă la dispoziție pe e-mail.</p>
                </div>
            </div>

            <div className="mt-20 pt-10 border-t border-border/40 flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 italic">
                <p>© {new Date().getFullYear()} Troky Community</p>
                <div className="flex gap-6">
                    <span>Privacy</span>
                    <span>Terms</span>
                    <span>GDPR Ready</span>
                </div>
            </div>
        </article>
      </div>
    </div>
  )
}

function SummaryItem({ icon, title, text }: { icon: any, title: string, text: string }) {
    return (
        <div className="flex gap-5 group">
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-secondary shadow-lg group-hover:bg-secondary group-hover:text-white transition-all duration-500 shrink-0">
                {icon}
            </div>
            <div className="space-y-1">
                <h4 className="font-black text-sm uppercase tracking-widest text-primary italic">{title}</h4>
                <p className="text-sm font-medium text-muted-foreground leading-relaxed">{text}</p>
            </div>
        </div>
    )
}
