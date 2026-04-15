'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Send, User as UserIcon, Package, Check, CheckCheck, Clock } from 'lucide-react'

export default function ChatContainer({ currentUser, initialConversations }: { currentUser: any, initialConversations: any[] }) {
  const [conversations, setConversations] = useState(initialConversations)
  const [selectedChat, setSelectedChat] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // Listen for NEW messages globally to update sidebar previews
  useEffect(() => {
    const sidebarChannel = supabase
      .channel('sidebar-updates')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages'
      }, (payload) => {
        const msg = payload.new
        // Check if this message belongs to any conversation of the current user
        if (msg.sender_id === currentUser.id || msg.receiver_id === currentUser.id) {
            updateSidebar(msg)
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(sidebarChannel) }
  }, [conversations])

  const updateSidebar = (msg: any) => {
    setConversations(prev => {
        const otherUserId = msg.sender_id === currentUser.id ? msg.receiver_id : msg.sender_id
        const convIndex = prev.findIndex(c => c.listing_id === msg.listing_id && c.other_user_id === otherUserId)
        
        if (convIndex > -1) {
            const newConv = [...prev]
            newConv[convIndex] = {
                ...newConv[convIndex],
                last_message: msg.content,
                last_date: msg.created_at
            }
            // Move to top
            const item = newConv.splice(convIndex, 1)[0]
            return [item, ...newConv]
        }
        return prev
    })
  }

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat)
      
      const chatChannel = supabase
        .channel(`chat:${selectedChat.listing_id}`)
        .on('postgres_changes', { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'messages',
            filter: `listing_id=eq.${selectedChat.listing_id}`
        }, (payload) => {
            const msg = payload.new
            // Correct conversation check
            const isRelevant = 
                (msg.sender_id === currentUser.id && msg.receiver_id === selectedChat.other_user_id) ||
                (msg.sender_id === selectedChat.other_user_id && msg.receiver_id === currentUser.id)
            
            if (isRelevant) {
                setMessages(prev => {
                    // Avoid duplicates from optimistic update
                    if (prev.some(m => m.id === msg.id || (m.temp_id && m.content === msg.content))) {
                        return prev.map(m => (m.temp_id && m.content === msg.content) ? msg : m)
                    }
                    return [...prev, msg]
                })
            }
        })
        .subscribe()

      return () => { supabase.removeChannel(chatChannel) }
    }
  }, [selectedChat])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const fetchMessages = async (chat: any) => {
    setLoading(true)
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('listing_id', chat.listing_id)
      .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${chat.other_user_id}),and(sender_id.eq.${chat.other_user_id},receiver_id.eq.${currentUser.id})`) 
      // Note: better filter logic normally involves sender/receiver cross-check
      .order('created_at', { ascending: true })
    
    setMessages(data || [])
    setLoading(false)
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedChat) return

    const tempId = Date.now().toString()
    const msgContent = newMessage.trim()
    setNewMessage('')

    // OPTIMISTIC UPDATE (WhatsApp Style)
    const optimisticMsg = {
      id: tempId,
      temp_id: tempId,
      sender_id: currentUser.id,
      receiver_id: selectedChat.other_user_id,
      listing_id: selectedChat.listing_id,
      content: msgContent,
      created_at: new Date().toISOString(),
      status: 'sending' 
    }
    
    setMessages(prev => [...prev, optimisticMsg])

    const { data, error } = await supabase.from('messages').insert({
        sender_id: currentUser.id,
        receiver_id: selectedChat.other_user_id,
        listing_id: selectedChat.listing_id,
        content: msgContent
    }).select().single()

    if (error) {
        setMessages(prev => prev.filter(m => m.id !== tempId))
        alert('Eroare la trimiterea mesajului.')
    } else {
        // Realtime listener will handle the update, but we can also update status locally
        setMessages(prev => prev.map(m => m.id === tempId ? { ...data, status: 'sent' } : m))
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 350px) 1fr', gap: '0', background: 'var(--border)', height: '650px', borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border)', boxShadow: 'var(--glass-shadow)' }}>
      {/* Sidebar - WhatsApp Style */}
      <div style={{ background: 'var(--background)', overflowY: 'auto', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.3)', backdropFilter: 'blur(5px)' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Mesaje Recente</h3>
        </div>
        <div style={{ flex: 1 }}>
            {conversations.length > 0 ? conversations.map((chat: any) => (
            <div 
                key={`${chat.listing_id}-${chat.other_user_id}`} 
                onClick={() => setSelectedChat(chat)}
                style={{ 
                padding: '1rem', 
                cursor: 'pointer', 
                borderBottom: '1px solid rgba(55,55,31,0.05)',
                background: selectedChat?.listing_id === chat.listing_id && selectedChat?.other_user_id === chat.other_user_id ? 'rgba(55,55,31,0.08)' : 'transparent',
                transition: 'all 0.2s',
                position: 'relative'
                }}
            >
                <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary)', color: '#eaefbd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.2rem', flexShrink: 0 }}>
                    {chat.other_user_name?.charAt(0).toUpperCase() || '?'}
                </div>
                <div style={{ overflow: 'hidden', flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--foreground)' }}>{chat.other_user_name || 'Utilizator'}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)' }}>{new Date(chat.last_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Package size={12} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted-foreground)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{chat.listing_title}</span>
                    </div>
                    {/* MESSAGE PREVIEW */}
                    <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: 'var(--muted-foreground)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', opacity: 0.8 }}>
                        {chat.last_message}
                    </p>
                </div>
                </div>
                {selectedChat?.listing_id === chat.listing_id && selectedChat?.other_user_id === chat.other_user_id && (
                    <div style={{ position: 'absolute', right: 0, top: '20%', bottom: '20%', width: '4px', background: 'var(--accent)', borderRadius: '4px 0 0 4px' }} />
                )}
            </div>
            )) : (
            <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--muted-foreground)', fontSize: '0.9rem' }}>Nicio conversație activă încă.</div>
            )}
        </div>
      </div>

      {/* Chat Area */}
      <div style={{ background: '#ffffff', display: 'flex', flexDirection: 'column' }}>
        {selectedChat ? (
          <>
            {/* Header */}
            <div style={{ padding: '0.8rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--background)', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', zIndex: 10 }}>
              <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary)', color: '#eaefbd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                    {selectedChat.other_user_name?.charAt(0)}
                </div>
                <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>{selectedChat.other_user_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>Online acum</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ fontSize: '0.8rem', padding: '0.3rem 0.7rem', borderRadius: '100px', background: 'white', border: '1px solid var(--border)', fontWeight: 600, color: 'var(--foreground)' }}>
                    {selectedChat.listing_title}
                  </div>
              </div>
            </div>

            {/* Messages Pane */}
            <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.2rem', background: '#f8f8ef', backgroundImage: 'radial-gradient(#37371f10 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
              {messages.map((m: any) => {
                const isMe = m.sender_id === currentUser.id
                return (
                  <div 
                    key={m.id} 
                    style={{ 
                      maxWidth: '75%', 
                      alignSelf: isMe ? 'flex-end' : 'flex-start',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.2rem'
                    }}
                  >
                    <span style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', fontWeight: 600, alignSelf: isMe ? 'flex-end' : 'flex-start', margin: '0 0.5rem' }}>
                        {isMe ? 'Tu' : selectedChat.other_user_name}
                    </span>
                    <div 
                        style={{ 
                        background: isMe ? 'var(--primary)' : 'var(--background)',
                        color: isMe ? 'var(--background)' : 'var(--foreground)',
                        padding: '0.7rem 1.1rem',
                        borderRadius: isMe ? '1.25rem 1.25rem 0.2rem 1.25rem' : '1.25rem 1.25rem 1.25rem 0.2rem',
                        fontSize: '0.95rem',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                        position: 'relative',
                        border: isMe ? 'none' : '1px solid var(--border)'
                        }}
                    >
                        {m.content}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.3rem', fontSize: '0.65rem', opacity: 0.8, marginTop: '0.2rem' }}>
                            {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {isMe && (
                                m.status === 'sending' ? <Clock size={10} /> : 
                                m.read_state ? <CheckCheck size={12} style={{ color: '#30f2f2' }} /> : <Check size={12} />
                            )}
                        </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Input WhatsApp Style */}
            <div style={{ padding: '1.25rem', background: 'var(--background)', borderTop: '1px solid var(--border)' }}>
                <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', background: 'var(--input)', padding: '0.4rem', borderRadius: '100px', border: '1px solid var(--border)', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                    <input 
                        type="text" 
                        value={newMessage} 
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Scrie un mesaj aici..." 
                        style={{ flex: 1, background: 'none', border: 'none', padding: '0.5rem 1rem', fontSize: '1rem', outline: 'none', color: 'var(--foreground)' }}
                    />
                    <button type="submit" className="btn" style={{ width: '40px', height: '40px', padding: 0, borderRadius: '50%', background: 'var(--primary)', color: 'var(--background)' }}>
                        <Send size={20} />
                    </button>
                </form>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--muted-foreground)', padding: '2rem', textAlign: 'center' }}>
             <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(55,55,31,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <Send size={48} style={{ opacity: 0.2 }} />
             </div>
             <h2 style={{ color: 'var(--foreground)', marginBottom: '0.5rem' }}>Alege o conversație</h2>
             <p style={{ maxWidth: '300px' }}>Selectează cineva din lista din stânga pentru a trimite un mesaj în timp real.</p>
          </div>
        )}
      </div>
    </div>
  )
}
