'use client'

import { useState } from 'react'
import { updatePassword } from './actions'
import { Loader2 } from 'lucide-react'

export function ClientPasswordUpdate() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setIsError(false)

    const formData = new FormData(e.currentTarget)
    const result = await updatePassword(formData)

    if (result.error) {
      setIsError(true)
      setMessage(result.error)
    } else if (result.success) {
      setIsError(false)
      setMessage(result.success)
      ;(e.target as HTMLFormElement).reset()
    }
    
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem', maxWidth: '400px' }}>
      
      {message && (
        <div style={{ padding: '0.8rem', borderRadius: 'var(--radius)', fontSize: '0.9rem', backgroundColor: isError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: isError ? '#ef4444' : 'var(--primary)', border: `1px solid ${isError ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}` }}>
          {message}
        </div>
      )}

      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--muted-foreground)' }}>Noua Parolă</label>
        <input type="password" name="new_password" required className="form-input" placeholder="Minim 6 caractere" />
      </div>
      <button type="submit" className="btn btn-secondary" disabled={loading} style={{ width: 'fit-content', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {loading && <Loader2 size={16} className="animate-spin" />}
        Actualizează Parola
      </button>
    </form>
  )
}
