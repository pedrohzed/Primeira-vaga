"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Target, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JobCard } from "@/components/jobs/JobCard";
import { MOCK_JOBS } from "@/lib/data";

export default function Home() {
  const recentJobs = MOCK_JOBS.slice(0, 3);

  return (
    <div className="flex flex-col flex-1">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/40 via-background to-background z-0" />
        
        <div className="container relative z-10 mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-8"
          >
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">A plataforma da nova geração</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-black tracking-tight mb-8 text-white"
          >
            Encontre seu primeiro <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">
              emprego de forma simples
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-12"
          >
            Damos aquele empurrãozinho para você iniciar sua carreira. Explore milhares de vagas de estágio, jovem aprendiz e vagas júnior.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-8 rounded-full" asChild>
              <Link href="/vagas">
                Ver vagas agora <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg h-14 px-8 rounded-full" asChild>
              <Link href="/cadastro">
                Cadastrar currículo
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-zinc-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Como funciona?</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">Nós simplificamos o processo para você focar no que importa: conseguir sua primeira oportunidade.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Target, title: "Crie seu perfil", desc: "Faça um cadastro rápido e destaque suas habilidades, mesmo sem experiência." },
              { icon: Zap, title: "Encontre vagas", desc: "Use nosso sistema inteligente de tags para filtrar as melhores vagas para o seu perfil." },
              { icon: Sparkles, title: "Aplique em 1 clique", desc: "Esqueça formulários longos. Com seu perfil completo, você se candidata num instante." }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-2xl bg-zinc-900 border border-white/5 hover:border-purple-500/20 transition-colors"
              >
                <div className="h-12 w-12 rounded-xl bg-purple-600/20 flex items-center justify-center mb-6">
                  <feature.icon className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-zinc-400">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Jobs Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-2">Vagas Recentes</h2>
              <p className="text-zinc-400">As oportunidades mais frescas na plataforma.</p>
            </div>
            <Button variant="ghost" className="hidden sm:flex" asChild>
              <Link href="/vagas">Ver todas <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentJobs.map(job => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
          
          <div className="mt-8 text-center sm:hidden">
            <Button variant="outline" className="w-full" asChild>
              <Link href="/vagas">Ver todas as vagas</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
