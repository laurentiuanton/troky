'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Send, User as UserIcon, Package, Check, CheckCheck, Clock, Search, MessageSquare, ChevronLeft, Image as ImageIcon, Loader2 } from 'lucide-react'
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

  // 1. Auto-deschidere chat din URL (Notificare)
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

  // 2. Marcare mesaje ca citite (DOAR când conversația este activă pe ecran)
  const markAsRead = async (chat: any) => {
    if (!chat || !currentUser || document.visibilityState !== 'visible') return
    
    console.log('📖 Încercăm marcarea ca citit...')
    await supabase
      .from('messages')
      .update({ read_state: true })
      .eq('listing_id', chat.listing_id)
      .eq('receiver_id', currentUser.id)
      .eq('sender_id', chat.other_user_id)
      .eq('read_state', false)
  }

  // 3. Subscription pentru mesaje noi și statusuri citite
  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat)
      
      // Marcăm ca citit DOAR dacă suntem pe pagină
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

                // Marcăm ca citit DOAR dacă utilizatorul chiar se uită la chat în acel moment
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

      // 3.1. Ascultăm când utilizatorul revine în tab (tab focus)
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

  // Scroll automat la final
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
        // BROADCAST NOTIFICATION
        supabase.channel('global-notifications').send({
          type: 'broadcast',
          event: 'new-message',
          payload: { 
            receiver_id: selectedChat.other_user_id, 
            sender_name: currentUser.full_name || 'Cineva',
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
        .from('chat-attachments') // Asigură-te că acest bucket EXISTĂ în Supabase
        .upload(filePath, file)

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('chat-attachments')
        .getPublicUrl(filePath)

      await handleSendMessage(null, publicUrl)
    } catch (err) {
      console.error('Error uploading image:', err)
      alert('Eroare la încărcarea imaginii. Verifică dacă bucket-ul "chat-attachments" există.')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <Card className="grid grid-cols-1 md:grid-cols-12 h-[600px] md:h-[750px] border-border shadow-2xl rounded-3xl overflow-hidden bg-background">
      
      {/* SIDEBAR */}
      <div className={cn(
        "md:col-span-4 border-r border-border flex flex-col bg-muted/5",
        selectedChat ? "hidden md:flex" : "flex"
      )}>
        <div className="p-6 border-b border-border bg-white/40 backdrop-blur-md">
            <h3 className="text-sm font-black tracking-widest uppercase mb-4">Mesaje Recente</h3>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                <Input placeholder="Caută..." className="h-9 pl-9 rounded-xl border-border bg-background/50 text-xs font-semibold" />
            </div>
        </div>
        
        <ScrollArea className="flex-1">
            <div className="divide-y divide-border/40">
                {conversations.map((chat: any) => {
                    const isSelected = selectedChat?.listing_id === chat.listing_id && selectedChat?.other_user_id === chat.other_user_id
                    return (
                        <button key={`${chat.listing_id}-${chat.other_user_id}`} onClick={() => setSelectedChat(chat)} className={cn("w-full p-5 text-left transition-all relative flex items-center gap-4 hover:bg-muted/30", isSelected ? "bg-white shadow-inner" : "")}>
                            <Avatar className="h-12 w-12 rounded-2xl border-2 border-background shadow-sm">
                                <AvatarFallback className="bg-[#37371f] text-white font-black">{chat.other_user_name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-0.5">
                                    <span className="font-bold text-sm truncate">{chat.other_user_name}</span>
                                    <span className="text-[10px] font-bold text-muted-foreground">{new Date(chat.last_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <p className="text-xs text-muted-foreground truncate opacity-70 italic">
                                    {chat.last_message || '📷 Imagine'}
                                </p>
                            </div>
                        </button>
                    )
                })}
            </div>
        </ScrollArea>
      </div>

      {/* CHAT AREA */}
      <div className={cn(
        "md:col-span-8 flex flex-col bg-white min-h-0 relative",
        !selectedChat ? "hidden md:flex" : "flex"
      )}>
        {selectedChat ? (
          <>
            <div className="flex-none p-4 border-b border-border flex items-center justify-between bg-white/80 backdrop-blur-md z-10 shadow-sm">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedChat(null)}><ChevronLeft size={20} /></Button>
                <Avatar className="h-9 w-9"><AvatarFallback className="bg-[#10b981] text-white font-bold">{selectedChat.other_user_name?.charAt(0)}</AvatarFallback></Avatar>
                <div>
                    <h4 className="font-bold text-sm">{selectedChat.other_user_name}</h4>
                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter">Conexiune activă</span>
                </div>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto p-6 flex flex-col gap-6 bg-[#fbfbf6]">
              {messages.map((m: any) => {
                const isMe = m.sender_id === currentUser.id
                return (
                  <div key={m.id} className={cn("max-w-[85%] flex flex-col gap-1", isMe ? "self-end items-end" : "self-start items-start")}>
                    <div className={cn("px-4 py-2.5 shadow-sm transition-all text-sm font-medium", isMe ? "bg-[#37371f] text-white rounded-[20px] rounded-br-[4px]" : "bg-white text-foreground rounded-[20px] rounded-bl-[4px] border border-border/60")}>
                        {m.image_url && (
                          <div className="mb-2 rounded-xl overflow-hidden border border-white/20">
                             <img src={m.image_url} alt="Imagine chat" className="max-w-full h-auto max-h-[300px] object-cover cursor-zoom-in" />
                          </div>
                        )}
                        {m.content && <div>{m.content}</div>}
                        <div className={cn("flex items-center justify-end gap-1.5 text-[9px] font-bold mt-1.5 uppercase opacity-60", isMe ? "text-white" : "text-muted-foreground")}>
                            {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {isMe && (m.read_state ? <CheckCheck size={10} className="text-[#30f2f2]" /> : <Check size={10} />)}
                        </div>
                    </div>
                  </div>
                )
              })}
              {isUploading && (
                <div className="self-end flex items-center gap-2 bg-[#10b981]/10 px-4 py-2 rounded-full border border-[#10b981]/20">
                   <Loader2 size={14} className="animate-spin text-[#10b981]" />
                   <span className="text-[10px] font-black uppercase text-[#10b981] tracking-widest">Trimitere imagine...</span>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-border bg-white">
                <form 
                  onSubmit={(e) => { e.preventDefault(); if (newMessage.trim()) { handleSendMessage(newMessage); setNewMessage(''); } }} 
                  className="flex gap-2 items-center"
                >
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-full text-[#ea9010] hover:bg-[#ea9010]/10"
                    >
                      <ImageIcon size={22} />
                    </Button>
                    <div className="flex-1 flex gap-2 items-center bg-muted/30 p-1 rounded-full border border-border shadow-inner">
                      <Input 
                        value={newMessage} 
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Scrie ceva frumos..." 
                        className="bg-transparent border-none focus-visible:ring-0 text-sm h-11"
                      />
                      <Button type="submit" size="icon" className="h-11 w-11 rounded-full bg-[#37371f] hover:bg-black transition-all shadow-lg active:scale-95 shrink-0">
                        <Send size={18} />
                      </Button>
                    </div>
                </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-30 italic">
             <MessageSquare size={80} className="mb-6 opacity-20" />
             <h2 className="text-2xl font-black uppercase tracking-tighter">Mesajele tale Troky</h2>
             <p className="max-w-xs text-sm font-semibold mt-2">Selectează o discuție din stânga pentru a începe trocul.</p>
          </div>
        )}
      </div>
    </Card>
  )
}
