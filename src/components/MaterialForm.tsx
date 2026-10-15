import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Plus, Package, Edit2 } from "lucide-react";
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
import { MATERIAL_KINDS, NEEDLE_TYPES, YARN_WEIGHTS } from "@/lib/options";
import { useSaveMaterial, type Material } from "@/lib/data";

const selectCls =
  "mt-1.5 flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm";

export function MaterialForm({
  material,
  trigger,
  onSaved,
}: {
  material?: Material;
  trigger?: ReactNode;
  onSaved?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const saveMut = useSaveMaterial();

  const [kind, setKind] = useState<"hilado" | "aguja" | "accesorio">(
    (material?.kind as "hilado" | "aguja" | "accesorio") || "hilado",
  );
  const [name, setName] = useState(material?.name || "");
  const [brand, setBrand] = useState(material?.brand || "");
  const [composition, setComposition] = useState(material?.composition || "");
  const [weightCategory, setWeightCategory] = useState(material?.weight_category || "");
  const [color, setColor] = useState(material?.color || "");
  const [colorCode, setColorCode] = useState(material?.color_code || "");
  const [skeinWeightG, setSkeinWeightG] = useState(
    material?.skein_weight_g != null ? String(material.skein_weight_g) : "",
  );
  const [skeinLengthM, setSkeinLengthM] = useState(
    material?.skein_length_m != null ? String(material.skein_length_m) : "",
  );
  const [quantityAvailable, setQuantityAvailable] = useState(
    material?.quantity_available != null ? String(material.quantity_available) : "1",
  );
  const [needleType, setNeedleType] = useState(material?.needle_type || "");
  const [diameterMm, setDiameterMm] = useState(
    material?.diameter_mm != null ? String(material.diameter_mm) : "",
  );
  const [lengthCm, setLengthCm] = useState(
    material?.length_cm != null ? String(material.length_cm) : "",
  );
  const [notes, setNotes] = useState(material?.notes || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("El nombre del material es obligatorio.");
      return;
    }

    const qty = Number(quantityAvailable.replace(",", "."));
    if (isNaN(qty) || qty < 0) {
      toast.error("La cantidad disponible no puede ser negativa.");
      return;
    }

    const weight = skeinWeightG ? Number(skeinWeightG.replace(",", ".")) : null;
    if (weight !== null && (isNaN(weight) || weight <= 0)) {
      toast.error("El peso del ovillo debe ser mayor que cero.");
      return;
    }

    const length = skeinLengthM ? Number(skeinLengthM.replace(",", ".")) : null;
    if (length !== null && (isNaN(length) || length <= 0)) {
      toast.error("Los metros por ovillo deben ser mayores que cero.");
      return;
    }

    const diam = diameterMm ? Number(diameterMm.replace(",", ".")) : null;
    if (diam !== null && (isNaN(diam) || diam <= 0)) {
      toast.error("El diámetro de aguja debe ser mayor que cero.");
      return;
    }

    const needleLen = lengthCm ? Number(lengthCm.replace(",", ".")) : null;
    if (needleLen !== null && (isNaN(needleLen) || needleLen <= 0)) {
      toast.error("El largo de aguja debe ser mayor que cero.");
      return;
    }

    await saveMut.mutateAsync({
      ...(material?.id ? { id: material.id } : {}),
      kind,
      name: name.trim(),
      brand: brand.trim() || null,
      composition: composition.trim() || null,
      weight_category: weightCategory || null,
      color: color.trim() || null,
      color_code: colorCode.trim() || null,
      skein_weight_g: weight,
      skein_length_m: length,
      quantity_available: qty,
      needle_type: needleType || null,
      diameter_mm: diam,
      length_cm: needleLen,
      notes: notes.trim() || null,
    });

    setOpen(false);
    onSaved?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : material ? (
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Edit2 className="h-4 w-4" />
          </Button>
        ) : (
          <Button className="h-11 gap-1.5">
            <Plus className="h-4 w-4" /> Nuevo material
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            {material ? "Editar material" : "Agregar material al inventario"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <Label htmlFor="mat-kind">Categoría de material</Label>
            <select
              id="mat-kind"
              value={kind}
              onChange={(e) => setKind(e.target.value as "hilado" | "aguja" | "accesorio")}
              className={selectCls}
            >
              {MATERIAL_KINDS.map((k) => (
                <option key={k.value} value={k.value}>
                  {k.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="mat-name">Nombre / Identificación *</Label>
            <Input
              id="mat-name"
              placeholder={
                kind === "hilado"
                  ? "Ej: Merino Sedificada Sport"
                  : kind === "aguja"
                    ? "Ej: Aguja circular KnitPro Zing 4.0 mm"
                    : "Ej: Marcadores de puntos candado"
              }
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1.5 h-11"
            />
          </div>

          {/* Campos específicos de Hilado */}
          {kind === "hilado" && (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="mat-brand">Marca</Label>
                  <Input
                    id="mat-brand"
                    placeholder="Ej: LHO, Cisne, Malabrigo"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="mt-1.5 h-11"
                  />
                </div>
                <div>
                  <Label htmlFor="mat-cat">Grosor / Categoría</Label>
                  <select
                    id="mat-cat"
                    value={weightCategory}
                    onChange={(e) => setWeightCategory(e.target.value)}
                    className={selectCls}
                  >
                    <option value="">Seleccionar grosor…</option>
                    {YARN_WEIGHTS.map((w) => (
                      <option key={w.value} value={w.value}>
                        {w.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="mat-comp">Composición</Label>
                <Input
                  id="mat-comp"
                  placeholder="Ej: 80% Lana merino, 20% Seda"
                  value={composition}
                  onChange={(e) => setComposition(e.target.value)}
                  className="mt-1.5 h-11"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="mat-color">Color</Label>
                  <Input
                    id="mat-color"
                    placeholder="Ej: Verde Salvia"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="mt-1.5 h-11"
                  />
                </div>
                <div>
                  <Label htmlFor="mat-code">Código / Partida / Lote</Label>
                  <Input
                    id="mat-code"
                    placeholder="Ej: Col 12 - Lote 450"
                    value={colorCode}
                    onChange={(e) => setColorCode(e.target.value)}
                    className="mt-1.5 h-11"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <Label htmlFor="mat-weight">Peso ovillo (g)</Label>
                  <Input
                    id="mat-weight"
                    type="number"
                    step="any"
                    placeholder="Ej: 100"
                    value={skeinWeightG}
                    onChange={(e) => setSkeinWeightG(e.target.value)}
                    className="mt-1.5 h-11"
                  />
                </div>
                <div>
                  <Label htmlFor="mat-len">Metros por ovillo (m)</Label>
                  <Input
                    id="mat-len"
                    type="number"
                    step="any"
                    placeholder="Ej: 200"
                    value={skeinLengthM}
                    onChange={(e) => setSkeinLengthM(e.target.value)}
                    className="mt-1.5 h-11"
                  />
                </div>
                <div>
                  <Label htmlFor="mat-qty">Ovillos disponibles</Label>
                  <Input
                    id="mat-qty"
                    type="number"
                    step="any"
                    placeholder="Ej: 4"
                    value={quantityAvailable}
                    onChange={(e) => setQuantityAvailable(e.target.value)}
                    className="mt-1.5 h-11"
                  />
                </div>
              </div>
            </>
          )}

          {/* Campos específicos de Aguja */}
          {kind === "aguja" && (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="needle-type">Tipo de aguja</Label>
                  <select
                    id="needle-type"
                    value={needleType}
                    onChange={(e) => setNeedleType(e.target.value)}
                    className={selectCls}
                  >
                    <option value="">Seleccionar tipo…</option>
                    {NEEDLE_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="needle-brand">Marca</Label>
                  <Input
                    id="needle-brand"
                    placeholder="Ej: KnitPro, Tulip, Clover"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="mt-1.5 h-11"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <Label htmlFor="needle-diam">Diámetro (mm)</Label>
                  <Input
                    id="needle-diam"
                    type="number"
                    step="0.25"
                    placeholder="Ej: 4.5"
                    value={diameterMm}
                    onChange={(e) => setDiameterMm(e.target.value)}
                    className="mt-1.5 h-11"
                  />
                </div>
                <div>
                  <Label htmlFor="needle-len">Largo (cm)</Label>
                  <Input
                    id="needle-len"
                    type="number"
                    step="any"
                    placeholder="Ej: 80"
                    value={lengthCm}
                    onChange={(e) => setLengthCm(e.target.value)}
                    className="mt-1.5 h-11"
                  />
                </div>
                <div>
                  <Label htmlFor="needle-qty">Cantidad</Label>
                  <Input
                    id="needle-qty"
                    type="number"
                    step="1"
                    placeholder="Ej: 1"
                    value={quantityAvailable}
                    onChange={(e) => setQuantityAvailable(e.target.value)}
                    className="mt-1.5 h-11"
                  />
                </div>
              </div>
            </>
          )}

          {/* Campos de Accesorio */}
          {kind === "accesorio" && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="acc-brand">Marca (opcional)</Label>
                <Input
                  id="acc-brand"
                  placeholder="Ej: Clover, Prym"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="mt-1.5 h-11"
                />
              </div>
              <div>
                <Label htmlFor="acc-qty">Cantidad disponible</Label>
                <Input
                  id="acc-qty"
                  type="number"
                  step="any"
                  placeholder="Ej: 10"
                  value={quantityAvailable}
                  onChange={(e) => setQuantityAvailable(e.target.value)}
                  className="mt-1.5 h-11"
                />
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="mat-notes">Notas adicionales</Label>
            <Textarea
              id="mat-notes"
              placeholder="Instrucciones de lavado, sensaciones al tacto, ubicación en el taller…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1.5 min-h-[80px]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saveMut.isPending}>
              {saveMut.isPending ? "Guardando…" : material ? "Guardar cambios" : "Crear material"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
