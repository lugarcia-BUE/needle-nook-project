import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Nueva contraseña — Teje conmigo" },
      { name: "description", content: "Elegí una nueva contraseña para tu cuenta." },
      { property: "og:title", content: "Nueva contraseña — Teje conmigo" },
      { property: "og:description", content: "Elegí una nueva contraseña para tu cuenta." },
    ],
  }),
  component: Reset,
});

function Reset() {
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pw.length < 8) return void toast.error("La contraseña debe tener al menos 8 caracteres.");
    if (pw !== pw2) return void toast.error("Las contraseñas no coinciden.");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) return void toast.error("No se pudo cambiar. Pedí un nuevo enlace desde “Olvidé mi contraseña”.");
    toast.success("Contraseña actualizada");
    navigate({ to: "/inicio", replace: true });
  }
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={submit} className="w-full max-w-md space-y-4 rounded-3xl border bg-card p-7">
        <h1 className="text-2xl font-semibold">Elegí una nueva contraseña</h1>
        <div><Label htmlFor="a">Nueva contraseña</Label><Input id="a" type="password" className="mt-1 h-12" value={pw} onChange={(e) => setPw(e.target.value)} /></div>
        <div><Label htmlFor="b">Repetila</Label><Input id="b" type="password" className="mt-1 h-12" value={pw2} onChange={(e) => setPw2(e.target.value)} /></div>
        <Button className="h-12 w-full" disabled={busy}>{busy ? "Guardando…" : "Guardar contraseña"}</Button>
      </form>
    </div>
  );
}
