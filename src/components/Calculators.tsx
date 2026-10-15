import { useState } from "react";
import { Calculator, BookmarkPlus, Trash2, Info, ArrowRight, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Confirm, Empty, Loading } from "@/components/common";
import { ruleOfThree, gauge, fmt } from "@/lib/calc";
import {
  useProjects,
  useCalculations,
  useSaveCalculation,
  useDeleteCalculation,
  type Calculation,
} from "@/lib/data";

export function RuleOfThreeCalculator({ defaultProjectId }: { defaultProjectId?: string }) {
  const [original, setOriginal] = useState("20");
  const [refMeasure, setRefMeasure] = useState("10");
  const [newMeasure, setNewMeasure] = useState("35");
  const [title, setTitle] = useState("Regla de tres: puntos / cm");
  const [projectId, setProjectId] = useState(defaultProjectId ?? "");
  const [saveOpen, setSaveOpen] = useState(false);

  const { data: projects } = useProjects();
  const saveCalc = useSaveCalculation();

  const res = ruleOfThree(original, refMeasure, newMeasure);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) {
      toast.error("Seleccioná un proyecto para guardar el cálculo.");
      return;
    }
    if (!res.ok) {
      toast.error("Completá los datos antes de guardar.");
      return;
    }
    await saveCalc.mutateAsync({
      project_id: projectId,
      kind: "regla_de_tres",
      title: title.trim() || "Regla de tres",
      inputs: {
        original,
        refMeasure,
        newMeasure,
      },
      result: {
        value: res.value,
        rounded: res.rounded,
        steps: res.steps,
      },
    });
    setSaveOpen(false);
  };

  return (
    <Card className="border-muted/60 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2 text-primary">
          <Calculator className="h-5 w-5" />
          <CardTitle className="text-xl">Regla de tres simple</CardTitle>
        </div>
        <CardDescription>
          Calculá proporcionalmente puntos, vueltas o medidas según una referencia conocida.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="rot-orig">Valor de referencia</Label>
            <Input
              id="rot-orig"
              placeholder="Ej: 20 (puntos)"
              value={original}
              onChange={(e) => setOriginal(e.target.value)}
              className="mt-1.5 h-11"
            />
            <p className="mt-1 text-xs text-muted-foreground">Ej: 20 puntos</p>
          </div>
          <div>
            <Label htmlFor="rot-ref">Medida correspondiente (cm)</Label>
            <Input
              id="rot-ref"
              placeholder="Ej: 10 (cm)"
              value={refMeasure}
              onChange={(e) => setRefMeasure(e.target.value)}
              className="mt-1.5 h-11"
            />
            <p className="mt-1 text-xs text-muted-foreground">Ej: 10 cm</p>
          </div>
          <div>
            <Label htmlFor="rot-new">Nueva medida deseada (cm)</Label>
            <Input
              id="rot-new"
              placeholder="Ej: 35 (cm)"
              value={newMeasure}
              onChange={(e) => setNewMeasure(e.target.value)}
              className="mt-1.5 h-11"
            />
            <p className="mt-1 text-xs text-muted-foreground">Ej: 35 cm</p>
          </div>
        </div>

        {/* Resultado */}
        {res.ok ? (
          <div className="rounded-xl border bg-accent/30 p-5 space-y-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b pb-3">
              <div>
                <span className="text-sm font-medium text-muted-foreground">
                  Nuevo valor estimado
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold tracking-tight text-primary">
                    {res.rounded}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    (exacto: {fmt(res.value, 2)})
                  </span>
                </div>
              </div>

              {projects && projects.length > 0 && (
                <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="h-10 gap-1.5">
                      <BookmarkPlus className="h-4 w-4" /> Guardar en proyecto
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Guardar cálculo en un proyecto</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSave} className="space-y-4 pt-2">
                      <div>
                        <Label htmlFor="save-title">Título o descripción del cálculo</Label>
                        <Input
                          id="save-title"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="Ej: Puntos para ancho de espalda"
                          className="mt-1.5 h-11"
                        />
                      </div>
                      <div>
                        <Label htmlFor="save-proj">Proyecto</Label>
                        <select
                          id="save-proj"
                          className="mt-1.5 flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
                          value={projectId}
                          onChange={(e) => setProjectId(e.target.value)}
                          required
                        >
                          <option value="">Seleccioná un proyecto…</option>
                          {projects.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
                        Resultado: <b>{res.rounded}</b> ({fmt(res.value, 2)}) a partir de {original}{" "}
                        / {refMeasure} cm → {newMeasure} cm.
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="ghost" onClick={() => setSaveOpen(false)}>
                          Cancelar
                        </Button>
                        <Button type="submit" disabled={saveCalc.isPending}>
                          {saveCalc.isPending ? "Guardando…" : "Confirmar y guardar"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Procedimiento paso a paso
              </p>
              <ul className="space-y-1.5 text-sm text-foreground/90">
                {res.steps.map((s, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <ArrowRight className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-muted-foreground">
                Fórmula:{" "}
                <code>nuevo valor = valor original × nueva medida ÷ medida de referencia</code>
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed p-4 text-center text-sm text-muted-foreground">
            {res.error}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function GaugeCalculator({ defaultProjectId }: { defaultProjectId?: string }) {
  const [stitches10, setStitches10] = useState("20");
  const [rows10, setRows10] = useState("26");
  const [targetWidth, setTargetWidth] = useState("50");
  const [targetHeight, setTargetHeight] = useState("60");
  const [title, setTitle] = useState("Muestra de tensión 10x10 cm");
  const [projectId, setProjectId] = useState(defaultProjectId ?? "");
  const [saveOpen, setSaveOpen] = useState(false);

  const { data: projects } = useProjects();
  const saveCalc = useSaveCalculation();

  const res = gauge(stitches10, rows10, targetWidth, targetHeight);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) {
      toast.error("Seleccioná un proyecto para guardar el cálculo.");
      return;
    }
    if (!res.ok) {
      toast.error("Completá los datos de la muestra antes de guardar.");
      return;
    }
    await saveCalc.mutateAsync({
      project_id: projectId,
      kind: "muestra",
      title: title.trim() || "Muestra de tensión",
      inputs: {
        stitches10,
        rows10,
        targetWidth,
        targetHeight,
      },
      result: {
        stitchesPerCm: res.stitchesPerCm,
        rowsPerCm: res.rowsPerCm,
        stitches: res.stitches,
        rows: res.rows,
      },
    });
    setSaveOpen(false);
  };

  return (
    <Card className="border-muted/60 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2 text-primary">
          <Sparkles className="h-5 w-5" />
          <CardTitle className="text-xl">Calculadora de muestra de tensión (10 × 10 cm)</CardTitle>
        </div>
        <CardDescription>
          Ingresá los puntos y filas que mediste en tu muestra bloqueada para estimar los puntos y
          filas de tu prenda.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Label htmlFor="gauge-s10">Puntos en 10 cm</Label>
            <Input
              id="gauge-s10"
              placeholder="Ej: 20"
              value={stitches10}
              onChange={(e) => setStitches10(e.target.value)}
              className="mt-1.5 h-11"
            />
            <p className="mt-1 text-xs text-muted-foreground">Puntos en ancho de 10 cm</p>
          </div>
          <div>
            <Label htmlFor="gauge-r10">Filas / Vueltas en 10 cm</Label>
            <Input
              id="gauge-r10"
              placeholder="Ej: 26"
              value={rows10}
              onChange={(e) => setRows10(e.target.value)}
              className="mt-1.5 h-11"
            />
            <p className="mt-1 text-xs text-muted-foreground">Filas en alto de 10 cm</p>
          </div>
          <div>
            <Label htmlFor="gauge-w">Ancho deseado (cm)</Label>
            <Input
              id="gauge-w"
              placeholder="Ej: 50"
              value={targetWidth}
              onChange={(e) => setTargetWidth(e.target.value)}
              className="mt-1.5 h-11"
            />
            <p className="mt-1 text-xs text-muted-foreground">Medida de la pieza en cm</p>
          </div>
          <div>
            <Label htmlFor="gauge-h">Alto deseado (cm)</Label>
            <Input
              id="gauge-h"
              placeholder="Ej: 60"
              value={targetHeight}
              onChange={(e) => setTargetHeight(e.target.value)}
              className="mt-1.5 h-11"
            />
            <p className="mt-1 text-xs text-muted-foreground">Largo de la pieza en cm</p>
          </div>
        </div>

        {res.ok ? (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border bg-card p-4 space-y-1">
                <span className="text-xs uppercase tracking-wider text-muted-foreground">
                  Densidad de puntos
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-foreground">
                    {fmt(res.stitchesPerCm, 2)}
                  </span>
                  <span className="text-xs text-muted-foreground">puntos por cm</span>
                </div>
                {res.stitches && (
                  <div className="mt-3 border-t pt-2">
                    <p className="text-sm font-medium text-primary">
                      Puntos para {targetWidth} cm: <b>{res.stitches.rounded} puntos</b>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Cálculo exacto: {fmt(res.stitches.raw, 2)} puntos (redondeado al entero más
                      cercano).
                    </p>
                  </div>
                )}
              </div>

              <div className="rounded-xl border bg-card p-4 space-y-1">
                <span className="text-xs uppercase tracking-wider text-muted-foreground">
                  Densidad de filas / vueltas
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-foreground">
                    {fmt(res.rowsPerCm, 2)}
                  </span>
                  <span className="text-xs text-muted-foreground">filas por cm</span>
                </div>
                {res.rows && (
                  <div className="mt-3 border-t pt-2">
                    <p className="text-sm font-medium text-primary">
                      Filas para {targetHeight} cm: <b>{res.rows.rounded} filas</b>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Cálculo exacto: {fmt(res.rows.raw, 2)} filas (redondeado al entero más
                      cercano).
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Alerta requerida por el README */}
            <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-50/60 p-4 text-sm text-amber-950 dark:border-amber-500/20 dark:bg-amber-950/20 dark:text-amber-200">
              <Info className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div>
                <p className="font-semibold">Ajuste por técnica y estructura</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Recordá que los motivos de punto, repeticiones de calados o trenzas, aumentos,
                  disminuciones y la caída final del tejido pueden requerir ajustar estos valores
                  para coincidir con el múltiplo de puntos del patrón.
                </p>
              </div>
            </div>

            {/* Guardar en proyecto */}
            {projects && projects.length > 0 && (
              <div className="flex justify-end pt-2">
                <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="h-10 gap-1.5">
                      <BookmarkPlus className="h-4 w-4" /> Guardar muestra en proyecto
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Guardar muestra de tensión</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSave} className="space-y-4 pt-2">
                      <div>
                        <Label htmlFor="gauge-save-title">Título o pieza</Label>
                        <Input
                          id="gauge-save-title"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="Ej: Muestra lana merino aguja 4 mm"
                          className="mt-1.5 h-11"
                        />
                      </div>
                      <div>
                        <Label htmlFor="gauge-save-proj">Proyecto</Label>
                        <select
                          id="gauge-save-proj"
                          className="mt-1.5 flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
                          value={projectId}
                          onChange={(e) => setProjectId(e.target.value)}
                          required
                        >
                          <option value="">Seleccioná un proyecto…</option>
                          {projects.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
                        {stitches10} pts × {rows10} filas en 10 cm → {fmt(res.stitchesPerCm, 2)}{" "}
                        pts/cm y {fmt(res.rowsPerCm, 2)} filas/cm.
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="ghost" onClick={() => setSaveOpen(false)}>
                          Cancelar
                        </Button>
                        <Button type="submit" disabled={saveCalc.isPending}>
                          {saveCalc.isPending ? "Guardando…" : "Guardar muestra"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed p-4 text-center text-sm text-muted-foreground">
            {res.error}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function SavedCalculationsList({ projectId }: { projectId?: string }) {
  const { data: calcs, isLoading } = useCalculations(projectId);
  const deleteCalc = useDeleteCalculation();

  if (isLoading) return <Loading label="Cargando cálculos guardados…" />;

  if (!calcs || calcs.length === 0) {
    return (
      <Empty
        icon={<Calculator className="h-10 w-10 text-muted-foreground" />}
        title="Sin cálculos guardados"
        text={
          projectId
            ? "Este proyecto no tiene cálculos guardados todavía. Podés hacer uno arriba y guardarlo."
            : "Todavía no guardaste ningún cálculo. Usá las calculadoras superiores para guardarlos en tus proyectos."
        }
      />
    );
  }

  return (
    <div className="space-y-3">
      {calcs.map((c: Calculation & { projects?: { name: string } | null }) => {
        const isRot = c.kind === "regla_de_tres";
        const rotInputs = (isRot ? c.inputs : {}) as {
          original?: string;
          refMeasure?: string;
          newMeasure?: string;
        };
        const rotResult = (isRot ? c.result : {}) as {
          value?: number;
          rounded?: number;
          steps?: string[];
        };
        const gaugeInputs = (!isRot ? c.inputs : {}) as {
          stitches10?: string;
          rows10?: string;
          targetWidth?: string;
          targetHeight?: string;
        };
        const gaugeResult = (!isRot ? c.result : {}) as {
          stitchesPerCm?: number;
          rowsPerCm?: number;
          stitches?: { raw: number; rounded: number } | null;
          rows?: { raw: number; rounded: number } | null;
        };

        return (
          <div
            key={c.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border bg-card p-4 shadow-sm"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {isRot ? "Regla de tres" : "Muestra 10×10"}
                </span>
                <h4 className="font-semibold">
                  {c.title || (isRot ? "Regla de tres" : "Muestra de tensión")}
                </h4>
                {c.projects?.name && (
                  <span className="text-xs text-muted-foreground">· {c.projects.name}</span>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                {isRot ? (
                  <span>
                    Referencia: <b>{rotInputs.original ?? "—"}</b> en{" "}
                    <b>{rotInputs.refMeasure ?? "—"} cm</b> → Para{" "}
                    <b>{rotInputs.newMeasure ?? "—"} cm</b>:{" "}
                    <b className="text-foreground">{rotResult.rounded ?? "—"}</b> (
                    {fmt(Number(rotResult.value ?? 0), 2)})
                  </span>
                ) : (
                  <span>
                    Muestra: <b>{gaugeInputs.stitches10 ?? "—"} pts</b> ×{" "}
                    <b>{gaugeInputs.rows10 ?? "—"} filas</b> →{" "}
                    <b>{fmt(Number(gaugeResult.stitchesPerCm ?? 0), 2)} pts/cm</b>,{" "}
                    <b>{fmt(Number(gaugeResult.rowsPerCm ?? 0), 2)} filas/cm</b>
                    {gaugeResult.stitches && (
                      <>
                        {" "}
                        · Ancho ({gaugeInputs.targetWidth ?? "—"} cm):{" "}
                        <b>{gaugeResult.stitches.rounded} pts</b>
                      </>
                    )}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Guardado el {new Date(c.created_at).toLocaleDateString("es-AR")}
              </p>
            </div>

            <Confirm
              title="¿Eliminar este cálculo?"
              description="Esta acción no se puede deshacer."
              onConfirm={() => deleteCalc.mutate(c.id)}
              trigger={
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 text-muted-foreground hover:text-destructive shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              }
            />
          </div>
        );
      })}
    </div>
  );
}
