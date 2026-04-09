import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Building2, MapPin, Clock, Calendar, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MOCK_JOBS } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";

interface JobPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Em App Router Next.js 15, params é agora uma Promise em funções assíncronas,
// ou pode ser acessado diretamente se não usarmos async, mas a build do Next recomenda await params. 
// Vamos lidar com o mock simplificado.
export default async function JobDetailsPage({ params }: JobPageProps) {
  const p = await params;
  const supabase = await createClient();

  // Try fetching from supbase
  let job: any = null;
  const { data, error } = await supabase
    .from('jobs')
    .select(`
      id, title, description, location, type, requirements, created_at,
      companies ( name )
    `)
    .eq('id', p.id)
    .single();

  if (data) {
    job = {
      id: data.id,
      title: data.title,
      company: data.companies?.name || 'Empresa Confidencial',
      location: data.location,
      type: data.type,
      description: data.description,
      requirements: data.requirements || [],
      tags: [],
      createdAt: data.created_at
    };
  }

  // Fallback to MOCK_JOBS
  if (!job) {
    job = MOCK_JOBS.find((j) => j.id === p.id);
  }

  if (!job) {
    notFound();
  }

  const date = new Date(job.createdAt).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link href="/vagas" className="inline-flex items-center text-sm text-zinc-400 hover:text-purple-400 mb-8 transition-colors">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar para vagas
      </Link>

      <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 md:p-10 mb-8 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="relative z-10">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="space-y-4">
              <h1 className="text-3xl md:text-4xl font-bold text-white">{job.title}</h1>
              
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-zinc-400">
                <span className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-purple-400" />
                  {job.company}
                </span>
                <span className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-purple-400" />
                  {job.location}
                </span>
                <span className="flex items-center gap-2 capitalize">
                  <Clock className="h-5 w-5 text-purple-400" />
                  {job.type}
                </span>
                <span className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-400" />
                  Publicado em {date}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <Button size="lg" className="w-full md:w-auto">
                Candidatar-se agora
              </Button>
              <Button size="lg" variant="secondary" className="w-full md:w-auto">
                Salvar vaga
              </Button>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-white/5 flex flex-wrap gap-2">
            {job.tags.map(tag => (
              <Badge key={tag.id} variant="secondary">{tag.name}</Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Descrição da vaga</h2>
            <div className="prose prose-invert max-w-none text-zinc-300">
              <p>{job.description}</p>
              <p className="mt-4">
                Estamos em busca de pessoas engajadas e que queiram aprender e crescer junto com o nosso negócio. Se você se identifica com essa cultura de colaboração, essa vaga é para você!
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Requisitos</h2>
            <ul className="space-y-3">
              {job.requirements.map((req, index) => (
                <li key={index} className="flex items-start gap-3 text-zinc-300">
                  <CheckCircle2 className="h-6 w-6 text-purple-500 shrink-0" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="space-y-6">
          <div className="bg-zinc-900 border border-white/5 rounded-xl p-6">
            <h3 className="font-bold text-white mb-4">Sobre a empresa</h3>
            <p className="text-sm text-zinc-400 mb-4">A {job.company} é uma empresa inovadora buscando os melhores talentos jovens para integrar seu time revolucionário.</p>
            <Button variant="outline" className="w-full">Ver perfil da empresa</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
