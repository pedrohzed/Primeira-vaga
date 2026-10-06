"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, BookmarkCheck, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function JobActionsCandidate({ jobId, userId }: { jobId: string; userId?: string }) {
  const [hasApplied, setHasApplied] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [pendingAction, setPendingAction] = useState<"apply" | "save" | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [feedback, setFeedback] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const supabase = createClient();
  const router = useRouter();
  const isRealJob = UUID_PATTERN.test(jobId);

  useEffect(() => {
    let active = true;
    async function checkStatus() {
      if (!userId || !isRealJob) {
        if (active) setIsChecking(false);
        return;
      }
      const [applicationResult, savedResult] = await Promise.all([
        supabase.from("applications").select("id").eq("job_id", jobId).eq("applicant_id", userId).maybeSingle(),
        supabase.from("saved_jobs").select("job_id").eq("job_id", jobId).eq("user_id", userId).maybeSingle(),
      ]);
      if (!active) return;
      setHasApplied(Boolean(applicationResult.data));
      setHasSaved(Boolean(savedResult.data));
      setIsChecking(false);
    }
    void checkStatus();
    return () => { active = false; };
  }, [isRealJob, jobId, supabase, userId]);

  const requireLogin = () => {
    if (userId) return false;
    router.push(`/login?next=${encodeURIComponent(`/vagas/${jobId}`)}`);
    return true;
  };

  const handleApply = async () => {
    setFeedback(null);
    if (!isRealJob) {
      setFeedback({ type: "error", text: "Esta é uma vaga de demonstração. A candidatura fica disponível nas vagas publicadas por empresas." });
      return;
    }
    if (requireLogin() || hasApplied) return;
    setPendingAction("apply");

    const { data: profile, error: profileError } = await supabase.from("profiles").select("role, resume_url").eq("id", userId!).single();
    if (profileError) {
      setFeedback({ type: "error", text: "Não foi possível conferir seu perfil. Tente novamente." });
    } else if (profile?.role !== "candidato") {
      setFeedback({ type: "error", text: "Apenas perfis de candidato podem se candidatar." });
    } else if (!profile.resume_url) {
      setFeedback({ type: "error", text: "Adicione seu currículo antes de enviar a candidatura." });
      router.push("/cadastro");
    } else {
      const { error } = await supabase.from("applications").insert({ job_id: jobId, applicant_id: userId, status: "em_analise" });
      if (!error || error.code === "23505") {
        setHasApplied(true);
        setFeedback({ type: "success", text: error ? "Você já havia se candidatado a esta vaga." : "Candidatura enviada. Você pode acompanhar o status no painel." });
        router.refresh();
      } else {
        setFeedback({ type: "error", text: `Não foi possível enviar a candidatura: ${error.message}` });
      }
    }
    setPendingAction(null);
  };

  const handleSave = async () => {
    setFeedback(null);
    if (!isRealJob) {
      setFeedback({ type: "error", text: "Vagas de demonstração não podem ser salvas." });
      return;
    }
    if (requireLogin()) return;
    setPendingAction("save");

    const query = hasSaved
      ? supabase.from("saved_jobs").delete().eq("job_id", jobId).eq("user_id", userId!)
      : supabase.from("saved_jobs").insert({ job_id: jobId, user_id: userId });
    const { error } = await query;
    if (error && error.code !== "23505") {
      setFeedback({ type: "error", text: `Não foi possível atualizar a vaga salva: ${error.message}` });
    } else {
      setHasSaved(!hasSaved || error?.code === "23505");
      setFeedback({ type: "success", text: hasSaved ? "Vaga removida dos seus salvos." : "Vaga salva no seu painel." });
      router.refresh();
    }
    setPendingAction(null);
  };

  return (
    <div className="w-full md:w-auto">
      <div className="flex w-full flex-col gap-3 sm:flex-row">
        <Button size="lg" className={hasApplied ? "bg-emerald-700 hover:bg-emerald-700" : ""} onClick={handleApply} disabled={isChecking || pendingAction !== null || hasApplied}>
          {pendingAction === "apply" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : hasApplied ? <CheckCircle2 className="mr-2 h-4 w-4" /> : null}
          {hasApplied ? "Candidatura enviada" : "Quero me candidatar"}
        </Button>
        <Button size="lg" variant="secondary" onClick={handleSave} disabled={isChecking || pendingAction !== null}>
          {pendingAction === "save" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : hasSaved ? <BookmarkCheck className="mr-2 h-4 w-4 text-purple-400" /> : <Bookmark className="mr-2 h-4 w-4" />}
          {hasSaved ? "Vaga salva" : "Salvar"}
        </Button>
      </div>
      {feedback && <p role="status" className={`mt-3 max-w-md text-sm ${feedback.type === "error" ? "text-red-300" : "text-emerald-300"}`}>{feedback.text}</p>}
    </div>
  );
}
