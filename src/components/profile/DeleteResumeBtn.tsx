"use client";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function DeleteResumeBtn({ userId }: { userId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir seu currículo?")) return;
    setIsDeleting(true);
    setError(null);
    const { data: profile } = await supabase.from("profiles").select("resume_url").eq("id", userId).maybeSingle();
    const { error: updateError } = await supabase.from("profiles").update({ resume_url: null }).eq("id", userId);
    if (updateError) {
      setError("Não foi possível excluir o currículo.");
    } else {
      const marker = "/storage/v1/object/public/curriculos/";
      const path = profile?.resume_url?.includes(marker) ? decodeURIComponent(profile.resume_url.split(marker)[1]) : null;
      if (path) await supabase.storage.from("curriculos").remove([path]);
      router.refresh();
    }
    setIsDeleting(false);
  }
  return (
    <div>
      <Button variant="ghost" className="w-full mt-2 text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={handleDelete} disabled={isDeleting}>
        <Trash2 className="h-4 w-4 mr-2" /> Excluir Arquivo PDF
      </Button>
      {error && <p className="mt-2 text-xs text-red-300">{error}</p>}
    </div>
  );
}
