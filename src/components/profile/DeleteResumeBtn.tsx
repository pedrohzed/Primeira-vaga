"use client";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function DeleteResumeBtn({ userId }: { userId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir seu currículo?")) return;
    setIsDeleting(true);
    await supabase.from("profiles").update({ resume_url: null }).eq("id", userId);
    router.refresh();
  }
  return (
    <Button variant="ghost" className="w-full mt-2 text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={handleDelete} disabled={isDeleting}>
      <Trash2 className="h-4 w-4 mr-2" /> Excluir Arquivo PDF
    </Button>
  );
}
