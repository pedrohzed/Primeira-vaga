"use client";

import { useState } from "react";
import { Upload, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CadastroCurriculoPage() {
  const [step, setStep] = useState(1);

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Crie seu Perfil</h1>
        <p className="text-zinc-400">Complete seus dados para se candidatar às vagas com apenas um clique.</p>
      </div>

      {/* Progress Bar (Mock) */}
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
        {step === 1 ? (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-6 text-white">Informações Básicas</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Nome completo</label>
                <input type="text" className="w-full bg-zinc-950 border border-white/10 rounded-lg h-12 px-4 text-white focus:outline-none focus:border-purple-500" placeholder="Ex: João da Silva" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Data de Nascimento</label>
                <input type="date" className="w-full bg-zinc-950 border border-white/10 rounded-lg h-12 px-4 text-white focus:outline-none focus:border-purple-500" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Email</label>
              <input type="email" className="w-full bg-zinc-950 border border-white/10 rounded-lg h-12 px-4 text-white focus:outline-none focus:border-purple-500" placeholder="seu@email.com" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Área de interesse</label>
              <select className="w-full bg-zinc-950 border border-white/10 rounded-lg h-12 px-4 text-white focus:outline-none focus:border-purple-500 appearance-none">
                <option value="">Selecione uma área...</option>
                <option value="ti">Tecnologia (TI)</option>
                <option value="mkt">Marketing</option>
                <option value="adm">Administração</option>
                <option value="design">Design</option>
              </select>
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
              Seu Currículo
            </h2>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Mini Biografia</label>
              <textarea 
                className="w-full bg-zinc-950 border border-white/10 rounded-lg p-4 text-white resize-none focus:outline-none focus:border-purple-500 min-h-[120px]" 
                placeholder="Fale um pouco sobre você, seus interesses e o que busca na primeira oportunidade..."
              />
            </div>

            <div className="space-y-2 pt-4">
              <label className="text-sm font-medium text-zinc-300">Upload de Currículo em PDF</label>
              <div className="border-2 border-dashed border-zinc-700 bg-zinc-950 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-purple-500/50 hover:bg-purple-500/5 transition-all">
                <div className="bg-purple-900/30 p-4 rounded-full mb-4">
                  <Upload className="h-8 w-8 text-purple-400" />
                </div>
                <h4 className="text-white font-medium mb-1">Clique para enviar seu currículo</h4>
                <p className="text-sm text-zinc-500">Apenas arquivos PDF até 5MB</p>
              </div>
            </div>

            <div className="pt-6 flex justify-between">
              <Button variant="ghost" onClick={() => setStep(1)}>
                Voltar
              </Button>
              <Button onClick={() => alert('Mock: Perfil salvo com sucesso!')}>
                Concluir Cadastro
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
