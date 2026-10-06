"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Loader2, MessageCircle, Send, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface UserProfile { id: string; name: string; avatar_url?: string | null }
interface Message { id: string; sender_id: string; receiver_id: string; content: string; created_at: string }
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default function MensagensPage() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [contacts, setContacts] = useState<UserProfile[]>([]);
  const [activeContact, setActiveContact] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    let active = true;
    async function loadInitial() {
      const { data, error: authError } = await supabase.auth.getUser();
      if (!active) return;
      if (authError || !data.user) {
        setError("Sua sessão expirou. Entre novamente para acessar as mensagens.");
        setIsLoading(false);
        return;
      }
      const userId = data.user.id;
      setCurrentUserId(userId);
      const rawContactId = new URLSearchParams(window.location.search).get("contact");
      const contactFromUrl = rawContactId && UUID_PATTERN.test(rawContactId) && rawContactId !== userId ? rawContactId : null;

      const { data: userMessages, error: messagesError } = await supabase.from("messages").select("sender_id, receiver_id").or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);
      if (messagesError) setError("Não foi possível carregar suas conversas.");

      const contactIds = new Set<string>();
      userMessages?.forEach((message: { sender_id: string; receiver_id: string }) => contactIds.add(message.sender_id === userId ? message.receiver_id : message.sender_id));
      if (contactFromUrl) contactIds.add(contactFromUrl);

      if (contactIds.size > 0) {
        const { data: profiles, error: profilesError } = await supabase.from("profiles").select("id, name, avatar_url").in("id", [...contactIds]);
        if (profilesError) setError("Não foi possível carregar os contatos.");
        if (active && profiles) {
          setContacts(profiles);
          setActiveContact(profiles.find((profile: UserProfile) => profile.id === contactFromUrl) ?? profiles[0] ?? null);
        }
      }
      if (active) setIsLoading(false);
    }
    void loadInitial();
    return () => { active = false; };
  }, [supabase]);

  useEffect(() => {
    if (!currentUserId || !activeContact) {
      return;
    }
    let active = true;
    const contactId = activeContact.id;
    const addMessage = (message: Message) => setMessages((current) => current.some((item) => item.id === message.id) ? current : [...current, message].sort((a, b) => a.created_at.localeCompare(b.created_at)));

    const fetchMessages = async () => {
      const { data, error: fetchError } = await supabase.from("messages").select("id, sender_id, receiver_id, content, created_at").or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${contactId}),and(sender_id.eq.${contactId},receiver_id.eq.${currentUserId})`).order("created_at", { ascending: true });
      if (!active) return;
      if (fetchError) setError("Não foi possível carregar as mensagens desta conversa.");
      else setMessages(data ?? []);
    };
    void fetchMessages();

    const channel = supabase.channel(`conversation:${currentUserId}:${contactId}`).on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload: { new: Record<string, unknown> }) => {
      const message = payload.new as unknown as Message;
      const belongsToConversation = (message.sender_id === currentUserId && message.receiver_id === contactId) || (message.sender_id === contactId && message.receiver_id === currentUserId);
      if (belongsToConversation) addMessage(message);
    }).subscribe();

    return () => { active = false; void supabase.removeChannel(channel); };
  }, [activeContact, currentUserId, supabase]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const sendMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    const content = newMessage.trim();
    if (!content || !activeContact || !currentUserId || isSending) return;
    setIsSending(true);
    setError(null);
    const { data, error: sendError } = await supabase.from("messages").insert({ sender_id: currentUserId, receiver_id: activeContact.id, content }).select("id, sender_id, receiver_id, content, created_at").single();
    if (sendError) setError("A mensagem não foi enviada. Confira sua conexão e tente novamente.");
    else {
      setNewMessage("");
      setMessages((current) => current.some((item) => item.id === data.id) ? current : [...current, data]);
    }
    setIsSending(false);
  };

  if (isLoading) return <div className="grid min-h-[50vh] place-items-center"><Loader2 className="h-7 w-7 animate-spin text-purple-400" /></div>;

  return (
    <div className="container mx-auto h-[calc(100dvh-72px)] max-w-7xl px-0 py-0 md:h-[760px] md:px-6 md:py-8">
      <div className="flex h-full overflow-hidden border-white/10 bg-zinc-900 md:rounded-2xl md:border">
        <aside className={`w-full border-r border-white/10 bg-[#141b19] md:flex md:w-[320px] md:flex-col ${activeContact ? "hidden" : "flex flex-col"}`}>
          <div className="border-b border-white/10 p-5"><p className="eyebrow">Caixa de entrada</p><h1 className="mt-2 text-2xl font-bold text-white">Conversas</h1></div>
          <div className="flex-1 overflow-y-auto p-2">
            {contacts.map((contact) => (
              <button key={contact.id} onClick={() => { setMessages([]); setActiveContact(contact); setError(null); }} className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors ${activeContact?.id === contact.id ? "bg-white/8" : "hover:bg-white/5"}`}>
                <Avatar profile={contact} />
                <p className="truncate font-semibold text-white">{contact.name || "Usuário"}</p>
              </button>
            ))}
            {contacts.length === 0 && <div className="grid h-full place-items-center p-8 text-center text-sm leading-6 text-zinc-500"><div><MessageCircle className="mx-auto mb-3 h-8 w-8" /><p>Suas conversas com empresas e candidatos aparecerão aqui.</p></div></div>}
          </div>
        </aside>

        <section className={`w-full flex-1 flex-col ${activeContact ? "flex" : "hidden md:flex"}`}>
          {activeContact ? <>
            <header className="flex h-[76px] items-center gap-3 border-b border-white/10 px-4 md:px-6">
              <button className="grid h-10 w-10 place-items-center text-zinc-400 md:hidden" onClick={() => setActiveContact(null)} aria-label="Voltar às conversas"><ArrowLeft className="h-5 w-5" /></button>
              <Avatar profile={activeContact} />
              <div><h2 className="font-bold text-white">{activeContact.name}</h2><p className="text-xs text-zinc-500">Conversa na Primeira Vaga</p></div>
            </header>
            {error && <div role="alert" className="border-b border-red-500/20 bg-red-500/10 px-5 py-3 text-sm text-red-300">{error}</div>}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6">
              {messages.length === 0 ? <div className="grid h-full place-items-center text-center text-zinc-500"><p>Comece a conversa com uma mensagem objetiva.</p></div> : <div className="space-y-3">{messages.map((message) => {
                const mine = message.sender_id === currentUserId;
                return <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}><div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 md:max-w-[68%] ${mine ? "rounded-br-sm bg-purple-600 text-white" : "rounded-bl-sm bg-zinc-800 text-zinc-200"}`}><p className="whitespace-pre-wrap break-words">{message.content}</p><time className={`mt-1 block text-[10px] ${mine ? "text-white/60" : "text-zinc-500"}`}>{new Date(message.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</time></div></div>;
              })}</div>}
            </div>
            <form onSubmit={sendMessage} className="flex gap-2 border-t border-white/10 p-3 md:p-4">
              <label className="sr-only" htmlFor="message">Mensagem</label>
              <input id="message" value={newMessage} onChange={(event) => setNewMessage(event.target.value)} maxLength={2000} placeholder="Escreva uma mensagem" className="h-12 flex-1 rounded-xl border border-white/10 bg-zinc-950 px-4 text-white placeholder:text-zinc-600" />
              <Button type="submit" size="icon" className="h-12 w-12" disabled={!newMessage.trim() || isSending} aria-label="Enviar mensagem">{isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}</Button>
            </form>
          </> : <div className="grid h-full place-items-center text-center text-zinc-500"><div><MessageCircle className="mx-auto mb-4 h-10 w-10" /><p>Escolha uma conversa para começar.</p></div></div>}
        </section>
      </div>
    </div>
  );
}

function Avatar({ profile }: { profile: UserProfile }) {
  return <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-zinc-800">{profile.avatar_url ? <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" /> : <UserIcon className="h-5 w-5 text-zinc-500" />}</div>;
}
