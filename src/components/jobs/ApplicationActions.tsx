"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

const options = [
  ["em_analise", "Em análise"],
  ["entrevista", "Entrevista"],
  ["aprovado", "Aprovado"],
  ["recusado", "Não selecionado"],
];

export function ApplicationActions({ applicationId, candidateId, initialStatus }: { applicationId: string; candidateId: string; initialStatus: string }) {
  const [status, setStatus] = useState(initialStatus);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const changeStatus = async (nextStatus: string) => {
    const previous = status;
    setStatus(nextStatus);
    setIsSaving(true);
    setError(null);
    const { error: updateError } = await supabase.from("applications").update({ status: nextStatus }).eq("id", applicationId);
    if (updateError) {
      setStatus(previous);
      setError("Não foi possível atualizar o status.");
    }
    setIsSaving(false);
  };

  return (
    <div className="flex min-w-[190px] flex-col gap-2">
      <label className="text-xs font-bold uppercase tracking-wider text-zinc-500" htmlFor={`status-${applicationId}`}>Etapa do processo</label>
      <select id={`status-${applicationId}`} value={status} onChange={(event) => void changeStatus(event.target.value)} disabled={isSaving} className="h-11 rounded-lg border border-white/10 bg-zinc-950 px-3 text-sm text-white">
        {options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select>
      <Button variant="outline" asChild><Link href={`/mensagens?contact=${candidateId}`}><MessageCircle className="mr-2 h-4 w-4" />Conversar</Link></Button>
      {error && <p className="text-xs text-red-300">{error}</p>}
    </div>
  );
}
