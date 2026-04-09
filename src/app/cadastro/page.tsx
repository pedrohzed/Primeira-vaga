"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, ChevronRight, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function CadastroCurriculoPage() {
  const [step, setStep] = useState(1);
  const [area, setArea] = useState("");
  const [bio, setBio] = useState("");
  const [file, setFile] = useState<File | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();
  
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
    }
    loadUser();
  }, [supabase]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.type !== "application/pdf") {
        setError("Apenas arquivos PDF são permitidos.");
        return;
      }
      if (selected.size > 5 * 1024 * 1024) {
        setError("O arquivo deve ter no máximo 5MB.");
        return;
      }
      setFile(selected);
      setError(null);
    }
  };

  const handleComplete = async () => {
    if (!user) {
      setError("Você precisa estar logado.");
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      let fileUrl = null;

      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('curriculos')
          .upload(filePath, file, { upsert: true });

        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('curriculos')
          .getPublicUrl(filePath);
          
        fileUrl = publicUrl;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          bio,
          area,
          ...(fileUrl ? { resume_url: fileUrl } : {})
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      router.push("/dashboard");

    } catch (err: any) {
      setError(err.message || "Ocorreu um erro ao salvar o currículo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Crie seu Perfil</h1>
        <p className="text-zinc-400">Complete seus dados para se candidatar às vagas com apenas um clique.</p>
      </div>

      <div className="flex items-center justify-between mb-12 relative">
        <div className="absolute left-0 top-1/2 -z-10 h-0.5 w-full -translate-y-1/2 bg-zinc-800">
          <div className="h-full bg-purple-600 transition-all" style={{ width: step === 1 ? '50%' : '100%' }}></div>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600 outline outline-4 outline-background text-white font-bold">
          {step > 1 ? <Check className="h-5 w-5" /> : "1"}
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-full outline outline-4 outline-background font-bold transition-colors ${step === 2 ? 'bg-purple-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
          2
        </div>
      </div>

      <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6 md:p-8">
        {error && (
          <div className="mb-6 rounded-lg bg-red-500/10 p-4 text-sm text-red-500 border border-red-500/20">
            {error}
          </div>
        )}

        {step === 1 ? (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-6 text-white">Informações Básicas</h2>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Área de interesse principal</label>
              <select 
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full bg-zinc-950 border border-white/10 rounded-lg h-12 px-4 text-white focus:outline-none focus:border-purple-500 appearance-none"
              >
                <option value="">Selecione uma área...</option>
                <option value="ti">Tecnologia (TI)</option>
                <option value="mkt">Marketing</option>
                <option value="adm">Administração</option>
                <option value="design">Design</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Mini Biografia</label>
              <textarea 
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-zinc-950 border border-white/10 rounded-lg p-4 text-white resize-none focus:outline-none focus:border-purple-500 min-h-[120px]" 
                placeholder="Fale um pouco sobre você, seus interesses e o que busca na primeira oportunidade..."
              />
            </div>

            <div className="pt-6 flex justify-end">
              <Button onClick={() => setStep(2)}>
                Próximo passo <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center justify-between text-white">
              Seu Currículo em PDF
            </h2>

            <div className="space-y-2 pt-4">
              <label className="text-sm font-medium text-zinc-300">Upload de Currículo em PDF</label>
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                  file ? 'border-purple-500 bg-purple-500/5' : 'border-zinc-700 bg-zinc-950 hover:border-purple-500/50 hover:bg-purple-500/5'
                }`}
              >
                <input 
                  type="file" 
                  accept=".pdf" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleFileChange}
                />
                <div className="bg-purple-900/30 p-4 rounded-full mb-4">
                  {file ? <Check className="h-8 w-8 text-purple-400" /> : <Upload className="h-8 w-8 text-purple-400" />}
                </div>
                <h4 className="text-white font-medium mb-1">
                  {file ? file.name : "Clique para enviar seu currículo"}
                </h4>
                <p className="text-sm text-zinc-500">
                  {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "Apenas arquivos PDF até 5MB"}
                </p>
              </div>
            </div>

            <div className="pt-6 flex justify-between">
              <Button variant="ghost" onClick={() => setStep(1)} disabled={isLoading}>
                Voltar
              </Button>
              <Button onClick={handleComplete} disabled={isLoading || !file}>
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</> : "Concluir Cadastro"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
