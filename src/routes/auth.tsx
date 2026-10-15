import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import "@lovable.dev/cloud-auth-js/styles.css";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>) => ({ modo: s["modo"] === "registro" ? "registro" : s["modo"] === "recuperar" ? "recuperar" : undefined }) as { modo?: "registro" | "recuperar" },
  head: () => ({
    meta: [
      { title: "Ingresar — Teje conmigo" },
      { name: "description", content: "Ingresá o creá tu cuenta en Teje conmigo." },
      { property: "og:title", content: "Ingresar — Teje conmigo" },
      { property: "og:description", content: "Ingresá o creá tu cuenta en Teje conmigo." },
    ],
  }),
  component: AuthPage,
});

const emailS = z.string().trim().email("Correo electrónico inválido").max(255);
const passS = z.string().min(8, "La contraseña debe tener al menos 8 caracteres").max(72);

function AuthPage() {
  const { modo } = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"ingreso" | "registro" | "recuperar">(modo ?? "ingreso");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => { if (data.user) navigate({ to: "/inicio", replace: true }); });
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const em = emailS.safeParse(email);
    if (!em.success) return void toast.error(em.error.issues[0]?.message ?? "Datos inválidos");
    setBusy(true);
    try {
      if (mode === "recuperar") {
        const { error } = await supabase.auth.resetPasswordForEmail(em.data, { redirectTo: `${window.location.origin}/reset-password` });
        if (error) throw error;
        setSent("Te enviamos un correo con un enlace para crear una nueva contraseña.");
        return;
      }
      const pw = passS.safeParse(password);
      if (!pw.success) return void toast.error(pw.error.issues[0]?.message ?? "Datos inválidos");
      if (mode === "registro") {
        const { error } = await supabase.auth.signUp({
          email: em.data, password: pw.data,
          options: { emailRedirectTo: window.location.origin + "/inicio", data: { display_name: name.trim().slice(0, 80) || undefined } },
        });
        if (error) throw error;
        setSent("¡Listo! Revisá tu correo y hacé clic en el enlace de confirmación para activar la cuenta.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: em.data, password: pw.data });
        if (error) throw new Error(error.message.includes("Invalid") ? "Correo o contraseña incorrectos." : error.message.includes("confirmed") ? "Todavía no confirmaste tu correo." : error.message);
        navigate({ to: "/inicio", replace: true });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo completar la acción.");
    } finally {
      setBusy(false);
    }
  }

  async function social(p: "google" | "lovable") {
    const r = await lovable.auth.signInWithOAuth(p, { redirect_uri: window.location.origin + "/auth" });
    if (r.error) return void toast.error("No se pudo iniciar sesión.");
    if (r.redirected) return;
    navigate({ to: "/inicio", replace: true });
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border bg-card p-7 shadow-sm">
        <Link to="/" className="font-display text-2xl font-semibold text-primary">Teje conmigo</Link>
        <h1 className="mt-4 text-2xl font-semibold">
          {mode === "ingreso" ? "Ingresar" : mode === "registro" ? "Crear cuenta" : "Recuperar contraseña"}
        </h1>
        {sent ? (
          <div className="mt-6 rounded-xl bg-secondary p-4 text-secondary-foreground">{sent}
            <Button variant="link" className="px-0" onClick={() => { setSent(null); setMode("ingreso"); }}>Volver a ingresar</Button>
          </div>
        ) : (
          <>
            <form onSubmit={submit} className="mt-6 space-y-4">
              {mode === "registro" && (
                <div><Label htmlFor="n">Nombre o seudónimo</Label><Input id="n" className="mt-1 h-12" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} /></div>
              )}
              <div><Label htmlFor="e">Correo electrónico</Label><Input id="e" type="email" autoComplete="email" className="mt-1 h-12" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
              {mode !== "recuperar" && (
                <div><Label htmlFor="p">Contraseña</Label><Input id="p" type="password" autoComplete={mode === "registro" ? "new-password" : "current-password"} className="mt-1 h-12" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
              )}
              <Button type="submit" className="h-12 w-full text-base" disabled={busy}>
                {busy ? "Un momento…" : mode === "ingreso" ? "Ingresar" : mode === "registro" ? "Crear cuenta" : "Enviar enlace"}
              </Button>
            </form>
            {mode !== "recuperar" && (
              <div className="mt-5 space-y-3">
                <div className="text-center text-sm text-muted-foreground">o</div>
                <Button variant="outline" className="h-12 w-full" onClick={() => social("google")}>Continuar con Google</Button>
                <button type="button" className="lovable-auth-button w-full" onClick={() => social("lovable")}>Continue with Lovable</button>
              </div>
            )}
            <div className="mt-6 flex flex-col gap-1 text-sm">
              {mode === "ingreso" && <>
                <button className="text-left text-primary hover:underline" onClick={() => setMode("recuperar")}>Olvidé mi contraseña</button>
                <button className="text-left text-primary hover:underline" onClick={() => setMode("registro")}>¿No tenés cuenta? Creala acá</button>
              </>}
              {mode !== "ingreso" && <button className="text-left text-primary hover:underline" onClick={() => setMode("ingreso")}>Ya tengo cuenta</button>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
