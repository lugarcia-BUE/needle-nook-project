import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Package,
  Layers,
  Sparkles,
  Scissors,
  Trash2,
  FolderGit2,
  ShoppingCart,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader, Loading, Empty, Confirm } from "@/components/common";
import { MaterialForm } from "@/components/MaterialForm";
import { ProjectMaterialDialog } from "@/components/ProjectMaterialDialog";
import {
  useMaterials,
  useDeleteMaterial,
  useProjectMaterials,
  useRemoveProjectMaterial,
  useAddShoppingItem,
  type Material,
  type PopulatedProjectMaterial,
} from "@/lib/data";
import { skeinsNeeded, skeinsMissing, fmt } from "@/lib/calc";
import { label, MATERIAL_KINDS, NEEDLE_TYPES, YARN_WEIGHTS } from "@/lib/options";

export const Route = createFileRoute("/_authenticated/materiales")({
  head: () => ({
    meta: [
      { title: "Materiales — Teje conmigo" },
      { name: "description", content: "Inventario de hilados, agujas y accesorios para tejido." },
      { property: "og:title", content: "Materiales — Teje conmigo" },
      {
        property: "og:description",
        content: "Inventario de hilados, agujas y accesorios para tejido.",
      },
    ],
  }),
  component: MaterialesPage,
});

function MaterialesPage() {
  const [filterKind, setFilterKind] = useState<string>("todos");
  const { data: materials, isLoading: matsLoading } = useMaterials();
  const { data: projMaterials, isLoading: pmLoading } = useProjectMaterials();
  const deleteMaterial = useDeleteMaterial();
  const removeProjMaterial = useRemoveProjectMaterial();
  const addShopMut = useAddShoppingItem();

  const filteredMaterials = (materials ?? []).filter((m) => {
    if (filterKind === "todos") return true;
    return m.kind === filterKind;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Materiales de tejido"
        subtitle="Tu inventario personal de hilados, agujas y accesorios, y su asignación a proyectos."
        actions={
          <div className="flex flex-wrap gap-2">
            <ProjectMaterialDialog
              trigger={
                <Button variant="outline" className="h-11 gap-1.5">
                  <FolderGit2 className="h-4 w-4" /> Asignar a proyecto
                </Button>
              }
            />
            <MaterialForm
              trigger={
                <Button className="h-11 gap-1.5">
                  <Plus className="h-4 w-4" /> Nuevo material
                </Button>
              }
            />
          </div>
        }
      />

      <Tabs defaultValue="inventario" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-sm">
          <TabsTrigger value="inventario">Inventario general</TabsTrigger>
          <TabsTrigger value="proyectos">En proyectos</TabsTrigger>
        </TabsList>

        {/* Tab 1: Inventario general */}
        <TabsContent value="inventario" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: "todos", label: "Todos", icon: Package },
                { id: "hilado", label: "Hilados", icon: Layers },
                { id: "aguja", label: "Agujas", icon: Sparkles },
                { id: "accesorio", label: "Accesorios", icon: Scissors },
              ].map((btn) => (
                <Button
                  key={btn.id}
                  variant={filterKind === btn.id ? "default" : "secondary"}
                  size="sm"
                  className="h-9 gap-1.5 text-xs"
                  onClick={() => setFilterKind(btn.id)}
                >
                  <btn.icon className="h-3.5 w-3.5" />
                  {btn.label}
                  {materials && btn.id !== "todos" && (
                    <span className="opacity-70">
                      ({materials.filter((m) => m.kind === btn.id).length})
                    </span>
                  )}
                </Button>
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              {filteredMaterials.length} material(es) en total
            </span>
          </div>

          {matsLoading ? (
            <Loading label="Cargando inventario de materiales…" />
          ) : filteredMaterials.length === 0 ? (
            <Empty
              icon={<Package className="h-10 w-10 text-muted-foreground" />}
              title="Sin materiales en esta categoría"
              text="Agregá tus hilados, agujas o accesorios para llevar el control de tus insumos."
              action={<MaterialForm />}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredMaterials.map((m: Material) => (
                <div
                  key={m.id}
                  className="group relative flex flex-col justify-between rounded-2xl border bg-card p-5 shadow-sm transition hover:shadow-md"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <Badge
                          variant="secondary"
                          className="bg-accent/60 text-xs font-normal text-accent-foreground"
                        >
                          {label(MATERIAL_KINDS, m.kind)}
                        </Badge>
                        <h3 className="text-base font-semibold text-foreground group-hover:text-primary">
                          {m.name}
                        </h3>
                        {m.brand && (
                          <p className="text-xs font-medium text-muted-foreground">
                            Marca: {m.brand}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <MaterialForm material={m} />
                        <Confirm
                          title="¿Eliminar material?"
                          description="Si está asociado a algún proyecto, también se desvinculará."
                          onConfirm={() => deleteMaterial.mutate(m.id)}
                          trigger={
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          }
                        />
                      </div>
                    </div>

                    {/* Hilado specific info */}
                    {m.kind === "hilado" && (
                      <div className="space-y-1 text-xs text-muted-foreground">
                        {m.composition && <p>Composición: {m.composition}</p>}
                        {m.weight_category && (
                          <p>Grosor: {label(YARN_WEIGHTS, m.weight_category)}</p>
                        )}
                        {(m.color || m.color_code) && (
                          <p>
                            Color: <b>{m.color || "—"}</b>
                            {m.color_code && ` (Lote: ${m.color_code})`}
                          </p>
                        )}
                        {(m.skein_weight_g || m.skein_length_m) && (
                          <p>
                            Ovillo: {m.skein_weight_g ? `${m.skein_weight_g} g` : ""}
                            {m.skein_weight_g && m.skein_length_m ? " · " : ""}
                            {m.skein_length_m ? `${m.skein_length_m} m` : ""}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Aguja specific info */}
                    {m.kind === "aguja" && (
                      <div className="space-y-1 text-xs text-muted-foreground">
                        {m.needle_type && <p>Tipo: {label(NEEDLE_TYPES, m.needle_type)}</p>}
                        {m.diameter_mm && (
                          <p>
                            Diámetro: <b>{m.diameter_mm} mm</b>
                          </p>
                        )}
                        {m.length_cm && (
                          <p>
                            Largo de cable/aguja: <b>{m.length_cm} cm</b>
                          </p>
                        )}
                      </div>
                    )}

                    {m.notes && (
                      <p className="border-t pt-2 text-xs italic text-muted-foreground/80 line-clamp-2">
                        “{m.notes}”
                      </p>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t pt-3">
                    <span className="text-xs text-muted-foreground">Disponible:</span>
                    <Badge
                      variant="outline"
                      className="border-primary/30 font-semibold text-primary"
                    >
                      {m.quantity_available}{" "}
                      {m.kind === "hilado"
                        ? "ovillos"
                        : m.kind === "aguja"
                          ? "par(es)/unidad"
                          : "unidades"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Materiales en proyectos */}
        <TabsContent value="proyectos" className="space-y-4">
          {pmLoading ? (
            <Loading label="Cargando materiales en proyectos…" />
          ) : !projMaterials || projMaterials.length === 0 ? (
            <Empty
              icon={<FolderGit2 className="h-10 w-10 text-muted-foreground" />}
              title="Sin materiales asignados a proyectos"
              text="Podés asignar hilados y agujas de tu inventario a tus proyectos para calcular consumos y ovillos necesarios."
              action={<ProjectMaterialDialog />}
            />
          ) : (
            <div className="space-y-4">
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
                    className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border bg-card p-5 shadow-sm"
                  >
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {pm.projects?.name && (
                          <Link
                            to="/proyectos/$id"
                            params={{ id: pm.project_id }}
                            className="font-semibold text-primary hover:underline"
                          >
                            {pm.projects.name}
                          </Link>
                        )}
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-sm font-medium text-foreground">
                          {mat?.name ?? "Material eliminado"}
                        </span>
                        {mat?.color && (
                          <Badge variant="secondary" className="text-[11px]">
                            {mat.color}
                          </Badge>
                        )}
                      </div>

                      {/* Detalles del consumo */}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        {pm.required_grams && (
                          <span>
                            Requerido: <b>{pm.required_grams} g</b>
                          </span>
                        )}
                        {pm.required_meters && (
                          <span>
                            Metros: <b>{pm.required_meters} m</b>
                          </span>
                        )}
                        {needed && (
                          <span className="text-foreground">
                            Ovillos calculados: <b>{needed.needed}</b> ({needed.basis})
                          </span>
                        )}
                        <span>
                          En inventario: <b>{avail}</b>
                        </span>
                        {pm.qty_purchased != null && pm.qty_purchased > 0 && (
                          <span>
                            Comprados: <b>{pm.qty_purchased}</b>
                          </span>
                        )}
                        {pm.qty_used != null && pm.qty_used > 0 && (
                          <span>
                            Utilizados: <b>{pm.qty_used}</b>
                          </span>
                        )}
                      </div>

                      {/* Estado de compras */}
                      <div className="text-xs">
                        {missing > 0 ? (
                          <span className="font-semibold text-amber-600 dark:text-amber-400">
                            ⚠️ Faltan comprar {missing} ovillo(s) para este proyecto.
                          </span>
                        ) : needed ? (
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            ✓ Cantidad suficiente de material para el proyecto.
                          </span>
                        ) : (
                          <span className="text-muted-foreground">
                            Completá los gramos o metros para calcular ovillos necesarios.
                          </span>
                        )}
                      </div>

                      {pm.notes && (
                        <p className="text-xs italic text-muted-foreground">Notas: {pm.notes}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {missing > 0 && mat && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 gap-1.5 text-xs text-primary"
                          onClick={() =>
                            addShopMut.mutate({
                              project_id: pm.project_id,
                              description: `Comprar ${missing} ovillo(s) de ${mat.name} para ${pm.projects?.name || "proyecto"}`,
                              quantity: missing,
                              unit: "ovillo(s)",
                            })
                          }
                          disabled={addShopMut.isPending}
                        >
                          <ShoppingCart className="h-3.5 w-3.5" />
                          Comprar {missing}
                        </Button>
                      )}
                      <ProjectMaterialDialog projectMaterial={pm} />
                      <Confirm
                        title="¿Quitar material del proyecto?"
                        description="El material seguirá existiendo en tu inventario general."
                        confirmLabel="Quitar"
                        onConfirm={() => removeProjMaterial.mutate(pm.id)}
                        trigger={
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
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
      </Tabs>
    </div>
  );
}
