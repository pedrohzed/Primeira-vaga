"use client";

import { useEffect, useState, useRef } from "react";
import { Send, User as UserIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface UserProfile {
  id: string;
  name: string;
  avatar_url?: string;
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
}

export default function MensagensPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [contacts, setContacts] = useState<UserProfile[]>([]);
  const [activeContact, setActiveContact] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const supabase = createClient();

  useEffect(() => {
    async function loadInitial() {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) return;
      setCurrentUser(data.user);

      // Fetch contacts realistically: any user you have messages with.
      // For simplicity, we just fetch all profiles that are not you (in a real app, query based on applications!)
      const { data: profs } = await supabase.from('profiles').select('id, name, avatar_url').neq('id', data.user.id).limit(10);
      if (profs) setContacts(profs);
      
      setIsLoading(false);
    }
    loadInitial();
  }, [supabase]);

  useEffect(() => {
    if (!currentUser || !activeContact) return;

    // Fetch messages
    async function fetchMessages() {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${activeContact!.id}),and(sender_id.eq.${activeContact!.id},receiver_id.eq.${currentUser.id})`)
        .order('created_at', { ascending: true });
        
      if (data) setMessages(data);
      if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase.channel('chat_messages')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages'
      }, (payload) => {
        const msg = payload.new as Message;
        if (
          (msg.sender_id === currentUser.id && msg.receiver_id === activeContact.id) ||
          (msg.sender_id === activeContact.id && msg.receiver_id === currentUser.id)
        ) {
          setMessages(prev => [...prev, msg]);
          setTimeout(() => {
             if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
          }, 100);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel) };
  }, [currentUser, activeContact, supabase]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeContact || !currentUser) return;

    const content = newMessage.trim();
    setNewMessage("");

    await supabase.from('messages').insert({
      sender_id: currentUser.id,
      receiver_id: activeContact.id,
      content
    });
  };

  if (isLoading) return <div className="p-20 text-center text-white"><Loader2 className="animate-spin h-8 w-8 mx-auto" /></div>;

  return (
    <div className="container mx-auto px-4 py-8 h-[calc(100vh-80px)] max-h-[800px]">
      <div className="bg-zinc-900 border border-white/10 rounded-2xl h-full flex overflow-hidden">
        
        {/* Sidebar / Contatos */}
        <div className="w-1/3 md:w-1/4 border-r border-white/10 bg-zinc-950 flex flex-col">
          <div className="p-4 border-b border-white/10">
            <h2 className="font-bold text-white text-lg">Suas Conversas</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {contacts.map(contact => (
              <button 
                key={contact.id}
                onClick={() => setActiveContact(contact)}
                className={`w-full text-left p-4 flex items-center gap-3 transition-colors border-b border-white/5 ${activeContact?.id === contact.id ? 'bg-purple-900/30 border-l-4 border-l-purple-500' : 'hover:bg-zinc-900'}`}
              >
                <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 overflow-hidden">
                  {contact.avatar_url ? <img src={contact.avatar_url} className="h-full w-full object-cover" /> : <UserIcon className="h-5 w-5 text-zinc-500" />}
                </div>
                <div className="overflow-hidden">
                  <p className="font-medium text-white truncate">{contact.name || "Usuário"}</p>
                </div>
              </button>
            ))}
            {contacts.length === 0 && <p className="text-zinc-500 text-sm p-4 text-center">Nenhum contato encontrado.</p>}
          </div>
        </div>

        {/* Chat Area */}
        <div className="w-2/3 md:w-3/4 flex flex-col bg-zinc-900/50">
          {activeContact ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-white/10 bg-zinc-900 flex items-center gap-3">
                 <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 overflow-hidden">
                  {activeContact.avatar_url ? <img src={activeContact.avatar_url} className="h-full w-full object-cover" /> : <UserIcon className="h-5 w-5 text-zinc-500" />}
                </div>
                <div>
                  <h3 className="font-bold text-white">{activeContact.name}</h3>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-zinc-500">
                    Nenhuma mensagem ainda. Envie a primeira!
                  </div>
                ) : (
                  messages.map(msg => {
                    const isMine = msg.sender_id === currentUser.id;
                    return (
                      <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] rounded-2xl p-3 px-5 ${isMine ? 'bg-purple-600 text-white rounded-tr-none' : 'bg-zinc-800 text-zinc-200 rounded-tl-none'}`}>
                          {msg.content}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Input Form */}
              <form onSubmit={sendMessage} className="p-4 border-t border-white/10 bg-zinc-900 flex gap-2">
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder="Escreva sua mensagem..."
                  className="flex-1 bg-zinc-950 border border-white/10 rounded-full px-5 text-white focus:outline-none focus:border-purple-500"
                />
                <Button type="submit" size="icon" className="rounded-full bg-purple-600 hover:bg-purple-700 shrink-0 h-10 w-10" disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-zinc-500 flex-col gap-4">
              <UserIcon className="h-12 w-12 opacity-20" />
              <p>Selecione um contato para trocar mensagens</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
