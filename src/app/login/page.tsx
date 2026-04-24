'use client'

import { useState } from 'react'
import { login, signup, resetPassword } from './actions'
import { createClient } from '@/utils/supabase/client'
import { Mail, Lock, User, AtSign, ArrowRight, ArrowLeft, ShieldCheck, Heart } from 'lucide-react'
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
      // Switch back to login interface
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
    <div className="container max-w-lg py-20 px-4 animate-fade-in flex flex-col items-center justify-center relative z-10">
      
      {/* BRANDING SUBTIL */}
      <div className="flex flex-col items-center mb-8 gap-2">
         <div className="w-16 h-16 rounded-3xl bg-[#10b981] flex items-center justify-center text-white shadow-2xl shadow-[#10b981]/20 rotate-3">
             <Heart size={32} fill="currentColor" />
         </div>
         <h1 className="text-2xl font-black uppercase tracking-tighter text-foreground italic">Troky Community</h1>
      </div>

      <Card className="w-full border-border shadow-2xl shadow-black/10 rounded-[32px] overflow-hidden bg-white/70 backdrop-blur-xl">
        <CardHeader className="text-center p-8 pb-4">
          <CardTitle className="text-3xl font-black tracking-tight mb-2 italic">
            {isForgot ? 'Recuperare Cont' : isLogin ? 'Bine ai revenit!' : 'Alătură-te nouă'}
          </CardTitle>
          <CardDescription className="font-semibold text-muted-foreground">
            {isForgot ? 'Îți trimitem un link sigur de resetare' : isLogin ? 'Intră în contul tău pentru a vedea noutățile.' : 'Creează un cont gratuit și propune primul tău barter.'}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-8 pt-4 space-y-6">
          
          {/* LOGIN/SIGNUP TOGGLE */}
          {!isForgot && (
            <Tabs defaultValue="login" value={isLogin ? 'login' : 'signup'} onValueChange={(v) => setIsLogin(v === 'login')} className="w-full">
                <TabsList className="grid grid-cols-2 h-12 p-1.5 bg-muted/40 rounded-xl border border-border/40">
                    <TabsTrigger value="login" className="rounded-[10px] font-black text-xs uppercase tracking-widest">Login</TabsTrigger>
                    <TabsTrigger value="signup" className="rounded-[10px] font-black text-xs uppercase tracking-widest">Sign Up</TabsTrigger>
                </TabsList>
            </Tabs>
          )}

          {errorMsg && (
            <Alert variant="destructive" className="rounded-2xl border-2 font-bold bg-destructive/5">
              <AlertDescription className="text-xs uppercase font-black">{errorMsg}</AlertDescription>
            </Alert>
          )}

          {successMsg && (
            <Alert className="rounded-2xl border-2 border-[#10b981]/30 bg-[#10b981]/5 text-[#10b981]">
              <AlertDescription className="text-xs font-black uppercase italic">{successMsg}</AlertDescription>
            </Alert>
          )}

          <form action={handleSubmit} className="space-y-4">
            
            {!isLogin && !isForgot && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-2">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Nume Complet</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <Input name="fullName" placeholder="Ex: Ion Popescu" required className="h-12 pl-10 rounded-xl bg-muted/10 border-border font-medium" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Alias (Username)</Label>
                  <div className="relative">
                    <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <Input name="username" placeholder="ion_pegas" required className="h-12 pl-10 rounded-xl bg-muted/10 border-border font-medium" />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Adresă de E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <Input type="email" name="email" placeholder="nume@exemplu.com" required className="h-12 pl-10 rounded-xl bg-muted/10 border-border font-medium" />
              </div>
            </div>

            {!isForgot && (
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Parolă</Label>
                  <button type="button" onClick={() => setIsForgot(true)} className="text-[10px] font-black text-[#ea9010] uppercase hover:underline">Ai uitat parola?</button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input type="password" name="password" placeholder="••••••••" required className="h-12 pl-10 rounded-xl bg-muted/10 border-border font-medium" />
                </div>
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full h-14 rounded-2xl bg-[#37371f] hover:bg-[#202012] text-white font-black text-lg shadow-xl shadow-black/5 mt-4 group">
              {loading ? 'Se procesează...' : isForgot ? 'Trimite Email Resetare' : isLogin ? 'Intră în cont' : 'Creează cont'}
              {!loading && <ArrowRight size={20} className="ml-2 transition-transform group-hover:translate-x-1" />}
            </Button>
          </form>

          {!isForgot && (
            <>
              <div className="relative mt-8">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/40" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground font-black tracking-widest rounded-full shadow-sm">sau continuă cu</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <Button variant="outline" type="button" onClick={() => handleSocialLogin('google')} className="h-12 rounded-xl font-bold border-border bg-white hover:bg-muted/50 transition-colors shadow-sm">
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Google
                </Button>
                <Button variant="outline" type="button" onClick={() => handleSocialLogin('facebook')} className="h-12 rounded-xl font-bold border-border bg-white hover:bg-[#1877F2]/10 hover:text-[#1877F2] transition-colors shadow-sm group">
                  <svg className="w-5 h-5 mr-2 fill-[#1877F2] transition-colors" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </Button>
              </div>
            </>
          )}
        </CardContent>

        <CardFooter className="justify-center p-8 pt-0">
           {isForgot && (
             <Button variant="ghost" onClick={() => setIsForgot(false)} className="font-bold text-xs uppercase tracking-widest gap-2">
                <ArrowLeft size={16} /> Înapoi la autentificare
             </Button>
           )}
        </CardFooter>
      </Card>

      <div className="mt-8 flex items-center gap-2 text-muted-foreground text-xs font-bold uppercase tracking-widest">
         <ShieldCheck size={14} className="text-[#10b981]" /> Acces Securizat prin Supabase Auth
      </div>
    </div>
  )
}
