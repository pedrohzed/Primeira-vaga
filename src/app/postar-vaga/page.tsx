"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export default function PostarVagaPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("remoto");
  const [salaryRange, setSalaryRange] = useState("");
  const [requirements, setRequirements] = useState("");
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("edit");
    if (id) {
      setEditId(id);
      const fetchJob = async () => {
        const { data } = await supabase.from('jobs').select('*').eq('id', id).single();
        if (data) {
          setTitle(data.title);
          setDescription(data.description);
          setLocation(data.location);
          setType(data.type);
          setSalaryRange(data.salary_range || "");
          setRequirements((data.requirements || []).join("\n"));
          // Also prefill companyName based on company_id
          const { data: comp } = await supabase.from('companies').select('name').eq('id', data.company_id).single();
          if (comp) setCompanyName(comp.name);
        }
      };
      fetchJob();
    }
  }, [supabase]);

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      setError("Você precisa estar logado para postar uma vaga.");
      setIsLoading(false);
      return;
    }

    // Usually we would link to a companies table, but let's safely ensure the user is an 'empresa'
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userData.user.id)
      .single();

    if (profileError || profile?.role !== 'empresa') {
      setError("Apenas usuários com perfil de empresa podem postar vagas.");
      setIsLoading(false);
      return;
    }

    // Create or find company
    let companyId;
    const { data: company, error: companyFetchError } = await supabase
      .from("companies")
      .select("id")
      .eq("user_id", userData.user.id)
      .single();

    if (companyFetchError && companyFetchError.code !== 'PGRST116') {
      setError(companyFetchError.message);
      setIsLoading(false);
      return;
    }

    if (!company) {
      const { data: newCompany, error: createError } = await supabase
        .from("companies")
        .insert({ user_id: userData.user.id, name: companyName })
        .select()
        .single();
      
      if (createError) {
        setError(createError.message);
        setIsLoading(false);
        return;
      }
      companyId = newCompany.id;
    } else {
      companyId = company.id;
    }

    // Insert job
    const reqArray = requirements.split("\n").filter(r => r.trim() !== "");

    const payload = {
      company_id: companyId,
      title,
      description,
      location,
      type,
      salary_range: salaryRange,
      requirements: reqArray,
    };

    let jobError;
    if (editId) {
      const { error } = await supabase.from("jobs").update(payload).eq('id', editId);
      jobError = error;
    } else {
      const { error } = await supabase.from("jobs").insert(payload);
      jobError = error;
    }

    if (jobError) {
      setError(jobError.message);
    } else {
      setSuccess(editId ? "Vaga atualizada com sucesso!" : "Vaga postada com sucesso!");
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    }

    setIsLoading(false);
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">{editId ? "Editar Vaga" : "Postar Nova Vaga"}</h1>
        <p className="mt-2 text-zinc-400">Preencha os detalhes da oportunidade abaixo.</p>
      </div>

      <form onSubmit={handlePostJob} className="space-y-6 rounded-2xl border border-white/10 bg-zinc-900/50 p-8">
        {error && (
          <div className="rounded-lg bg-red-500/10 p-4 text-sm text-red-500 border border-red-500/20">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-lg bg-green-500/10 p-4 text-sm text-green-500 border border-green-500/20">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">Título da Vaga</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-zinc-900/50 px-4 py-3 text-white placeholder-zinc-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              placeholder="Ex: Desenvolvedor Front-end Junior"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">Nome da Empresa</label>
            <input
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-zinc-900/50 px-4 py-3 text-white placeholder-zinc-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              placeholder="Ex: Tech Solutions"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">Localização</label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-zinc-900/50 px-4 py-3 text-white placeholder-zinc-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              placeholder="Ex: São Paulo, SP (ou Remoto)"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">Tipo de Vaga</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-zinc-900/50 px-4 py-3 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="remoto">Remoto</option>
              <option value="híbrido">Híbrido</option>
              <option value="presencial">Presencial</option>
            </select>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-300">Faixa Salarial (Opcional)</label>
          <input
            type="text"
            value={salaryRange}
            onChange={(e) => setSalaryRange(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-zinc-900/50 px-4 py-3 text-white placeholder-zinc-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            placeholder="Ex: R$ 2.000 - R$ 3.000"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-300">Descrição da Vaga</label>
          <textarea
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full rounded-xl border border-white/10 bg-zinc-900/50 px-4 py-3 text-white placeholder-zinc-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            placeholder="Descreva as responsabilidades e o dia a dia da vaga..."
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-300">Requisitos (Um por linha)</label>
          <textarea
            required
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            rows={4}
            className="w-full rounded-xl border border-white/10 bg-zinc-900/50 px-4 py-3 text-white placeholder-zinc-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            placeholder="Ex: Conhecimento em React&#10;Lógica de programação&#10;Inglês técnico"
          />
        </div>

        <Button type="submit" className="w-full h-12 text-base" disabled={isLoading}>
          {isLoading ? (editId ? "Atualizando..." : "Postando...") : (editId ? "Atualizar Vaga" : "Postar Vaga")}
        </Button>
      </form>
    </div>
  );
}
