"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BriefcaseBusiness, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { clsx } from "clsx";
import { createClient } from "@/lib/supabase/client";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchRole = async (userId: string) => {
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).single();
      if (profile) setRole(profile.role);
    };

    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
        fetchRole(data.user.id);
      } else {
        setUser(null);
        setRole(null);
      }
    };

    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setUser(session.user);
          fetchRole(session.user.id);
        } else {
          setUser(null);
          setRole(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };
  let navLinks = [
    { name: "Vagas", href: "/vagas" },
    { name: "Meu Dashboard", href: "/dashboard" },
  ];

  if (role === 'empresa') {
    navLinks.splice(1, 0, { name: "Postar Vaga", href: "/postar-vaga" });
    navLinks.splice(2, 0, { name: "Ver Currículos", href: "/candidatos" });
  } else if (role === 'candidato') {
    navLinks.splice(1, 0, { name: "Cadastrar Currículo", href: "/cadastro" });
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600 glow-purple">
            <BriefcaseBusiness className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Primeira<span className="text-purple-400">Vaga</span>
          </span>
        </Link>
        {user && (
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "text-sm font-medium transition-colors hover:text-purple-300",
                  pathname === link.href ? "text-purple-400" : "text-zinc-400"
                )}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        )}
        <div className="flex items-center gap-4">
          {!user ? (
            <>
              <Button variant="ghost" className="hidden sm:flex" asChild>
                <Link href="/register">Criar Conta</Link>
              </Button>
              <Button asChild>
                <Link href="/login">Entrar</Link>
              </Button>
            </>
          ) : (
            <Button variant="ghost" onClick={handleLogout} className="text-zinc-400 hover:text-red-400">
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
