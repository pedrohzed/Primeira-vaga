"use client";

import { useState, useEffect } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function CadastroEmpresaPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();
  
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
        const { data: comp } = await supabase.from('companies').select('*').eq('user_id', data.user.id).single();
        if (comp) {
          setName(comp.name || "");
          setDescription(comp.description || "");
          setWebsite(comp.website || "");
        } else {
          // prefill from profile
          const { data: prof } = await supabase.from('profiles').select('name').eq('id', data.user.id).single();
          if (prof) setName(prof.name);
        }
      }
    }
    loadData();
  }, [supabase]);

  const handleComplete = async () => {
    if (!user) {
      setError("Você precisa estar logado.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { data: comp } = await supabase.from('companies').select('id').eq('user_id', user.id).single();

      if (comp) {
        const { error: updateError } = await supabase
          .from('companies')
          .update({ name, description, website })
          .eq('user_id', user.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('companies')
          .insert({ user_id: user.id, name, description, website });
        if (insertError) throw insertError;
      }

      setSuccess("Perfil empresarial salvo com sucesso!");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);

    } catch (err: any) {
      setError(err.message || "Ocorreu um erro ao salvar o perfil.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Perfil da Empresa</h1>
        <p className="text-zinc-400">Complete os dados para que os candidatos conheçam melhor a sua marca e cultura.</p>
      </div>

      <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6 md:p-8">
        {error && (
           <div className="mb-6 rounded-lg bg-red-500/10 p-4 text-sm text-red-500 border border-red-500/20">
             {error}
           </div>
        )}
        {success && (
           <div className="mb-6 rounded-lg bg-green-500/10 p-4 text-sm text-green-500 border border-green-500/20 flex items-center gap-2">
             <CheckCircle2 className="h-5 w-5" /> {success}
           </div>
        )}

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Nome Oficial da Empresa</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
              placeholder="Ex: Tech Solutions"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Website Oficial (opcional)</label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
              placeholder="Ex: https://minhaempresa.com.br"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Biografia e Descrição</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-zinc-950 border border-white/10 rounded-xl p-4 text-white resize-none focus:outline-none focus:border-purple-500 min-h-[150px]" 
              placeholder="Conte um pouco sobre a história, a missão e a cultura da empresa. Isso atrai muito mais talentos!"
            />
          </div>

          <div className="pt-6 flex justify-end">
            <Button onClick={handleComplete} disabled={isLoading || !name}>
               {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</> : "Concluir Perfil"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
