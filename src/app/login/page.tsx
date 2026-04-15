'use client'

import { useState } from 'react'
import { login, signup, resetPassword } from './actions'
import { Mail, Lock, User, AtSign, ArrowRight } from 'lucide-react'

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
      const result = await resetPassword(formData)
      if (result && result.error) {
        setErrorMsg(result.error)
      } else {
        setSuccessMsg('Email-ul de resetare a fost trimis! Vă rugăm să verificați căsuța de e-mail.')
      }
      setLoading(false)
      return
    }

    const action = isLogin ? login : signup
    const result = await action(formData)
    
    if (result && result.error) {
      setErrorMsg(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 200px)' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '450px', padding: '2.5rem', position: 'relative', overflow: 'hidden' }}>
        
        {/* Background ambient glow */}
        <div style={{ position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 60%)', zIndex: -1, pointerEvents: 'none' }} />

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
            {isForgot ? 'Recuperare Parolă' : isLogin ? 'Bine ai revenit!' : 'Alătură-te comunității'}
          </h1>
          <p style={{ color: 'var(--muted-foreground)' }}>
            {isForgot ? 'Ați uitat parola? Vă putem trimite un link securizat.' : isLogin ? 'Conectează-te pentru a continua schimburile.' : 'Creează-ți un cont gratuit pentru a propune schimburi.'}
          </p>
        </div>

        {errorMsg && (
          <div style={{ padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', borderRadius: 'var(--radius)', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div style={{ padding: '0.75rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: 'var(--primary)', borderRadius: 'var(--radius)', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>
            {successMsg}
          </div>
        )}

        <form action={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          
          {!isLogin && !isForgot && (
            <>
              <div className="input-group">
                <User size={18} className="input-icon" />
                <input type="text" name="fullName" placeholder="Nume Complet" required={!isLogin && !isForgot} className="form-input" />
              </div>
              <div className="input-group">
                <AtSign size={18} className="input-icon" />
                <input type="text" name="username" placeholder="Nume utilizator (Alias)" required={!isLogin && !isForgot} className="form-input" />
              </div>
            </>
          )}

          <div className="input-group">
            <Mail size={18} className="input-icon" />
            <input type="email" name="email" placeholder="Adresa de E-mail" required className="form-input" />
          </div>

          {!isForgot && (
            <>
              <div className="input-group">
                <Lock size={18} className="input-icon" />
                <input type="password" name="password" placeholder="Parolă" required className="form-input" />
              </div>
              <div style={{ textAlign: 'right' }}>
                <button type="button" onClick={() => { setIsForgot(true); setErrorMsg(''); setSuccessMsg(''); }} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.85rem', cursor: 'pointer', outline: 'none' }}>
                  Ai uitat parola?
                </button>
              </div>
            </>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '0.5rem', padding: '0.8rem', fontSize: '1.05rem', justifyContent: 'center' }}>
            {loading ? 'Se încarcă...' : isForgot ? 'Trimite Email de Resetare' : isLogin ? 'Intră în cont' : 'Creează cont'}
            {!loading && <ArrowRight size={18} style={{ marginLeft: '0.5rem' }} />}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.95rem', color: 'var(--muted-foreground)' }}>
          {isForgot ? (
            <>
              Îți amintești parola?{' '}
              <button onClick={() => { setIsForgot(false); setIsLogin(true); setErrorMsg(''); setSuccessMsg(''); }} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '600', textDecoration: 'underline', cursor: 'pointer' }}>
                Autentifică-te
              </button>
            </>
          ) : isLogin ? (
            <>
              Nu ai încă un cont?{' '}
              <button onClick={() => { setIsLogin(false); setErrorMsg(''); }} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '600', textDecoration: 'underline', cursor: 'pointer' }}>
                Înregistrează-te
              </button>
            </>
          ) : (
            <>
              Ai deja un cont?{' '}
              <button onClick={() => { setIsLogin(true); setErrorMsg(''); }} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '600', textDecoration: 'underline', cursor: 'pointer' }}>
                Autentifică-te
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  )
}
