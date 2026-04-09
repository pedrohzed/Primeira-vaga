import Link from "next/link";
import { notFound } from "next/navigation";
import { Building2, ArrowLeft, Globe, MapPin, Calendar, BriefcaseBusiness } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface EmpresaPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EmpresaDetailsPage({ params }: EmpresaPageProps) {
  const p = await params;
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  let userRole = 'candidato';
  if (userData?.user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', userData.user.id).single();
    if (profile) userRole = profile.role;
  }

  const { data: company, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', p.id)
    .single();

  if (!company) {
    notFound();
  }

  const { data: jobs } = await supabase
    .from('jobs')
    .select('id, title, location, type, created_at')
    .eq('company_id', company.id)
    .order('created_at', { ascending: false });

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link href="/vagas" className="inline-flex items-center text-sm text-zinc-400 hover:text-purple-400 mb-8 transition-colors">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar para vagas
      </Link>

      <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 md:p-10 mb-8 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-purple-900 border-2 border-purple-500 flex items-center justify-center text-4xl sm:text-5xl font-bold text-white shrink-0 uppercase glow-purple shadow-2xl">
            {company.name.charAt(0)}
          </div>

          <div className="flex-1 space-y-4">
            <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">{company.name}</h1>
            
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-zinc-400">
              <span className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-purple-400" />
                Empresa Parceira
              </span>
              {company.website && (
                <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-purple-300">
                  <Globe className="h-4 w-4 text-purple-400" />
                  {company.website.replace(/^https?:\/\//, '')}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <section className="bg-zinc-900/40 p-6 rounded-2xl border border-white/5">
            <h2 className="text-2xl font-bold text-white mb-4">Sobre a empresa</h2>
            <div className="prose prose-invert max-w-none text-zinc-300 leading-relaxed whitespace-pre-wrap">
              {company.description ? company.description : "Esta empresa ainda não adicionou uma descrição detalhada mas está recrutando novos talentos!"}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <BriefcaseBusiness className="h-6 w-6 text-purple-500" /> Vagas Abertas ({jobs?.length || 0})
            </h2>
            <div className="space-y-4">
              {jobs && jobs.length > 0 ? jobs.map(job => (
                <div key={job.id} className="p-5 rounded-xl bg-zinc-900 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors hover:bg-zinc-800">
                  <div>
                    <h3 className="font-bold text-white text-lg hover:text-purple-400">
                      <Link href={`/vagas/${job.id}`}>{job.title}</Link>
                    </h3>
                    <p className="text-sm text-zinc-400 mt-1">{job.location} • {job.type}</p>
                    <p className="text-xs text-zinc-600 mt-2">Publicado em {new Date(job.created_at).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <Button variant="outline" asChild className="shrink-0">
                    <Link href={`/vagas/${job.id}`}>Ver Detalhes</Link>
                  </Button>
                </div>
              )) : (
                <p className="text-zinc-500 italic p-6 border border-dashed border-white/10 rounded-xl text-center">Nenhuma vaga aberta no momento.</p>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-purple-900/40 to-zinc-900 border border-purple-500/20 rounded-2xl p-6 text-center">
            <h3 className="font-bold text-white mb-2">Trabalhar na {company.name}</h3>
            <p className="text-sm text-zinc-300 mb-6">Acompanhe as oportunidades e prepare seu currículo para se destacar nos processos seletivos desta empresa.</p>
            <div className="space-y-3">
              {userRole !== 'empresa' && (
                <Button className="w-full bg-purple-600 hover:bg-purple-700" asChild>
                  <Link href="/cadastro">Cadastrar meu currículo</Link>
                </Button>
              )}
              <Button className="w-full" variant="outline" asChild>
                <Link href={`/mensagens?contact=${company.user_id}`}>Falar com o Recrutador</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
