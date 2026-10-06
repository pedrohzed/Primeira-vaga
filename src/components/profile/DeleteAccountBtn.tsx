"use client";
import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function DeleteAccountBtn() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const handleDelete = async () => {
    if (!confirm("CUIDADO: Isso excluirá permanentemente sua conta, vagas e candidaturas. Tem certeza absoluta?")) return;
    setIsDeleting(true);
    setError(null);
    
    // Call the custom RPC we injected to delete users on Supabase safely
    const { error: deleteError } = await supabase.rpc('delete_user');
    if (deleteError) {
      setError("Não foi possível encerrar a conta. Tente novamente ou fale com o suporte.");
      setIsDeleting(false);
      return;
    }
    await supabase.auth.signOut();
    window.location.assign("/");
  }
  
  return (
    <div>
      <Button variant="outline" className="text-red-400 border-red-500/20 hover:bg-red-500/10 w-full sm:w-auto" onClick={handleDelete} disabled={isDeleting}>
        <AlertTriangle className="h-4 w-4 mr-2" /> Encerrar minha conta
      </Button>
      {error && <p className="mt-2 max-w-xs text-xs text-red-300">{error}</p>}
    </div>
  );
}
