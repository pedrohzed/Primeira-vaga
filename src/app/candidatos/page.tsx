import Link from "next/link";
import { CheckCircle2, ChevronRight, FileText, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export default async function CandidatosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Ensure they are an empresa
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  if (profile?.role !== 'empresa') {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-3xl font-bold mb-4">Acesso Negado</h1>
        <p className="text-zinc-400 mb-8">Esta página é restrita para empresas visualizar currículos.</p>
        <Button asChild><Link href="/dashboard">Voltar ao Início</Link></Button>
      </div>
    );
  }

  // Get company
  const { data: company } = await supabase.from('companies').select('*').eq('user_id', user.id).single();
  
  if (!company) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-3xl font-bold mb-4">Empresa Não Encontrada</h1>
        <p className="text-zinc-400">Você precisa ter um perfil de empresa válido.</p>
      </div>
    );
  }

  // Fetch applications for all jobs posted by this company
  // We join jobs and profiles of the applicants
  const { data: applications } = await supabase
    .from('applications')
    .select(`
      id,
      status,
      created_at,
      jobs (id, title),
      profiles (
        id, name, bio, area, resume_url
      )
    `)
    // Normally we filter where job.company_id = company.id
    // Supabase JS allows inner joins, but we can just fetch jobs for company then applications, or filter applications manually.
    // For simplicity, let's fetch all applications and filter in memory if the relation is too deep for straightforward PostgREST
    // Actually, we can just do:
    .order('created_at', { ascending: false });

  // Fetch jobs of this company separately for clean filtering
  const { data: myJobs } = await supabase.from('jobs').select('id, title').eq('company_id', company.id);
  const myJobIds = myJobs?.map(j => j.id) || [];

  const companyApplications = applications?.filter((app: any) => myJobIds.includes(app.jobs?.id)) || [];

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="mb-12 border-b border-white/5 pb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
          <User className="h-8 w-8 text-purple-500" /> Banco de Currículos Recebidos
        </h1>
        <p className="text-zinc-400">Analise os candidatos que aplicaram para suas vagas publicadas.</p>
      </div>

      <div className="space-y-6">
        {companyApplications.length === 0 ? (
          <div className="text-center bg-zinc-900 border border-white/5 rounded-xl p-12">
            <h3 className="text-xl font-bold text-white mb-2">Nenhum candidato ainda</h3>
            <p className="text-zinc-400">Assim que os candidatos aplicarem nas suas vagas, os currículos aparecerão aqui.</p>
          </div>
        ) : (
          companyApplications.map((app: any) => (
            <div key={app.id} className="p-6 rounded-xl bg-zinc-900 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-purple-900 flex items-center justify-center font-bold text-lg text-white">
                    {app.profiles?.name?.charAt(0) || 'C'}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">{app.profiles?.name}</h3>
                    <p className="text-zinc-400 text-sm mb-2">Candidatou-se a: <Link href={`/vagas/${app.jobs?.id}`} className="text-purple-400 hover:underline">{app.jobs?.title}</Link></p>
                    <p className="text-zinc-500 text-sm mt-2">{app.profiles?.bio || "Sem biografia fornecida."}</p>
                    
                    <div className="mt-3 flex gap-2">
                      <span className="text-xs bg-zinc-800 text-zinc-300 px-2 py-1 rounded">
                        Área: {app.profiles?.area || 'Não declarada'}
                      </span>
                      <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded uppercase">
                        {app.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 md:w-auto w-full md:border-l md:border-white/5 md:pl-6 md:ml-4">
                {app.profiles?.resume_url ? (
                  <Button variant="outline" className="w-full sm:w-auto" asChild>
                    <a href={app.profiles.resume_url} target="_blank" rel="noopener noreferrer">
                      <FileText className="h-4 w-4 mr-2" /> PDF Original
                    </a>
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full sm:w-auto opacity-50 cursor-not-allowed" disabled>
                    Sem Anexo
                  </Button>
                )}
                <Button className="w-full sm:w-auto" variant="default" asChild>
                  <Link href={`mailto:${app.profiles?.id}@exemplo.com`}>Agendar Entrevista</Link>
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
