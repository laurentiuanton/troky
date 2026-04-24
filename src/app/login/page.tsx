'use client'

import { useState } from 'react'
import { login, signup, resetPassword } from './actions'
import { createClient } from '@/utils/supabase/client'
import { Mail, Lock, User, AtSign, ArrowRight, ArrowLeft, ShieldCheck, Heart, Sparkles, Loader2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [isForgot, setIsForgot] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')
    
    if (isForgot) {
      await resetPassword(formData)
      setSuccessMsg('Email-ul de resetare a fost trimis! Vă rugăm să verificați inbox-ul.')
      setLoading(false)
      return
    }

    const action = isLogin ? login : signup
    const result = await action(formData)
    
    if (result && 'error' in result && result.error) {
      setErrorMsg(result.error)
      setLoading(false)
    } else if (result && 'success' in result && result.success) {
      setSuccessMsg(result.success)
      setLoading(false)
      setIsLogin(true)
    }
  }

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) setErrorMsg(error.message)
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg relative animate-fade-in">
        
        {/* DECORATIVE ELEMENTS */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-secondary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-accent/10 rounded-full blur-3xl animate-pulse delay-700" />

        {/* BRANDING */}
        <div className="flex flex-col items-center mb-10 gap-3">
           <div className="w-20 h-20 rounded-[2rem] bg-white border border-border shadow-2xl flex items-center justify-center text-secondary rotate-3 hover:rotate-0 transition-transform duration-500 group">
               <Heart size={36} fill="currentColor" className="group-hover:scale-110 transition-transform" />
           </div>
           <div className="text-center">
             <h1 className="text-3xl font-black uppercase tracking-tighter text-primary italic flex items-center gap-2">
               Troky <span className="text-secondary tracking-normal not-italic font-medium text-sm bg-secondary/10 px-3 py-1 rounded-full uppercase">Community</span>
             </h1>
             <p className="text-xs font-black text-muted-foreground uppercase tracking-[0.3em] mt-1 ml-1 opacity-50">Schimbă Inteligent</p>
           </div>
        </div>

        <Card className="glass-card rounded-[3rem] overflow-hidden border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)]">
          <CardHeader className="text-center p-10 pb-4">
            <CardTitle className="text-3xl font-black tracking-tighter mb-2 italic text-primary">
              {isForgot ? 'Recuperare Cont' : isLogin ? 'Bine ai revenit!' : 'Alătură-te nouă'}
            </CardTitle>
            <CardDescription className="font-bold text-muted-foreground leading-relaxed">
              {isForgot ? 'Îți trimitem un link sigur de resetare' : isLogin ? 'Intră în contul tău pentru a vedea ce mai e nou în comunitate.' : 'Creează un cont gratuit și începe să postezi anunțuri.'}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-10 pt-4 space-y-8">
            
            {!isForgot && (
              <Tabs defaultValue="login" value={isLogin ? 'login' : 'signup'} onValueChange={(v) => setIsLogin(v === 'login')} className="w-full">
                  <TabsList className="grid grid-cols-2 h-14 p-1.5 bg-muted/30 rounded-2xl border border-border/40">
                      <TabsTrigger value="login" className="rounded-xl font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-lg">Login</TabsTrigger>
                      <TabsTrigger value="signup" className="rounded-xl font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-lg">Sign Up</TabsTrigger>
                  </TabsList>
              </Tabs>
            )}

            {errorMsg && (
              <Alert variant="destructive" className="rounded-2xl border-2 font-bold bg-destructive/5 animate-in slide-in-from-top-2">
                <AlertDescription className="text-xs uppercase font-black tracking-wide">{errorMsg}</AlertDescription>
              </Alert>
            )}

            {successMsg && (
              <Alert className="rounded-2xl border-2 border-secondary/30 bg-secondary/5 text-secondary animate-in slide-in-from-top-2">
                <AlertDescription className="text-xs font-black uppercase italic flex items-center gap-2">
                   <Sparkles size={14} /> {successMsg}
                </AlertDescription>
              </Alert>
            )}

            <form action={handleSubmit} className="space-y-5">
              
              {!isLogin && !isForgot && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="space-y-2 group">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-3 group-focus-within:text-secondary transition-colors">Nume Complet</Label>
                    <div className="relative">
                      <User className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-secondary transition-colors" size={18} />
                      <Input name="fullName" placeholder="Ion Popescu" required className="premium-input pl-12 h-16 rounded-[1.5rem]" />
                    </div>
                  </div>
                  <div className="space-y-2 group">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-3 group-focus-within:text-secondary transition-colors">Alias (Username)</Label>
                    <div className="relative">
                      <AtSign className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-secondary transition-colors" size={18} />
                      <Input name="username" placeholder="ion_pegas" required className="premium-input pl-12 h-16 rounded-[1.5rem]" />
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2 group">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-3 group-focus-within:text-secondary transition-colors">Adresă de E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-secondary transition-colors" size={18} />
                  <Input type="email" name="email" placeholder="nume@exemplu.com" required className="premium-input pl-12 h-16 rounded-[1.5rem]" />
                </div>
              </div>

              {!isForgot && (
                <div className="space-y-2 group">
                  <div className="flex justify-between items-center px-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground group-focus-within:text-secondary transition-colors">Parolă</Label>
                    <button type="button" onClick={() => setIsForgot(true)} className="text-[10px] font-black text-accent uppercase hover:underline tracking-widest">Ai uitat parola?</button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-secondary transition-colors" size={18} />
                    <Input type="password" name="password" placeholder="••••••••" required className="premium-input pl-12 h-16 rounded-[1.5rem]" />
                  </div>
                </div>
              )}

              <Button type="submit" disabled={loading} className="w-full h-16 rounded-[1.5rem] bg-primary hover:bg-primary/95 text-white font-black text-lg shadow-2xl shadow-primary/20 mt-6 group hover-scale">
                {loading ? (
                    <Loader2 className="animate-spin h-6 w-6" />
                ) : (
                  <>
                    {isForgot ? 'Trimite Email Resetare' : isLogin ? 'Intră în cont' : 'Creează cont'}
                    <ArrowRight size={22} className="ml-3 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </form>

            {!isForgot && (
              <>
                <div className="relative mt-10">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border/60" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase">
                    <span className="bg-white/80 backdrop-blur px-4 text-muted-foreground font-black tracking-[0.3em] rounded-full border border-border/40 py-1">sau continuă cu</span>
                  </div>
                </div>

                <div className="mt-8">
                  <Button variant="outline" type="button" onClick={() => handleSocialLogin('google')} className="w-full h-14 rounded-2xl font-black text-xs uppercase tracking-widest border-border bg-white hover:bg-muted/30 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-3">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Google Authentication
                  </Button>
                </div>
              </>
            )}
          </CardContent>

          <CardFooter className="justify-center pb-10">
             {isForgot && (
               <Button variant="ghost" onClick={() => setIsForgot(false)} className="font-black text-[10px] uppercase tracking-[0.2em] gap-3 text-muted-foreground hover:text-primary transition-all">
                  <ArrowLeft size={16} /> Înapoi la autentificare
               </Button>
             )}
          </CardFooter>
        </Card>

        <div className="mt-10 flex flex-col items-center gap-2">
            <div className="flex items-center gap-3 text-secondary font-black text-[10px] uppercase tracking-[0.3em]">
               <ShieldCheck size={18} /> Acces Securizat prin Troky Identity
            </div>
            <p className="text-[9px] text-muted-foreground font-bold max-w-xs text-center opacity-40 uppercase tracking-widest mt-2 px-10 leading-relaxed">
              Datele tale sunt criptate și protejate conform standardelor internaționale GDPR.
            </p>
        </div>
      </div>
    </div>
  )
}
