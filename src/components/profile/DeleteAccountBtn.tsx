"use client";
import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function DeleteAccountBtn({ userId }: { userId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleDelete = async () => {
    if (!confirm("CUIDADO: Isso excluirá permanentemente sua conta, vagas e candidaturas. Tem certeza absoluta?")) return;
    setIsDeleting(true);
    
    // Call the custom RPC we injected to delete users on Supabase safely
    await supabase.rpc('delete_user');
    
    await supabase.auth.signOut();
    window.location.href = "/";
  }
  
  return (
    <Button variant="outline" className="text-red-400 border-red-500/20 hover:bg-red-500/10 w-full sm:w-auto" onClick={handleDelete} disabled={isDeleting}>
      <AlertTriangle className="h-4 w-4 mr-2" /> Encerrar minha conta
    </Button>
  );
}
