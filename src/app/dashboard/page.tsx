import Link from "next/link";
import { FileText, Bookmark, Settings, CheckCircle2, ChevronRight, BriefcaseBusiness } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  if (profile?.role === 'empresa') {
    const { data: company } = await supabase.from('companies').select('*').eq('user_id', user.id).single();
    let jobs: any[] = [];
    if (company) {
      const { data: qJobs } = await supabase.from('jobs').select('*').eq('company_id', company.id).order('created_at', { ascending: false });
      if (qJobs) jobs = qJobs;
    }

    return (
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-white/5 pb-8">
          <div className="flex items-center gap-6">
            <div className="h-20 w-20 rounded-full bg-purple-900 flex items-center justify-center text-3xl font-bold text-white border-2 border-purple-500 glow-purple uppercase">
              {profile.name?.charAt(0) || 'E'}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{profile.name} <span className="text-sm bg-purple-600/20 text-purple-400 px-2 py-1 rounded ml-2">Empresa</span></h1>
              <p className="text-zinc-400">{user.email}</p>
            </div>
          </div>
          <Button asChild>
            <Link href="/postar-vaga"><BriefcaseBusiness className="h-4 w-4 mr-2" /> Postar Nova Vaga</Link>
          </Button>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <BriefcaseBusiness className="h-6 w-6 text-purple-500" /> Vagas Publicadas ({jobs.length})
          </h2>
          {jobs.length === 0 ? (
            <p className="text-zinc-400">Você ainda não publicou nenhuma vaga.</p>
          ) : (
            <div className="grid gap-4">
              {jobs.map(job => (
                <div key={job.id} className="p-6 rounded-xl bg-zinc-900 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-white text-lg">{job.title}</h3>
                    <p className="text-sm text-zinc-400">{job.location} • {job.type}</p>
                  </div>
                  <Button variant="outline" asChild>
                    <Link href={`/vagas/${job.id}`}>Ver Detalhes</Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Candidato Dashboard
  const completeness = (profile?.bio ? 33 : 0) + (profile?.area ? 33 : 0) + (profile?.resume_url ? 34 : 0);

  const { data: applications } = await supabase
    .from('applications')
    .select('id, status, created_at, jobs(id, title, companies(name))')
    .eq('applicant_id', user.id)
    .order('created_at', { ascending: false });

  const { data: savedJobs } = await supabase
    .from('saved_jobs')
    .select('jobs(id, title, type, location, companies(name))')
    .eq('user_id', user.id);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-white/5 pb-8">
        <div className="flex items-center gap-6">
          <div className="h-20 w-20 rounded-full bg-purple-900 flex items-center justify-center text-3xl font-bold text-white border-2 border-purple-500 glow-purple uppercase">
            {profile?.name?.charAt(0) || 'C'}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">{profile?.name}</h1>
            <p className="text-zinc-400">{profile?.area || 'Buscando oportunidades'} • {user.email}</p>
          </div>
        </div>
        <Button variant="outline" asChild>
          <Link href="/cadastro"><Settings className="h-4 w-4 mr-2" /> Editar Perfil</Link>
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          <div className="bg-zinc-900 border border-white/5 rounded-xl p-6">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-400" /> Status do Currículo
            </h3>
            
            <div className="flex items-center justify-between mb-2">
              <span className="text-zinc-400 text-sm">Completude</span>
              <span className="text-purple-400 font-bold">{completeness}%</span>
            </div>
            <div className="w-full bg-zinc-800 h-2 rounded-full mb-6 overflow-hidden">
              <div className="bg-purple-500 h-full transition-all" style={{ width: `${completeness}%` }}></div>
            </div>

            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-2 text-sm text-zinc-300">
                <CheckCircle2 className={`h-4 w-4 ${profile?.area ? 'text-green-500' : 'text-zinc-600'}`} /> Interesses
              </li>
              <li className="flex items-center gap-2 text-sm text-zinc-300">
                <CheckCircle2 className={`h-4 w-4 ${profile?.bio ? 'text-green-500' : 'text-zinc-600'}`} /> Biografia
              </li>
              <li className="flex items-center gap-2 text-sm text-zinc-300">
                <CheckCircle2 className={`h-4 w-4 ${profile?.resume_url ? 'text-green-500' : 'text-zinc-600'}`} /> Currículo em PDF
              </li>
            </ul>

            {completeness < 100 && (
              <Button className="w-full" asChild>
                <Link href="/cadastro">Completar perfil</Link>
              </Button>
            )}
            {profile?.resume_url && (
              <Button className="w-full mt-2" variant="outline" asChild>
                <a href={profile.resume_url} target="_blank" rel="noopener noreferrer">Visualizar PDF</a>
              </Button>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-12">
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-purple-500" /> Minhas Aplicações
              </h2>
            </div>
            <div className="space-y-4">
              {!applications || applications.length === 0 ? (
                <p className="text-zinc-400">Você ainda não se candidatou a nenhuma vaga.</p>
              ) : applications.map((app: any) => {
                const jobName = app.jobs?.title;
                const companyName = app.jobs?.companies?.name;
                return (
                  <div key={app.id} className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/50 border border-white/5 hover:bg-zinc-900 transition-colors">
                    <div>
                      <Link href={`/vagas/${app.jobs?.id}`} className="font-bold text-white hover:text-purple-400">{jobName}</Link>
                      <p className="text-sm text-zinc-400">{companyName}</p>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <div className="hidden sm:block">
                        <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded inline-block mb-1 capitalize">{app.status.replace('_', ' ')}</span>
                        <p className="text-xs text-zinc-500">Aplicado em {new Date(app.created_at).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-zinc-600" />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Bookmark className="h-6 w-6 text-purple-500" /> Vagas Salvas
              </h2>
            </div>
            <div className="space-y-4">
              {!savedJobs || savedJobs.length === 0 ? (
                <p className="text-zinc-400">Nenhuma vaga salva.</p>
              ) : savedJobs.map((item: any) => {
                const sjob = item.jobs;
                return (
                  <div key={sjob.id} className="p-4 rounded-xl bg-zinc-900/50 border border-white/5">
                    <Link href={`/vagas/${sjob.id}`} className="font-bold text-white hover:text-purple-400 text-lg">{sjob.title}</Link>
                    <p className="text-sm text-zinc-400 mb-2">{sjob.companies?.name} • {sjob.location}</p>
                  </div>
                )
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
