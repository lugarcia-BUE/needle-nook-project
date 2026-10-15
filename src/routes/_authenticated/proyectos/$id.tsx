import { createFileRoute } from "@tanstack/react-router";
import { Play, Plus, Calculator, Package, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader, Loading, PrivateImage, Empty, Confirm } from "@/components/common";
import { ProjectForm } from "@/components/ProjectForm";
import { CounterCard, CounterForm } from "@/components/CounterCard";
import { ProjectMaterialDialog } from "@/components/ProjectMaterialDialog";
import { SavedCalculationsList } from "@/components/Calculators";
import {
  useProjects,
  useAllCounters,
  useAllSessions,
  useTimer,
  useProjectMaterials,
  useRemoveProjectMaterial,
  type PopulatedProjectMaterial,
} from "@/lib/data";
import {
  totalSeconds,
  formatDuration,
  projectProgress,
  remainingEstimate,
  skeinsNeeded,
  skeinsMissing,
} from "@/lib/calc";

export const Route = createFileRoute("/_authenticated/proyectos/$id")({
  head: () => ({
    meta: [
      { title: "Proyecto — Teje conmigo" },
      { name: "description", content: "Detalle del proyecto." },
      { property: "og:title", content: "Proyecto — Teje conmigo" },
      { property: "og:description", content: "Detalle del proyecto." },
    ],
  }),
  component: Detail,
});

function Detail() {
  const { id } = Route.useParams();
  const p = useProjects();
  const c = useAllCounters();
  const s = useAllSessions();
  const timer = useTimer();
  const { data: projMaterials, isLoading: pmLoading } = useProjectMaterials(id);
  const removeProjMat = useRemoveProjectMaterial();

  if (p.isLoading) return <Loading />;
  const project = p.data?.find((x) => x.id === id);
  if (!project)
    return <p className="p-8 text-center text-muted-foreground">Proyecto no encontrado.</p>;

  const counters = (c.data ?? []).filter((x) => x.project_id === id);
  const total = totalSeconds((s.data ?? []).filter((x) => x.project_id === id));
  const prog = projectProgress(counters);
  const rem = remainingEstimate(total, prog);

  return (
    <div className="space-y-6">
      <PageHeader
        title={project.name}
        subtitle={project.description ?? undefined}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button className="h-11 gap-1.5" onClick={() => timer.start.mutate(id)}>
              <Play className="h-4 w-4" /> Iniciar sesión
            </Button>
            <ProjectForm
              project={project}
              trigger={
                <Button variant="outline" className="h-11">
                  Editar
                </Button>
              }
            />
          </div>
        }
      />

      <PrivateImage
        path={project.cover_path}
        alt={project.name}
        className="aspect-[16/7] w-full rounded-2xl shadow-sm"
      />

      {/* Barra de progreso y tiempo */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border bg-card p-4 text-sm shadow-sm">
        <div className="flex items-center gap-1.5">
          <Clock className="h-4 w-4 text-primary" />
          <span>
            Tiempo dedicado: <b>{formatDuration(total)}</b>
          </span>
        </div>
        {prog !== null && (
          <span>
            · Avance de vueltas: <b>{prog}%</b>
          </span>
        )}
        {rem !== null && (
          <span className="text-muted-foreground">
            · Restante estimado: <b>{formatDuration(rem)}</b>
          </span>
        )}
        {project.target_measurements && (
          <span className="text-muted-foreground">· Medidas: {project.target_measurements}</span>
        )}
      </div>

      {/* Pestañas del proyecto */}
      <Tabs defaultValue="contadores" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="contadores">Contadores ({counters.length})</TabsTrigger>
          <TabsTrigger value="materiales">Materiales ({projMaterials?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="calculos">Cálculos</TabsTrigger>
        </TabsList>

        {/* Tab 1: Contadores */}
        <TabsContent value="contadores" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Contadores de vueltas</h2>
            <CounterForm
              projectId={id}
              trigger={
                <Button variant="secondary" className="gap-1.5">
                  <Plus className="h-4 w-4" /> Nuevo contador
                </Button>
              }
            />
          </div>
          {counters.length === 0 ? (
            <Empty
              title="Sin contadores todavía"
              text="Agregá un contador para registrar vueltas o filas de esta pieza o sección."
              action={
                <CounterForm
                  projectId={id}
                  trigger={
                    <Button className="h-10">
                      <Plus className="h-4 w-4" /> Crear contador
                    </Button>
                  }
                />
              }
            />
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {counters.map((k) => (
                <CounterCard key={k.id} c={k} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Materiales del proyecto */}
        <TabsContent value="materiales" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Materiales de la labor</h2>
            <ProjectMaterialDialog
              projectId={id}
              trigger={
                <Button variant="secondary" className="gap-1.5">
                  <Plus className="h-4 w-4" /> Asignar material
                </Button>
              }
            />
          </div>

          {pmLoading ? (
            <Loading label="Cargando materiales del proyecto…" />
          ) : !projMaterials || projMaterials.length === 0 ? (
            <Empty
              icon={<Package className="h-10 w-10 text-muted-foreground" />}
              title="No hay materiales vinculados"
              text="Asociá hilados o agujas de tu inventario para calcular el consumo exacto de ovillos."
              action={
                <ProjectMaterialDialog
                  projectId={id}
                  trigger={
                    <Button className="h-10">
                      <Plus className="h-4 w-4" /> Asociar material
                    </Button>
                  }
                />
              }
            />
          ) : (
            <div className="space-y-3">
              {projMaterials.map((pm: PopulatedProjectMaterial) => {
                const mat = pm.materials;
                const needed = skeinsNeeded({
                  requiredGrams: pm.required_grams,
                  requiredMeters: pm.required_meters,
                  skeinWeight: mat?.skein_weight_g,
                  skeinLength: mat?.skein_length_m,
                  manualEstimate: pm.qty_estimated,
                });
                const avail = mat?.quantity_available ?? 0;
                const missing = needed ? skeinsMissing(needed.needed, avail, pm.qty_purchased) : 0;

                return (
                  <div
                    key={pm.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border bg-card p-4 shadow-sm"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-foreground">{mat?.name ?? "Material"}</h4>
                        {mat?.color && (
                          <Badge variant="outline" className="text-xs">
                            {mat.color}
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground space-x-2">
                        {pm.required_grams && (
                          <span>
                            Gramos: <b>{pm.required_grams} g</b>
                          </span>
                        )}
                        {pm.required_meters && (
                          <span>
                            Metros: <b>{pm.required_meters} m</b>
                          </span>
                        )}
                        {needed && (
                          <span className="text-primary font-medium">
                            Ovillos: <b>{needed.needed}</b>
                          </span>
                        )}
                        <span>
                          En stock: <b>{avail}</b>
                        </span>
                        {pm.qty_used != null && pm.qty_used > 0 && (
                          <span>
                            Utilizados: <b>{pm.qty_used}</b>
                          </span>
                        )}
                      </div>
                      {missing > 0 && (
                        <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                          ⚠️ Faltan comprar {missing} ovillo(s).
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <ProjectMaterialDialog projectId={id} projectMaterial={pm} />
                      <Confirm
                        title="¿Desvincular material?"
                        description="El material permanecerá en tu inventario general."
                        confirmLabel="Desvincular"
                        onConfirm={() => removeProjMat.mutate(pm.id)}
                        trigger={
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                          >
                            <Plus className="h-4 w-4 rotate-45" />
                          </Button>
                        }
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Tab 3: Cálculos del proyecto */}
        <TabsContent value="calculos" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Cálculos asociados</h2>
            <Button asChild variant="secondary" className="gap-1.5">
              <a href="/calculadoras">
                <Calculator className="h-4 w-4" /> Ir a Calculadoras
              </a>
            </Button>
          </div>
          <SavedCalculationsList projectId={id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
