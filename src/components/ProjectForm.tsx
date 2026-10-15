import { useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DIFFICULTIES, STATUSES, TECHNIQUES } from "@/lib/options";
import { uploadPrivate, removePrivate } from "@/lib/files";
import { usePatterns, type Project } from "@/lib/data";
import { errMsg } from "./common";

const schema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio").max(200),
  description: z.string().max(2000),
  notes: z.string().max(5000),
  target_measurements: z.string().max(1000),
  garment_type: z.string().max(100),
});

export const selectCls =
  "mt-1 flex h-11 w-full rounded-md border border-input bg-background px-3 text-base";

export function ProjectForm({ project, trigger }: { project?: Project; trigger: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { data: patterns } = usePatterns();
  const [f, setF] = useState(() => ({
    name: project?.name ?? "",
    description: project?.description ?? "",
    technique: project?.technique ?? "crochet",
    garment_type: project?.garment_type ?? "",
    difficulty: project?.difficulty ?? "",
    start_date: project?.start_date ?? "",
    target_end_date: project?.target_end_date ?? "",
    status: project?.status ?? "activo",
    pattern_id: project?.pattern_id ?? "",
    target_measurements: project?.target_measurements ?? "",
    notes: project?.notes ?? "",
  }));
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) =>
    setF({ ...f, [k]: e.target.value });

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const v = schema.safeParse(f);
    if (!v.success) return void toast.error(v.error.issues[0]?.message ?? "Datos inválidos");
    if (f.start_date && f.target_end_date && f.target_end_date < f.start_date)
      return void toast.error("La fecha estimada de finalización no puede ser anterior al inicio.");
    if (file && !file.type.startsWith("image/"))
      return void toast.error("La fotografía debe ser una imagen.");
    setBusy(true);
    try {
      let cover_path = project?.cover_path ?? null;
      if (file) {
        cover_path = await uploadPrivate(file, "portadas");
        if (project?.cover_path) await removePrivate(project.cover_path);
      }
      const row = {
        ...f,
        name: v.data.name,
        garment_type: f.garment_type || null,
        difficulty: f.difficulty || null,
        start_date: f.start_date || null,
        target_end_date: f.target_end_date || null,
        pattern_id: f.pattern_id || null,
        cover_path,
        finished_at:
          f.status === "terminado" ? (project?.finished_at ?? new Date().toISOString()) : null,
      };
      if (project) {
        const { error } = await supabase.from("projects").update(row).eq("id", project.id);
        if (error) throw error;
        toast.success("Proyecto actualizado");
      } else {
        const { data, error } = await supabase.from("projects").insert(row).select().single();
        if (error) throw error;
        toast.success("Proyecto creado");
        navigate({ to: "/proyectos/$id", params: { id: data.id } });
      }
      qc.invalidateQueries({ queryKey: ["projects"] });
      qc.invalidateQueries({ queryKey: ["project"] });
      setOpen(false);
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{project ? "Editar proyecto" : "Nuevo proyecto"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label>Nombre *</Label>
            <Input
              className="mt-1 h-11"
              value={f.name}
              onChange={set("name")}
              maxLength={200}
              required
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Descripción</Label>
            <Textarea
              className="mt-1"
              value={f.description}
              onChange={set("description")}
              maxLength={2000}
            />
          </div>
          <div>
            <Label>Técnica</Label>
            <select className={selectCls} value={f.technique} onChange={set("technique")}>
              {TECHNIQUES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Prenda u objeto</Label>
            <Input
              className="mt-1 h-11"
              placeholder="Suéter, gorro, manta…"
              value={f.garment_type}
              onChange={set("garment_type")}
              maxLength={100}
            />
          </div>
          <div>
            <Label>Dificultad</Label>
            <select className={selectCls} value={f.difficulty} onChange={set("difficulty")}>
              <option value="">Sin definir</option>
              {DIFFICULTIES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Estado</Label>
            <select className={selectCls} value={f.status} onChange={set("status")}>
              {STATUSES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Fecha de inicio</Label>
            <Input
              type="date"
              className="mt-1 h-11"
              value={f.start_date}
              onChange={set("start_date")}
            />
          </div>
          <div>
            <Label>Finalización estimada</Label>
            <Input
              type="date"
              className="mt-1 h-11"
              value={f.target_end_date}
              onChange={set("target_end_date")}
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Patrón asociado</Label>
            <select className={selectCls} value={f.pattern_id} onChange={set("pattern_id")}>
              <option value="">Ninguno</option>
              {patterns?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
            {!patterns?.length && (
              <p className="mt-1 text-xs text-muted-foreground">
                Podés cargar patrones en la Biblioteca.
              </p>
            )}
          </div>
          <div className="sm:col-span-2">
            <Label>Fotografía principal</Label>
            <Input
              type="file"
              accept="image/*"
              className="mt-1"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Medidas objetivo (cm)</Label>
            <Textarea
              className="mt-1"
              placeholder="Ej.: contorno 96 cm, largo 60 cm, manga 45 cm"
              value={f.target_measurements}
              onChange={set("target_measurements")}
              maxLength={1000}
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Notas</Label>
            <Textarea className="mt-1" value={f.notes} onChange={set("notes")} maxLength={5000} />
          </div>
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="h-11 px-6" disabled={busy}>
              {busy ? "Guardando…" : "Guardar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
