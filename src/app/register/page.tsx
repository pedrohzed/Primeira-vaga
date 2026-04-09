"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BriefcaseBusiness } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("candidato");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
        },
      },
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else {
      // Force sign in logic to ensure the user receives a token directly, even if Auth has email confirmations on softly
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError("Conta criada, mas ocorreu um erro no login automático. Tente fazer login.");
        setIsLoading(false);
      } else {
        router.push("/vagas");
        router.refresh();
      }
    }
  };

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-16rem)] items-center justify-center px-4 py-12">
      <div className="mx-auto w-full max-w-md space-y-8 rounded-2xl border border-white/10 bg-zinc-900/50 p-8 shadow-2xl backdrop-blur-sm">
        <div className="flex flex-col items-center text-center">
          <Link href="/" className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-600 glow-purple">
            <BriefcaseBusiness className="h-6 w-6 text-white" />
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-white">Criar Conta</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Junte-se à Primeira Vaga hoje mesmo
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          {error && (
            <div className="rounded-lg bg-red-500/10 p-4 text-sm text-red-500 border border-red-500/20">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300" htmlFor="name">
                Nome Completo (ou Razão Social)
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-zinc-900/50 px-4 py-3 text-white placeholder-zinc-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
                placeholder="Seu nome"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-zinc-900/50 px-4 py-3 text-white placeholder-zinc-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300" htmlFor="password">
                Senha
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-zinc-900/50 px-4 py-3 text-white placeholder-zinc-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Você é?
              </label>
              <div className="flex gap-4">
                <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/10 bg-zinc-900/50 p-4 transition-colors hover:bg-zinc-800">
                  <input
                    type="radio"
                    name="role"
                    value="candidato"
                    checked={role === "candidato"}
                    onChange={() => setRole("candidato")}
                    className="text-purple-600 focus:ring-purple-600"
                  />
                  <span className="text-zinc-200">Candidato</span>
                </label>
                <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/10 bg-zinc-900/50 p-4 transition-colors hover:bg-zinc-800">
                  <input
                    type="radio"
                    name="role"
                    value="empresa"
                    checked={role === "empresa"}
                    onChange={() => setRole("empresa")}
                    className="text-purple-600 focus:ring-purple-600"
                  />
                  <span className="text-zinc-200">Empresa</span>
                </label>
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full h-12 text-base" disabled={isLoading}>
            {isLoading ? "Criando conta..." : "Criar Conta"}
          </Button>

          <p className="text-center text-sm text-zinc-400">
            Já tem uma conta?{" "}
            <Link href="/login" className="font-semibold text-purple-400 hover:text-purple-300 transition-colors">
              Entre aqui
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
