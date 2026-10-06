"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function JobActions({ jobId, companyId }: { jobId: string; companyId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir esta vaga? Isso removerá as candidaturas associadas também.")) return;
    setIsDeleting(true);
    setError(null);
    const { data, error: deleteError } = await supabase.from("jobs").delete().eq("id", jobId).eq("company_id", companyId).select("id").maybeSingle();
    if (deleteError || !data) setError(deleteError?.message ?? "A vaga não foi encontrada ou você não tem permissão para excluí-la.");
    else router.refresh();
    setIsDeleting(false);
  };

  const handleEdit = () => {
    router.push(`/postar-vaga?edit=${jobId}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mt-4 sm:mt-0">
      <Button variant="outline" size="sm" onClick={handleEdit} className="text-zinc-400 hover:text-white">
        <Edit className="h-4 w-4 mr-2" /> Editar
      </Button>
      <Button variant="outline" size="sm" onClick={handleDelete} disabled={isDeleting} className="text-red-400/50 hover:bg-red-500/10 hover:text-red-400">
        <Trash2 className="h-4 w-4 mr-2" /> Excluir
      </Button>
      {error && <p className="w-full text-xs text-red-300">{error}</p>}
    </div>
  );
}
