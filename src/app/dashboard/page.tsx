import Link from "next/link";
import { FileText, Bookmark, Settings, CheckCircle2, ChevronRight } from "lucide-react";
import { JobCard } from "@/components/jobs/JobCard";
import { Button } from "@/components/ui/button";
import { MOCK_USER, MOCK_JOBS } from "@/lib/data";

export default function DashboardPage() {
  const savedJobsData = MOCK_JOBS.filter(job => MOCK_USER.savedJobs.includes(job.id));
  const appliedJobsData = MOCK_JOBS.filter(job => MOCK_USER.appliedJobs.some(a => a.jobId === job.id));

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-white/5 pb-8">
        <div className="flex items-center gap-6">
          <div className="h-20 w-20 rounded-full bg-purple-900 flex items-center justify-center text-3xl font-bold text-white border-2 border-purple-500 glow-purple">
            {MOCK_USER.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">{MOCK_USER.name}</h1>
            <p className="text-zinc-400">{MOCK_USER.targetRole} • {MOCK_USER.email}</p>
          </div>
        </div>
        <Button variant="outline" asChild>
          <Link href="/cadastro"><Settings className="h-4 w-4 mr-2" /> Editar Perfil</Link>
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Sidebar Status */}
        <div className="space-y-6">
          <div className="bg-zinc-900 border border-white/5 rounded-xl p-6">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-400" /> Status do Currículo
            </h3>
            
            <div className="flex items-center justify-between mb-2">
              <span className="text-zinc-400 text-sm">Completude</span>
              <span className="text-purple-400 font-bold">85%</span>
            </div>
            <div className="w-full bg-zinc-800 h-2 rounded-full mb-6 overflow-hidden">
              <div className="bg-purple-500 h-full w-[85%]"></div>
            </div>

            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-2 text-sm text-zinc-300">
                <CheckCircle2 className="h-4 w-4 text-green-500" /> Dados básicos
              </li>
              <li className="flex items-center gap-2 text-sm text-zinc-300">
                <CheckCircle2 className="h-4 w-4 text-green-500" /> Interesses
              </li>
              <li className="flex items-center gap-2 text-sm text-zinc-500">
                <div className="h-4 w-4 rounded-full border-2 border-zinc-700" /> Currículo em PDF
              </li>
            </ul>

            <Button className="w-full">Completar perfil</Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-12">
          {/* Minhas Aplicações */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-purple-500" /> Minhas Aplicações
              </h2>
            </div>
            <div className="space-y-4">
              {MOCK_USER.appliedJobs.map((app) => {
                const job = appliedJobsData.find(j => j.id === app.jobId);
                if (!job) return null;
                
                return (
                  <div key={app.id} className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/50 border border-white/5 hover:bg-zinc-900 transition-colors">
                    <div>
                      <Link href={`/vagas/${job.id}`} className="font-bold text-white hover:text-purple-400">{job.title}</Link>
                      <p className="text-sm text-zinc-400">{job.company}</p>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <div className="hidden sm:block">
                        <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded inline-block mb-1">{app.status}</span>
                        <p className="text-xs text-zinc-500">Aplicado em {new Date(app.appliedAt).toLocaleDateString()}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-zinc-600" />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Vagas Salvas */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Bookmark className="h-6 w-6 text-purple-500" /> Vagas Salvas
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {savedJobsData.map(job => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
