"use client";

import { useState } from "react";
import { Search, Filter } from "lucide-react";
import { JobCard } from "@/components/jobs/JobCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MOCK_JOBS, TAGS } from "@/lib/data";

export default function VagasPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const filteredJobs = MOCK_JOBS.filter((job) => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          job.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = selectedTag ? job.tags.some(t => t.id === selectedTag) : true;
    
    return matchesSearch && matchesTag;
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Explorar Vagas</h1>
        <p className="text-zinc-400 text-lg max-w-2xl">
          Encontre a oportunidade perfeita para você. Use os filtros abaixo para refinar sua busca.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className="w-full lg:w-1/4 space-y-6">
          <div className="p-6 rounded-xl border border-white/5 bg-zinc-900/50">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Filter className="h-5 w-5" /> Filtros
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-zinc-400 mb-2 block">Tipo de Vaga</label>
                <div className="space-y-2">
                  {['Remoto', 'Híbrido', 'Presencial'].map(type => (
                    <label key={type} className="flex items-center gap-2 text-zinc-200">
                      <input type="checkbox" className="rounded border-zinc-700 bg-zinc-800 text-purple-600 focus:ring-purple-600" />
                      {type}
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="pt-4 border-t border-white/5">
                <label className="text-sm font-medium text-zinc-400 mb-3 block">Tags e Habilidades</label>
                <div className="flex flex-wrap gap-2">
                  <Badge 
                    variant={selectedTag === null ? "default" : "secondary"}
                    className="cursor-pointer"
                    onClick={() => setSelectedTag(null)}
                  >
                    Todas
                  </Badge>
                  {TAGS.map(tag => (
                    <Badge 
                      key={tag.id}
                      variant={selectedTag === tag.id ? "default" : "secondary"}
                      className="cursor-pointer"
                      onClick={() => setSelectedTag(tag.id)}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full lg:w-3/4">
          <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
            <input
              type="text"
              placeholder="Buscar por cargo, empresa ou palavra-chave..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-14 pl-12 pr-4 rounded-xl border border-white/10 bg-zinc-900/30 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all placeholder:text-zinc-500"
            />
          </div>

          <div className="mb-6 text-sm text-zinc-400">
            Mostrando <span className="text-white font-medium">{filteredJobs.length}</span> vagas encontradas
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))
            ) : (
              <div className="col-span-full py-12 text-center border border-dashed border-white/10 rounded-xl">
                <p className="text-zinc-400">Nenhuma vaga encontrada com os filtros atuais.</p>
                <Button variant="link" onClick={() => { setSearchTerm(""); setSelectedTag(null); }}>
                  Limpar filtros
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
