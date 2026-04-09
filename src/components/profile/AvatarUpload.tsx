"use client";
import { useState, useRef, useEffect } from "react";
import { Camera, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function AvatarUpload({ userId }: { userId: string }) {
  const [isUploading, setIsUploading] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    supabase.from('profiles').select('avatar_url').eq('id', userId).single().then(({ data }) => {
      if (data?.avatar_url) setUrl(data.avatar_url);
    });
  }, [userId, supabase]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", userId);
      setUrl(publicUrl);
      router.refresh();
      
    } catch (err) {
      console.error(err);
      alert("Erro ao enviar foto de perfil.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="relative group cursor-pointer inline-block" onClick={() => fileInputRef.current?.click()}>
      <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full overflow-hidden bg-zinc-800 border-4 border-purple-500/30 group-hover:border-purple-500 transition-colors flex justify-center items-center relative">
        {url ? (
          <img src={url} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <span className="text-4xl text-zinc-600">?</span>
        )}
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
           {isUploading ? <Loader2 className="animate-spin text-white h-6 w-6" /> : <Camera className="text-white h-6 w-6" />}
        </div>
      </div>
      <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleUpload} />
    </div>
  );
}
