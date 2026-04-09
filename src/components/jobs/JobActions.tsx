"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function JobActions({ jobId }: { jobId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir esta vaga? Isso removerá as candidaturas associadas também.")) return;
    setIsDeleting(true);
    await supabase.from("jobs").delete().eq("id", jobId);
    router.refresh();
  };

  const handleEdit = () => {
    router.push(`/postar-vaga?edit=${jobId}`);
  };

  return (
    <div className="flex items-center gap-2 mt-4 sm:mt-0">
      <Button variant="outline" size="sm" onClick={handleEdit} className="text-zinc-400 hover:text-white">
        <Edit className="h-4 w-4 mr-2" /> Editar
      </Button>
      <Button variant="outline" size="sm" onClick={handleDelete} disabled={isDeleting} className="text-red-400/50 hover:bg-red-500/10 hover:text-red-400">
        <Trash2 className="h-4 w-4 mr-2" /> Excluir
      </Button>
    </div>
  );
}
