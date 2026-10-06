"use client";

import { useEffect, useState } from "react";
import { Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function CompanyFollowButton({ companyId, userId }: { companyId: string; userId: string }) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    let active = true;
    async function load() {
      const [likeResult, countResult] = await Promise.all([
        supabase.from("company_follows").select("company_id").eq("company_id", companyId).eq("user_id", userId).maybeSingle(),
        supabase.rpc("company_follow_count", { company_id_input: companyId }),
      ]);
      if (!active) return;
      if (likeResult.error || countResult.error) setError("Recurso indisponível até a atualização do banco ser aplicada.");
      else {
        setLiked(Boolean(likeResult.data));
        setCount(Number(countResult.data ?? 0));
      }
      setIsLoading(false);
    }
    void load();
    return () => { active = false; };
  }, [companyId, supabase, userId]);

  const toggleLike = async () => {
    setIsLoading(true);
    setError(null);
    const { error: mutationError } = liked
      ? await supabase.from("company_follows").delete().eq("company_id", companyId).eq("user_id", userId)
      : await supabase.from("company_follows").insert({ company_id: companyId, user_id: userId });
    if (mutationError && mutationError.code !== "23505") setError("Não foi possível atualizar agora. Tente novamente.");
    else {
      setLiked(!liked || mutationError?.code === "23505");
      setCount((value) => Math.max(0, value + (liked ? -1 : 1)));
    }
    setIsLoading(false);
  };

  return (
    <div>
      <Button variant={liked ? "secondary" : "outline"} className="w-full" onClick={toggleLike} disabled={isLoading || Boolean(error)} aria-pressed={liked}>
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Heart className={`mr-2 h-4 w-4 ${liked ? "fill-purple-400 text-purple-400" : ""}`} />}
        {liked ? "Empresa curtida" : "Curtir empresa"} {count > 0 && `· ${count}`}
      </Button>
      {error && <p className="mt-2 text-xs leading-5 text-red-300">{error}</p>}
    </div>
  );
}
