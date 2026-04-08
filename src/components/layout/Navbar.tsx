"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BriefcaseBusiness } from "lucide-react";
import { Button } from "@/components/ui/button";
import { clsx } from "clsx";

export function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { name: "Vagas", href: "/vagas" },
    { name: "Cadastrar Currículo", href: "/cadastro" },
    { name: "Meu Dashboard", href: "/dashboard" },
  ];

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
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="hidden sm:flex" asChild>
            <Link href="/login">Entrar</Link>
          </Button>
          <Button asChild>
            <Link href="/vagas">Ver Vagas</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
