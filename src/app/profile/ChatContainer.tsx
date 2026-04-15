'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Send, User as UserIcon, Package, Check, CheckCheck, Clock, Search, MessageSquare } from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export default function ChatContainer({ currentUser, initialConversations }: { currentUser: any, initialConversations: any[] }) {
  const [conversations, setConversations] = useState(initialConversations)
  const [selectedChat, setSelectedChat] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    const sidebarChannel = supabase
      .channel('sidebar-updates')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages'
      }, (payload) => {
        const msg = payload.new
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
            const isRelevant = 
                (msg.sender_id === currentUser.id && msg.receiver_id === selectedChat.other_user_id) ||
                (msg.sender_id === selectedChat.other_user_id && msg.receiver_id === currentUser.id)
            
            if (isRelevant) {
                setMessages(prev => {
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
    } else {
        setMessages(prev => prev.map(m => m.id === tempId ? { ...data, status: 'sent' } : m))
    }
  }

  return (
    <Card className="grid grid-cols-1 md:grid-cols-12 h-[750px] border-border shadow-2xl shadow-black/5 rounded-3xl overflow-hidden bg-background">
      
      {/* SIDEBAR CONVERSATIONS (4/12) */}
      <div className="md:col-span-4 border-r border-border flex flex-col bg-muted/5">
        <div className="p-6 border-b border-border bg-white/40 backdrop-blur-md">
            <h3 className="text-sm font-black tracking-widest uppercase mb-4">Mesaje Recente</h3>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                <Input placeholder="Caută în mesaje..." className="h-9 pl-9 rounded-xl border-border bg-background/50 text-xs font-semibold" />
            </div>
        </div>
        
        <ScrollArea className="flex-1">
            <div className="divide-y divide-border/40">
                {conversations.length > 0 ? conversations.map((chat: any) => {
                    const isSelected = selectedChat?.listing_id === chat.listing_id && selectedChat?.other_user_id === chat.other_user_id
                    return (
                        <button 
                            key={`${chat.listing_id}-${chat.other_user_id}`} 
                            onClick={() => setSelectedChat(chat)}
                            className={cn(
                                "w-full p-5 text-left transition-all relative flex items-center gap-4 hover:bg-muted/30",
                                isSelected ? "bg-white shadow-inner" : ""
                            )}
                        >
                            <Avatar className="h-12 w-12 rounded-2xl border-2 border-background shadow-sm">
                                <AvatarFallback className="bg-[#37371f] text-white font-black text-lg">
                                    {chat.other_user_name?.charAt(0).toUpperCase() || '?'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-0.5">
                                    <span className="font-bold text-sm text-foreground truncate">{chat.other_user_name || 'Utilizator'}</span>
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase">{new Date(chat.last_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <div className="flex items-center gap-1.5 mb-1">
                                    <Package size={10} className="text-[#ea9010]" />
                                    <span className="text-[10px] font-black uppercase text-muted-foreground/80 truncate">{chat.listing_title}</span>
                                </div>
                                <p className="text-xs text-muted-foreground truncate opacity-70 font-medium italic">
                                    {chat.last_message}
                                </p>
                            </div>
                            {isSelected && (
                                <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-[#ea9010] rounded-l-full" />
                            )}
                        </button>
                    )
                }) : (
                    <div className="p-12 text-center text-muted-foreground text-xs font-bold uppercase tracking-widest italic opacity-50">
                        Nicio conversație
                    </div>
                )}
            </div>
        </ScrollArea>
      </div>

      {/* CHAT AREA (8/12) */}
      <div className="md:col-span-8 flex flex-col bg-white">
        {selectedChat ? (
          <>
            {/* CHAT HEADER */}
            <div className="p-4 border-b border-border flex items-center justify-between bg-white/80 backdrop-blur-md z-10 shadow-sm">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9 border border-border">
                    <AvatarFallback className="bg-[#10b981] text-white font-bold text-sm">
                        {selectedChat.other_user_name?.charAt(0)}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <h4 className="font-bold text-sm">{selectedChat.other_user_name}</h4>
                    <div className="flex items-center gap-1.5 leading-none">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground">Activ acum</span>
                    </div>
                </div>
              </div>
              <Badge variant="outline" className="rounded-lg font-bold border-border bg-muted/20 text-[10px] uppercase px-3 py-1">
                {selectedChat.listing_title}
              </Badge>
            </div>

            {/* MESSAGES VIEWPORT */}
            <div 
                ref={scrollRef} 
                className="flex-1 overflow-y-auto p-8 flex flex-col gap-6 bg-[#fbfbf6]"
                style={{ backgroundImage: 'radial-gradient(#37371f08 1.5px, transparent 1.5px)', backgroundSize: '30px 30px' }}
            >
              {messages.map((m: any) => {
                const isMe = m.sender_id === currentUser.id
                return (
                  <div 
                    key={m.id} 
                    className={cn(
                      "max-w-[80%] flex flex-col gap-1 animate-in fade-in slide-in-from-bottom-2 duration-300",
                      isMe ? "self-end items-end" : "self-start items-start"
                    )}
                  >
                    <div 
                        className={cn(
                            "px-5 py-3 text-sm font-medium shadow-xl shadow-black/5 transition-all text-sm",
                            isMe 
                                ? "bg-[#37371f] text-white rounded-[20px] rounded-br-[4px]" 
                                : "bg-white text-foreground rounded-[20px] rounded-bl-[4px] border border-border/60"
                        )}
                    >
                        {m.content}
                        <div className={cn(
                            "flex items-center justify-end gap-1.5 text-[9px] font-bold mt-1.5 uppercase tracking-tighter opacity-60",
                            isMe ? "text-white/80" : "text-muted-foreground"
                        )}>
                            {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {isMe && (
                                m.status === 'sending' ? <Clock size={8} /> : 
                                m.read_state ? <CheckCheck size={10} className="text-[#30f2f2]" /> : <Check size={10} />
                            )}
                        </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* INPUT AREA */}
            <div className="p-6 border-top border-border bg-white">
                <form onSubmit={handleSendMessage} className="flex gap-3 items-center bg-muted/30 p-1.5 rounded-full border border-border shadow-inner">
                    <Input 
                        value={newMessage} 
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Trimite un mesaj prietenos..." 
                        className="flex-1 bg-transparent border-none focus-visible:ring-0 text-sm font-medium px-4 h-11"
                    />
                    <Button type="submit" size="icon" className="h-11 w-11 rounded-full bg-[#37371f] hover:bg-[#10b981] transition-all shadow-lg active:scale-90">
                        <Send size={18} className="translate-x-0.5 -translate-y-0.5" />
                    </Button>
                </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-muted/5">
             <div className="w-24 h-24 rounded-full bg-muted/20 flex items-center justify-center mb-8 border border-border/40">
                <MessageSquare size={48} className="text-muted-foreground/30" />
             </div>
             <h2 className="text-xl font-black uppercase tracking-tight text-foreground mb-2">Cutia poștală Troky</h2>
             <p className="text-muted-foreground font-semibold italic text-sm max-w-xs">
                Selectează o conversație pentru a vedea detaliile barterului.
             </p>
          </div>
        )}
      </div>
    </Card>
  )
}
