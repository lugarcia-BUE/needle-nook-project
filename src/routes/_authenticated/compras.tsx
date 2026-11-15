import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, ShoppingBasket } from "lucide-react";
import { PageHeader, Empty, Loading, ErrorBox, Confirm } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useShoppingItems, useAddShoppingItem, useUpdateShoppingItem, useDeleteShoppingItem, useProjects } from "@/lib/data";
import { fmt, validQuantity } from "@/lib/calc";
import { toast } from "sonner";
export const Route = createFileRoute("/_authenticated/compras")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Compras — Teje conmigo" },
      { name: "description", content: "Compras en Teje conmigo." },
      { property: "og:title", content: "Compras — Teje conmigo" },
      { property: "og:description", content: "Compras en Teje conmigo." },
    ],
  }),
  component: ShoppingPage,
});

function ShoppingPage() {
  const items = useShoppingItems();
  const projects = useProjects();
  const add = useAddShoppingItem();
  const update = useUpdateShoppingItem();
  const remove = useDeleteShoppingItem();
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("ovillos");
  const [projectId, setProjectId] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim() || !validQuantity(quantity, true, true)) {
      toast.error("Ingresá una descripción y, si indicás cantidad, un número mayor que cero.");
      return;
    }
    try {
      await add.mutateAsync({ description: description.trim(), quantity: quantity ? Number(quantity.replace(",", ".")) : null, unit: unit.trim() || null, project_id: projectId || null });
      setDescription(""); setQuantity("");
    } catch { /* Keep the entered values when saving fails. */ }
  }

  return <div className="space-y-6">
    <PageHeader title="Lista de compras" />
    <form onSubmit={submit} className="grid items-end gap-3 border-b pb-6 sm:grid-cols-2 lg:grid-cols-5">
      <div className="sm:col-span-2 lg:col-span-2">
        <Label htmlFor="shop-description">Material o artículo</Label>
        <Input id="shop-description" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={200} required className="mt-1.5 h-11" />
      </div>
      <div><Label htmlFor="shop-quantity">Cantidad</Label><Input id="shop-quantity" inputMode="decimal" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="mt-1.5 h-11" /></div>
      <div><Label htmlFor="shop-unit">Unidad</Label><select id="shop-unit" value={unit} onChange={(e) => setUnit(e.target.value)} className="mt-1.5 h-11 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="ovillos">Ovillos</option><option value="unidades">Unidades</option><option value="g">Gramos</option><option value="m">Metros</option></select></div>
      <div><Label htmlFor="shop-project">Proyecto</Label><select id="shop-project" value={projectId} onChange={(e) => setProjectId(e.target.value)} className="mt-1.5 h-11 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="">Sin proyecto</option>{projects.data?.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
      <Button type="submit" disabled={add.isPending} className="h-11 gap-2 sm:col-span-2 lg:col-span-1"><Plus className="h-4 w-4" />{add.isPending ? "Guardando…" : "Agregar"}</Button>
    </form>
    {items.isLoading ? <Loading /> : items.error ? <ErrorBox error={items.error} /> : !items.data?.length ? <Empty title="Sin compras pendientes" icon={<ShoppingBasket className="h-8 w-8" />} /> : <ul className="divide-y">
      {[...items.data].sort((a, b) => Number(a.purchased) - Number(b.purchased)).map((item) => <li key={item.id} className="flex items-center gap-3 py-4">
        <Checkbox id={`purchase-${item.id}`} checked={item.purchased} disabled={update.isPending} onCheckedChange={(checked) => update.mutate({ id: item.id, purchased: checked === true })} aria-label={`Marcar ${item.description} como ${item.purchased ? "pendiente" : "comprado"}`} />
        <div className="min-w-0 flex-1 break-words">
          <Label htmlFor={`purchase-${item.id}`} className={item.purchased ? "text-muted-foreground line-through" : "text-foreground"}>{item.description}</Label>
          <p className="mt-1 text-sm text-muted-foreground">{item.quantity != null && `${fmt(item.quantity)} ${item.unit ?? ""} · `}{item.projects?.name && `${item.projects.name} · `}{item.purchased ? "Comprado" : "Pendiente"}</p>
        </div>
        <Confirm title="¿Eliminar esta compra?" description="Esta acción no se puede deshacer." onConfirm={() => remove.mutate(item.id)} trigger={<Button variant="ghost" size="icon" aria-label="Eliminar compra" title="Eliminar compra"><Trash2 className="h-4 w-4" /></Button>} />
      </li>)}
    </ul>}
  </div>;
}
