import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { BookmarkPlus, ShoppingCart, Info, Edit3 } from "lucide-react";
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
import {
  useMaterials,
  useProjects,
  useAssignProjectMaterial,
  useUpdateProjectMaterial,
  useAddShoppingItem,
  type Material,
  type PopulatedProjectMaterial,
} from "@/lib/data";
import { skeinsNeeded, skeinsMissing } from "@/lib/calc";

const selectCls =
  "mt-1.5 flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm";

export function ProjectMaterialDialog({
  projectId: forcedProjectId,
  projectMaterial,
  trigger,
}: {
  projectId?: string;
  projectMaterial?: PopulatedProjectMaterial;
  trigger?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const { data: materials } = useMaterials();
  const { data: projects } = useProjects();
  const assignMut = useAssignProjectMaterial();
  const updateMut = useUpdateProjectMaterial();
  const addShopMut = useAddShoppingItem();

  const [projectId, setProjectId] = useState(projectMaterial?.project_id || forcedProjectId || "");
  const [materialId, setMaterialId] = useState(projectMaterial?.material_id || "");
  const [requiredGrams, setRequiredGrams] = useState(
    projectMaterial?.required_grams != null ? String(projectMaterial.required_grams) : "",
  );
  const [requiredMeters, setRequiredMeters] = useState(
    projectMaterial?.required_meters != null ? String(projectMaterial.required_meters) : "",
  );
  const [qtyEstimated, setQtyEstimated] = useState(
    projectMaterial?.qty_estimated != null ? String(projectMaterial.qty_estimated) : "",
  );
  const [qtyPurchased, setQtyPurchased] = useState(
    projectMaterial?.qty_purchased != null ? String(projectMaterial.qty_purchased) : "0",
  );
  const [qtyUsed, setQtyUsed] = useState(
    projectMaterial?.qty_used != null ? String(projectMaterial.qty_used) : "0",
  );
  const [notes, setNotes] = useState(projectMaterial?.notes || "");

  const selectedMaterial: Material | undefined = materials?.find((m) => m.id === materialId);

  // Cálculos automáticos de consumo de ovillos
  const g = requiredGrams ? Number(requiredGrams.replace(",", ".")) : null;
  const m = requiredMeters ? Number(requiredMeters.replace(",", ".")) : null;
  const estManual = qtyEstimated ? Number(qtyEstimated.replace(",", ".")) : null;
  const purchased = qtyPurchased ? Number(qtyPurchased.replace(",", ".")) : 0;
  const used = qtyUsed ? Number(qtyUsed.replace(",", ".")) : 0;

  const neededResult = skeinsNeeded({
    requiredGrams: g,
    requiredMeters: m,
    skeinWeight: selectedMaterial?.skein_weight_g,
    skeinLength: selectedMaterial?.skein_length_m,
    manualEstimate: estManual,
  });

  const available = selectedMaterial?.quantity_available ?? 0;
  const missing = neededResult ? skeinsMissing(neededResult.needed, available, purchased) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) {
      toast.error("Seleccioná un proyecto.");
      return;
    }
    if (!materialId) {
      toast.error("Seleccioná un material del inventario.");
      return;
    }

    const payload = {
      required_grams: g,
      required_meters: m,
      qty_estimated: neededResult ? neededResult.needed : estManual,
      qty_purchased: purchased,
      qty_used: used,
      notes: notes.trim() || null,
    };

    if (projectMaterial) {
      await updateMut.mutateAsync({
        id: projectMaterial.id,
        ...payload,
      });
    } else {
      await assignMut.mutateAsync({
        project_id: projectId,
        material_id: materialId,
        ...payload,
      });
    }

    setOpen(false);
  };

  const handleAddToShopping = async () => {
    if (!selectedMaterial || missing <= 0) return;
    const projName = projects?.find((p) => p.id === projectId)?.name;
    const desc = `${selectedMaterial.name}${selectedMaterial.color ? ` (Color: ${selectedMaterial.color})` : ""}${selectedMaterial.color_code ? ` - ${selectedMaterial.color_code}` : ""}`;
    await addShopMut.mutateAsync({
      project_id: projectId || null,
      description: `Comprar ${missing} ovillo(s) de ${desc}${projName ? ` para ${projName}` : ""}`,
      quantity: missing,
      unit: "ovillo(s)",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : projectMaterial ? (
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Edit3 className="h-4 w-4" />
          </Button>
        ) : (
          <Button variant="outline" className="h-10 gap-1.5">
            <BookmarkPlus className="h-4 w-4" /> Asignar a proyecto
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {projectMaterial ? "Actualizar material en proyecto" : "Asociar material a proyecto"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {!forcedProjectId && (
            <div>
              <Label htmlFor="pm-proj">Proyecto *</Label>
              <select
                id="pm-proj"
                className={selectCls}
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                disabled={!!projectMaterial}
                required
              >
                <option value="">Seleccionar proyecto…</option>
                {projects?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <Label htmlFor="pm-mat">Material del inventario *</Label>
            <select
              id="pm-mat"
              className={selectCls}
              value={materialId}
              onChange={(e) => setMaterialId(e.target.value)}
              disabled={!!projectMaterial}
              required
            >
              <option value="">Seleccionar material…</option>
              {materials?.map((m) => (
                <option key={m.id} value={m.id}>
                  [{m.kind}] {m.name} {m.color ? `· ${m.color}` : ""} (Disponible:{" "}
                  {m.quantity_available})
                </option>
              ))}
            </select>
          </div>

          {selectedMaterial && (
            <div className="rounded-lg bg-accent/40 p-3 text-xs text-foreground/90 space-y-1">
              <p className="font-semibold text-primary">{selectedMaterial.name}</p>
              <p>
                {selectedMaterial.kind === "hilado" && (
                  <>
                    {selectedMaterial.brand && `Marca: ${selectedMaterial.brand} · `}
                    {selectedMaterial.composition && `${selectedMaterial.composition} · `}
                    {selectedMaterial.skein_weight_g &&
                      `${selectedMaterial.skein_weight_g} g por ovillo `}
                    {selectedMaterial.skein_length_m && `(${selectedMaterial.skein_length_m} m)`}
                  </>
                )}
                {selectedMaterial.kind === "aguja" && (
                  <>
                    {selectedMaterial.needle_type && `Tipo: ${selectedMaterial.needle_type} · `}
                    {selectedMaterial.diameter_mm &&
                      `Diámetro: ${selectedMaterial.diameter_mm} mm · `}
                    {selectedMaterial.length_cm && `Largo: ${selectedMaterial.length_cm} cm`}
                  </>
                )}
              </p>
              <p className="text-muted-foreground">
                Stock actual en inventario: <b>{selectedMaterial.quantity_available}</b>{" "}
                unidades/ovillos.
              </p>
            </div>
          )}

          {/* Consumo y cantidades estimadas */}
          <div className="space-y-3 pt-1">
            <h4 className="text-sm font-semibold">Consumo estimado</h4>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="pm-grams">Gramos necesarios (g)</Label>
                <Input
                  id="pm-grams"
                  type="number"
                  step="any"
                  placeholder="Ej: 450"
                  value={requiredGrams}
                  onChange={(e) => setRequiredGrams(e.target.value)}
                  className="mt-1.5 h-11"
                />
              </div>
              <div>
                <Label htmlFor="pm-meters">Metros necesarios (m)</Label>
                <Input
                  id="pm-meters"
                  type="number"
                  step="any"
                  placeholder="Ej: 900"
                  value={requiredMeters}
                  onChange={(e) => setRequiredMeters(e.target.value)}
                  className="mt-1.5 h-11"
                />
              </div>
            </div>

            {/* Cálculo de ovillos */}
            {neededResult ? (
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm space-y-1.5">
                <div className="flex items-center gap-1.5 font-medium text-primary">
                  <Info className="h-4 w-4" />
                  <span>
                    Cálculo automático de ovillos: <b>{neededResult.needed} ovillos necesarios</b>
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Base del cálculo: {neededResult.basis}.
                </p>
                <div className="text-xs">
                  {missing > 0 ? (
                    <span className="font-semibold text-amber-600 dark:text-amber-400">
                      ⚠️ Tenés {available} disponibles (+ {purchased} comprados). Faltan comprar:{" "}
                      <b>{missing} ovillo(s)</b>.
                    </span>
                  ) : (
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      ✓ Cantidad suficiente para completar el proyecto.
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <Label htmlFor="pm-est">Cantidad estimada manual (ovillos / unidades)</Label>
                <Input
                  id="pm-est"
                  type="number"
                  step="any"
                  placeholder="Ej: 5"
                  value={qtyEstimated}
                  onChange={(e) => setQtyEstimated(e.target.value)}
                  className="mt-1.5 h-11"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Si no cargás gramos o metros, podés ingresar una cantidad estimada a mano.
                </p>
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2 pt-2">
              <div>
                <Label htmlFor="pm-purch">Cantidad comprada</Label>
                <Input
                  id="pm-purch"
                  type="number"
                  step="any"
                  placeholder="Ej: 3"
                  value={qtyPurchased}
                  onChange={(e) => setQtyPurchased(e.target.value)}
                  className="mt-1.5 h-11"
                />
              </div>
              <div>
                <Label htmlFor="pm-used">Cantidad utilizada real</Label>
                <Input
                  id="pm-used"
                  type="number"
                  step="any"
                  placeholder="Ej: 2.5"
                  value={qtyUsed}
                  onChange={(e) => setQtyUsed(e.target.value)}
                  className="mt-1.5 h-11"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="pm-notes">Notas sobre este material en el proyecto</Label>
              <Textarea
                id="pm-notes"
                placeholder="Ej: Se teje con hebra simple en agujas 4 mm para puños…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1.5 min-h-[70px]"
              />
            </div>
          </div>

          {missing > 0 && (
            <div className="flex justify-end pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs text-primary"
                onClick={handleAddToShopping}
                disabled={addShopMut.isPending}
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                Añadir {missing} faltante(s) a lista de compras
              </Button>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={assignMut.isPending || updateMut.isPending}>
              {assignMut.isPending || updateMut.isPending
                ? "Guardando…"
                : projectMaterial
                  ? "Guardar cambios"
                  : "Asignar material"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
