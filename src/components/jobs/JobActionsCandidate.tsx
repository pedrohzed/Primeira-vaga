"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle2, Bookmark, BookmarkCheck } from "lucide-react";
import { useRouter } from "next/navigation";

export function JobActionsCandidate({ jobId, userId }: { jobId: string, userId?: string }) {
  const [hasApplied, setHasApplied] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    async function checkStatus() {
      // Check application
      const { data: application } = await supabase
        .from('applications')
        .select('id')
        .eq('job_id', jobId)
        .eq('applicant_id', userId)
        .single();
      
      if (application) setHasApplied(true);

      // Check saved
      const { data: savedJob } = await supabase
        .from('saved_jobs')
        .select('id')
        .eq('job_id', jobId)
        .eq('user_id', userId)
        .single();
      
      if (savedJob) setHasSaved(true);

      setIsLoading(false);
    }
    checkStatus();
  }, [jobId, userId, supabase]);

  const handleApply = async () => {
    if (!userId) {
       alert("Você precisa estar logado para se candidatar!");
       router.push("/login");
       return;
    }
    
    // Validate profile completion
    const { data: profile } = await supabase.from('profiles').select('resume_url').eq('id', userId).single();
    if (!profile?.resume_url) {
       alert("Você precisa cadastrar seu currículo primeiro!");
       router.push("/cadastro");
       return;
    }

    setIsLoading(true);
    const { error } = await supabase.from('applications').insert({
      job_id: jobId,
      applicant_id: userId,
      status: 'pendente'
    });
    
    if (error) {
      alert("Erro ao candidatar-se: " + error.message);
    } else {
      setHasApplied(true);
      alert("Candidatura enviada com sucesso!");
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!userId) {
       router.push("/login");
       return;
    }
    
    setIsLoading(true);
    if (hasSaved) {
      await supabase.from('saved_jobs').delete().eq('job_id', jobId).eq('user_id', userId);
      setHasSaved(false);
    } else {
      await supabase.from('saved_jobs').insert({ job_id: jobId, user_id: userId });
      setHasSaved(true);
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto mt-6 md:mt-0">
      <Button 
        size="lg" 
        className={`w-full md:w-auto ${hasApplied ? 'bg-green-600 hover:bg-green-700' : 'bg-purple-600 hover:bg-purple-700'}`} 
        onClick={handleApply}
        disabled={isLoading || hasApplied}
      >
        {hasApplied ? <><CheckCircle2 className="mr-2 h-4 w-4" /> Candidatura Enviada</> : "Candidatar-se agora"}
      </Button>
      
      <Button 
        size="lg" 
        variant="secondary" 
        className="w-full md:w-auto bg-zinc-800 hover:bg-zinc-700 text-white" 
        onClick={handleSave}
        disabled={isLoading}
      >
        {hasSaved ? <><BookmarkCheck className="mr-2 h-4 w-4 text-purple-400" /> Salvo no Dashboard</> : <><Bookmark className="mr-2 h-4 w-4" /> Salvar vaga</>}
      </Button>
    </div>
  );
}
