import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow, format } from "date-fns";
import { es } from "date-fns/locale";
import { History, Minus, Pencil, Plus, Trash2, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Confirm, ProgressBar, errMsg } from "./common";
import { counterProgress } from "@/lib/calc";
import { qk, useCounterChange, type Counter, type Section } from "@/lib/data";

const ACTION: Record<string, string> = { sumar: "+1", restar: "−1", editar: "Edición manual", deshacer: "Deshacer" };

export function CounterCard({ c, subtitle, sections }: { c: Counter; subtitle?: string | undefined; sections?: Section[] | undefined }) {
  const change = useCounterChange();
  const pct = counterProgress(c.current_value, c.target_value);
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold">{c.name}</h3>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="flex">
          <HistoryDialog counter={c} />
          <CounterForm counter={c} projectId={c.project_id} sections={sections} trigger={<Button variant="ghost" size="icon" aria-label="Editar contador"><Pencil className="h-4 w-4" /></Button>} />
          <DeleteCounter c={c} />
        </div>
      </div>
      <div className="my-4 text-center">
        <div className="font-display text-7xl font-semibold tabular-nums text-primary">{c.current_value}</div>
        <div className="text-sm text-muted-foreground">
          vueltas / filas{c.target_value ? ` de ${c.target_value}` : ""}
        </div>
      </div>
      {pct !== null && <div className="mb-4 space-y-1"><ProgressBar value={pct} /><p className="text-center text-xs text-muted-foreground">{pct}%</p></div>}
      <div className="grid grid-cols-[1fr_2fr] gap-3">
        <Button variant="secondary" className="h-16 text-xl" disabled={c.current_value === 0 || change.isPending} onClick={() => change.mutate({ id: c.id, action: "restar" })} aria-label="Restar una vuelta">
          <Minus className="h-7 w-7" />
        </Button>
        <Button className="h-16 text-xl" onClick={() => change.mutate({ id: c.id, action: "sumar" })} aria-label="Sumar una vuelta">
          <Plus className="h-7 w-7" /> Vuelta
        </Button>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
        <Button variant="ghost" size="sm" disabled={change.isPending} onClick={() => change.mutate({ id: c.id, action: "deshacer" })}><Undo2 className="h-4 w-4" /> Volver al valor anterior</Button>
        <ManualEdit c={c} />
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
        {c.stitches_per_row != null && <><dt className="text-muted-foreground">Puntos por fila</dt><dd>{c.stitches_per_row}</dd></>}
        {c.motif_repeats != null && <><dt className="text-muted-foreground">Repeticiones</dt><dd>{c.motif_repeats}</dd></>}
        <dt className="text-muted-foreground">Última modificación</dt>
        <dd title={format(new Date(c.updated_at), "dd/MM/yyyy HH:mm")}>{formatDistanceToNow(new Date(c.updated_at), { locale: es, addSuffix: true })}</dd>
      </dl>
      {c.notes && <p className="mt-3 whitespace-pre-wrap rounded-lg bg-muted p-3 text-sm">{c.notes}</p>}
    </div>
  );
}

function ManualEdit({ c }: { c: Counter }) {
  const [open, setOpen] = useState(false);
  const [v, setV] = useState(String(c.current_value));
  const change = useCounterChange();
  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); setV(String(c.current_value)); }}>
      <DialogTrigger asChild><Button variant="ghost" size="sm"><Pencil className="h-4 w-4" /> Cambiar número</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Cambiar número de vueltas</DialogTitle></DialogHeader>
        <form onSubmit={(e) => {
          e.preventDefault();
          const n = Number(v);
          if (!Number.isInteger(n) || n < 0) return void toast.error("Ingresá un número entero mayor o igual a cero.");
          change.mutate({ id: c.id, action: "editar", value: n }, { onSuccess: () => { setOpen(false); toast.success("Valor actualizado (queda en el historial)"); } });
        }} className="space-y-4">
          <Input type="number" min={0} step={1} inputMode="numeric" className="h-14 text-2xl" value={v} onChange={(e) => setV(e.target.value)} />
          <Button className="h-12 w-full" disabled={change.isPending}>Guardar</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function HistoryDialog({ counter }: { counter: Counter }) {
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ["history", counter.id],
    enabled: open,
    queryFn: async () => {
      const { data, error } = await supabase.from("counter_history").select("*").eq("counter_id", counter.id).order("created_at", { ascending: false }).limit(100);
      if (error) throw error;
      return data;
    },
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button variant="ghost" size="icon" aria-label="Ver historial"><History className="h-4 w-4" /></Button></DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Historial de “{counter.name}”</DialogTitle></DialogHeader>
        {isLoading ? <p>Cargando…</p> : !data?.length ? <p className="text-muted-foreground">Todavía no hay cambios.</p> : (
          <ul className="divide-y">
            {data.map((h) => (
              <li key={h.id} className={`flex justify-between py-2 text-sm ${h.undone ? "text-muted-foreground line-through" : ""}`}>
                <span>{ACTION[h.action] ?? h.action}: {h.old_value} → {h.new_value}</span>
                <span className="text-muted-foreground">{format(new Date(h.created_at), "dd/MM HH:mm")}</span>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}

function DeleteCounter({ c }: { c: Counter }) {
  const qc = useQueryClient();
  return (
    <Confirm
      trigger={<Button variant="ghost" size="icon" aria-label="Eliminar contador"><Trash2 className="h-4 w-4" /></Button>}
      title="¿Eliminar este contador?"
      description="Se borrará el contador y todo su historial. Esta acción no se puede deshacer."
      onConfirm={async () => {
        const { error } = await supabase.from("counters").delete().eq("id", c.id);
        if (error) return void toast.error(error.message);
        toast.success("Contador eliminado");
        qc.invalidateQueries({ queryKey: qk.counters });
      }}
    />
  );
}

const optInt = (s: string) => (s.trim() === "" ? null : Number(s));

export function CounterForm({ counter, projectId, sections, trigger, projects }: {
  counter?: Counter; projectId?: string; sections?: Section[] | undefined; trigger: React.ReactNode; projects?: { id: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();
  const [f, setF] = useState({
    name: counter?.name ?? "", project_id: counter?.project_id ?? projectId ?? "", section_id: counter?.section_id ?? "",
    target_value: counter?.target_value?.toString() ?? "", stitches_per_row: counter?.stitches_per_row?.toString() ?? "",
    motif_repeats: counter?.motif_repeats?.toString() ?? "", notes: counter?.notes ?? "",
  });
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });
  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!f.name.trim()) return void toast.error("Poné un nombre al contador.");
    if (!f.project_id) return void toast.error("Elegí un proyecto.");
    const nums = { target_value: optInt(f.target_value), stitches_per_row: optInt(f.stitches_per_row), motif_repeats: optInt(f.motif_repeats) };
    for (const [k, n] of Object.entries(nums)) {
      if (n !== null && (!Number.isInteger(n) || n < 0 || (k === "target_value" && n === 0))) return void toast.error("Los números deben ser enteros positivos.");
    }
    const row = { name: f.name.trim().slice(0, 100), project_id: f.project_id, section_id: f.section_id || null, notes: f.notes.slice(0, 2000) || null, ...nums };
    try {
      const { error } = counter ? await supabase.from("counters").update(row).eq("id", counter.id) : await supabase.from("counters").insert(row);
      if (error) throw error;
      toast.success(counter ? "Contador actualizado" : "Contador creado");
      qc.invalidateQueries({ queryKey: qk.counters });
      setOpen(false);
      if (!counter) setF({ ...f, name: "", target_value: "", stitches_per_row: "", motif_repeats: "", notes: "" });
    } catch (err) { toast.error(errMsg(err)); }
  }
  const cls = "mt-1 flex h-11 w-full rounded-md border border-input bg-background px-3";
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[92vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{counter ? "Editar contador" : "Nuevo contador"}</DialogTitle></DialogHeader>
        <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2"><Label>Nombre *</Label><Input className="mt-1 h-11" placeholder="Ej.: Espalda, Patrón de trenzas" value={f.name} onChange={set("name")} /></div>
          {projects && !counter && (
            <div className="sm:col-span-2"><Label>Proyecto *</Label>
              <select className={cls} value={f.project_id} onChange={set("project_id")}><option value="">Elegí un proyecto</option>{projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
            </div>
          )}
          {sections && sections.length > 0 && (
            <div className="sm:col-span-2"><Label>Sección</Label>
              <select className={cls} value={f.section_id} onChange={set("section_id")}><option value="">Todo el proyecto</option>{sections.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
            </div>
          )}
          <div><Label>Objetivo de vueltas</Label><Input type="number" min={1} className="mt-1 h-11" value={f.target_value} onChange={set("target_value")} placeholder="Opcional" /></div>
          <div><Label>Puntos por fila</Label><Input type="number" min={0} className="mt-1 h-11" value={f.stitches_per_row} onChange={set("stitches_per_row")} placeholder="Opcional" /></div>
          <div><Label>Repeticiones de motivo</Label><Input type="number" min={0} className="mt-1 h-11" value={f.motif_repeats} onChange={set("motif_repeats")} placeholder="Opcional" /></div>
          <div className="sm:col-span-2"><Label>Notas</Label><Textarea className="mt-1" value={f.notes} onChange={set("notes")} /></div>
          <Button className="h-12 sm:col-span-2">Guardar</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
