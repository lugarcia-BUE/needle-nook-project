import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const BUCKET = "tejido";
const MAX = 20 * 1024 * 1024;

/** Sube un archivo a la carpeta privada del usuario y devuelve la ruta. */
export async function uploadPrivate(file: File, folder: string): Promise<string> {
  if (file.size > MAX) throw new Error("El archivo supera los 20 MB.");
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Sesión no válida.");
  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);
  const path = `${data.user.id}/${folder}/${crypto.randomUUID()}-${safe}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type });
  if (error) throw error;
  return path;
}

export async function removePrivate(path?: string | null) {
  if (path) await supabase.storage.from(BUCKET).remove([path]);
}

/** Enlace temporal firmado (1 hora): los archivos nunca quedan públicos. */
export function useSignedUrl(path?: string | null) {
  return useQuery({
    queryKey: ["signed", path],
    enabled: !!path,
    staleTime: 50 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path!, 3600);
      if (error) throw error;
      return data.signedUrl;
    },
  });
}

export async function openPrivate(path: string) {
  const w = window.open("", "_blank");
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 300);
  if (error || !data) {
    w?.close();
    throw error ?? new Error("No se pudo abrir el archivo");
  }
  if (w) w.location.href = data.signedUrl;
  else window.location.href = data.signedUrl;
}
