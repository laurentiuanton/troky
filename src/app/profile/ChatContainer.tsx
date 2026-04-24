'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { Send, User as UserIcon, Package, Check, CheckCheck, Clock, Search, MessageSquare, ChevronLeft, Image as ImageIcon, Loader2, Sparkles } from 'lucide-react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

export default function ChatContainer({ currentUser, initialConversations }: { currentUser: any, initialConversations: any[] }) {
  const [conversations, setConversations] = useState(initialConversations)
  const [selectedChat, setSelectedChat] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()
  const searchParams = useSearchParams()

  useEffect(() => {
    const listingId = searchParams.get('listingId')
    const otherUserId = searchParams.get('userId')
    
    if (listingId && otherUserId && conversations.length > 0) {
      const foundChat = conversations.find(c => 
        c.listing_id === listingId && c.other_user_id === otherUserId
      )
      if (foundChat) {
        setSelectedChat(foundChat)
      }
    }
  }, [searchParams, conversations])

  const markAsRead = async (chat: any) => {
    if (!chat || !currentUser || document.visibilityState !== 'visible') return
    
    const { error } = await supabase
      .from('messages')
      .update({ read_state: true })
      .eq('listing_id', chat.listing_id)
      .eq('receiver_id', currentUser.id)
      .eq('sender_id', chat.other_user_id)
      .eq('read_state', false)

    if (!error) {
      window.dispatchEvent(new Event('unread-count-refresh'))
    }
  }

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat)
      
      if (document.visibilityState === 'visible') {
        markAsRead(selectedChat)
      }
      
      const chatChannel = supabase
        .channel(`chat_room_${selectedChat.listing_id}`)
        .on('postgres_changes', { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'messages',
        }, (payload: any) => {
            const msg = payload.new
            const isForThisChat = 
                msg.listing_id === selectedChat.listing_id &&
                ((msg.sender_id === currentUser.id && msg.receiver_id === selectedChat.other_user_id) ||
                 (msg.sender_id === selectedChat.other_user_id && msg.receiver_id === currentUser.id))
            
            if (isForThisChat) {
                setMessages(prev => {
                    if (prev.some(m => m.id === msg.id)) return prev
                    return [...prev, msg]
                })

                if (msg.receiver_id === currentUser.id && document.visibilityState === 'visible') {
                   markAsRead(selectedChat)
                }
            }
        })
        .on('postgres_changes', {
            event: 'UPDATE',
            schema: 'public',
            table: 'messages'
        }, (payload: any) => {
            const updatedMsg = payload.new
            setMessages(prev => prev.map(m => m.id === updatedMsg.id ? updatedMsg : m))
        })
        .subscribe()

      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible' && selectedChat) {
          markAsRead(selectedChat)
        }
      }
      document.addEventListener('visibilitychange', handleVisibilityChange)

      return () => { 
        supabase.removeChannel(chatChannel)
        document.removeEventListener('visibilitychange', handleVisibilityChange)
      }
    }
  }, [selectedChat, currentUser.id])

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
      .order('created_at', { ascending: true })
    
    setMessages(data || [])
    setLoading(false)
  }

  const handleSendMessage = async (text: string | null, imageUrl: string | null = null) => {
    if (!selectedChat) return

    const { data, error } = await supabase.from('messages').insert({
        sender_id: currentUser.id,
        receiver_id: selectedChat.other_user_id,
        listing_id: selectedChat.listing_id,
        content: text || '',
        image_url: imageUrl
    }).select().single()

    if (!error) {
        supabase.channel('global-notifications').send({
          type: 'broadcast',
          event: 'new-message',
          payload: { 
            receiver_id: selectedChat.other_user_id, 
            sender_name: currentUser.full_name || currentUser.email?.split('@')[0] || 'Utilizator',
            content: text ? text : '📷 A trimis o imagine',
            listing_id: selectedChat.listing_id,
            sender_id: currentUser.id
          }
        })
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !selectedChat) return

    setIsUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}-${Date.now()}.${fileExt}`
      const filePath = `chat/${currentUser.id}/${fileName}`

      const { data, error } = await supabase.storage
        .from('anunturi')
        .upload(filePath, file)

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('anunturi')
        .getPublicUrl(filePath)

      await handleSendMessage(null, publicUrl)
    } catch (err) {
      console.error('Error uploading image:', err)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <Card className="grid grid-cols-1 md:grid-cols-12 h-[650px] md:h-[800px] border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] rounded-[3rem] overflow-hidden bg-white/80 backdrop-blur-2xl">
      
      {/* SIDEBAR */}
      <div className={cn(
        "md:col-span-4 border-r border-border/40 flex flex-col bg-muted/10",
        selectedChat ? "hidden md:flex" : "flex"
      )}>
        <div className="p-8 border-b border-border/40">
            <h3 className="text-[10px] font-black tracking-[0.3em] uppercase text-muted-foreground mb-6 flex items-center gap-2">
               <MessageSquare size={14} className="text-secondary" /> Mesaje Recente
            </h3>
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-secondary transition-colors" size={16} />
                <Input placeholder="Caută conversație..." className="h-12 pl-12 rounded-2xl border-transparent bg-white shadow-sm focus:border-secondary transition-all text-sm font-bold" />
            </div>
        </div>
        
        <ScrollArea className="flex-1">
            <div className="p-3 space-y-1">
                {conversations.map((chat: any) => {
                    const isSelected = selectedChat?.listing_id === chat.listing_id && selectedChat?.other_user_id === chat.other_user_id
                    return (
                        <button 
                            key={`${chat.listing_id}-${chat.other_user_id}`} 
                            onClick={() => setSelectedChat(chat)} 
                            className={cn(
                                "w-full p-4 text-left transition-all rounded-[1.5rem] flex items-center gap-4 relative group hover-scale", 
                                isSelected ? "bg-white shadow-[0_8px_24px_rgba(0,0,0,0.04)]" : "hover:bg-white/50"
                            )}
                        >
                            <Avatar className="h-14 w-14 rounded-2xl border-4 border-white shadow-xl flex-shrink-0">
                                <AvatarFallback className="bg-primary text-white font-black text-lg">
                                    {chat.other_user_name?.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-1">
                                    <span className={cn("font-black text-sm truncate", isSelected ? "text-primary" : "text-primary/70")}>{chat.other_user_name}</span>
                                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{new Date(chat.last_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <p className="text-xs text-muted-foreground truncate font-medium max-w-[150px]">
                                    {chat.last_message || '📷 Imagine recepționată'}
                                </p>
                            </div>
                            {isSelected && <div className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-secondary rounded-full" />}
                        </button>
                    )
                })}
            </div>
        </ScrollArea>
      </div>

      {/* CHAT AREA */}
      <div className={cn(
        "md:col-span-8 flex flex-col bg-[#fcfcf9] min-h-0 relative animate-in fade-in duration-500",
        !selectedChat ? "hidden md:flex" : "flex"
      )}>
        {selectedChat ? (
          <>
            {/* CHAT HEADER */}
            <div className="flex-none p-5 border-b border-border/40 flex items-center justify-between bg-white/60 backdrop-blur-md z-10">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="md:hidden rounded-xl" onClick={() => setSelectedChat(null)}><ChevronLeft size={24} /></Button>
                <Link href={`/user/${selectedChat.other_user_id}`} className="flex items-center gap-4 group">
                   <Avatar className="h-11 w-11 rounded-2xl border-2 border-white shadow-lg transition-transform group-hover:scale-105">
                       <AvatarFallback className="bg-secondary text-white font-black">{selectedChat.other_user_name?.charAt(0)}</AvatarFallback>
                   </Avatar>
                   <div>
                       <h4 className="font-black text-base text-primary group-hover:text-secondary transition-colors italic">{selectedChat.other_user_name}</h4>
                       <div className="flex items-center gap-2">
                           <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Utilizator verificat</span>
                           <Sparkles size={10} className="text-accent" />
                       </div>
                   </div>
                </Link>
              </div>
            </div>

            {/* MESSAGES LIST */}
            <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto p-8 flex flex-col gap-8 custom-scrollbar">
              {messages.map((m: any) => {
                const isMe = m.sender_id === currentUser.id
                return (
                  <div key={m.id} className={cn("max-w-[75%] flex flex-col gap-2", isMe ? "self-end items-end" : "self-start items-start")}>
                    <div className={cn(
                        "px-6 py-4 shadow-xl transition-all text-sm font-bold leading-relaxed", 
                        isMe 
                            ? "bg-primary text-white rounded-[2rem] rounded-br-[4px]" 
                            : "bg-white text-primary rounded-[2rem] rounded-bl-[4px] border border-border/20 shadow-[0_8px_24px_rgba(0,0,0,0.03)]"
                    )}>
                        {m.image_url && (
                          <div className="mb-3 rounded-2xl overflow-hidden shadow-inner border-2 border-white/10 group/img relative">
                             <img src={m.image_url} alt="Imagine chat" className="max-w-full h-auto max-h-[350px] object-cover cursor-zoom-in transition-transform duration-500 group-hover/img:scale-105" />
                          </div>
                        )}
                        {m.content && <div>{m.content}</div>}
                        <div className={cn("flex items-center justify-end gap-2 text-[9px] font-black mt-3 uppercase tracking-[0.1em]", isMe ? "text-secondary" : "text-muted-foreground")}>
                            {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {isMe && (m.read_state ? <CheckCheck size={12} className="text-[#34d399]" /> : <Check size={12} />)}
                        </div>
                    </div>
                  </div>
                )
              })}
              {isUploading && (
                <div className="self-end flex items-center gap-3 bg-white px-6 py-3 rounded-full border border-secondary/20 shadow-xl animate-bounce">
                   <Loader2 size={16} className="animate-spin text-secondary" />
                   <span className="text-[10px] font-black uppercase text-secondary tracking-widest">Trimitere imagine...</span>
                </div>
              )}
            </div>

            {/* MESSAGE INPUT */}
            <div className="p-6 bg-white flex flex-col gap-4 border-t border-border/40">
                <form 
                  onSubmit={(e) => { e.preventDefault(); if (newMessage.trim()) { handleSendMessage(newMessage); setNewMessage(''); } }} 
                  className="flex gap-4 items-center"
                >
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-[1.2rem] w-14 h-14 bg-muted/20 text-accent hover:bg-accent/10 hover-scale shrink-0"
                    >
                      <ImageIcon size={22} />
                    </Button>
                    <div className="flex-1 flex gap-2 items-center bg-muted/20 p-1.5 rounded-[1.5rem] border border-border shadow-inner focus-within:bg-white focus-within:border-secondary transition-all">
                      <Input 
                        value={newMessage} 
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Trimite un mesaj despre troc..." 
                        className="bg-transparent border-none focus-visible:ring-0 text-sm h-12 font-bold px-4"
                      />
                      <Button type="submit" size="icon" className="h-12 w-12 rounded-[1.2rem] bg-secondary hover:bg-secondary/90 text-white transition-all shadow-xl shadow-secondary/20 hover-scale shrink-0">
                        <Send size={20} />
                      </Button>
                    </div>
                </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-20 text-center animate-fade-in">
             <div className="w-32 h-32 rounded-[3.5rem] bg-white shadow-2xl flex items-center justify-center text-secondary mb-10 group relative animate-soft-float">
                 <div className="absolute inset-0 bg-secondary/10 rounded-full blur-2xl animate-pulse" />
                 <MessageSquare size={64} />
             </div>
             <h2 className="text-3xl font-black uppercase tracking-tighter text-primary italic">Conversațiile Troky</h2>
             <p className="max-w-xs text-sm font-bold text-muted-foreground mt-4 leading-relaxed uppercase tracking-[0.1em] opacity-40">Selectează o discuție din stânga pentru a începe trocul sustenabil.</p>
          </div>
        )}
      </div>
    </Card>
  )
}
