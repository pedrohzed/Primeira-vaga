import Link from "next/link";
import { Github, Twitter, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-background/80 mt-auto">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4 md:col-span-2">
            <h3 className="text-lg font-bold text-white">Primeira Vaga</h3>
            <p className="text-zinc-400 text-sm max-w-sm">
              Conectando jovens talentos às melhores oportunidades de estágio e primeiro emprego do mercado.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-zinc-100 mb-4">Plataforma</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li><Link href="/vagas" className="hover:text-purple-400 transition-colors">Vagas</Link></li>
              <li><Link href="/cadastro" className="hover:text-purple-400 transition-colors">Cadastrar Currículo</Link></li>
              <li><Link href="/empresas" className="hover:text-purple-400 transition-colors">Para Empresas</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-zinc-100 mb-4">Siga-nos</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-zinc-400 hover:text-purple-400 transition-colors"><Twitter className="h-5 w-5" /></a>
              <a href="#" className="text-zinc-400 hover:text-purple-400 transition-colors"><Linkedin className="h-5 w-5" /></a>
              <a href="#" className="text-zinc-400 hover:text-purple-400 transition-colors"><Github className="h-5 w-5" /></a>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-white/5 pt-8 text-center text-sm text-zinc-500">
          <p>&copy; {new Date().getFullYear()} Primeira Vaga. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
