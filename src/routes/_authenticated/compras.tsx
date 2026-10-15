import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Empty } from "@/components/common";
export const Route = createFileRoute("/_authenticated/compras")({
  head: () => ({ meta: [{ title: "Compras — Teje conmigo" }, { name: "description", content: "Compras en Teje conmigo." }, { property: "og:title", content: "Compras — Teje conmigo" }, { property: "og:description", content: "Compras en Teje conmigo." }] }),
  component: () => (<div><PageHeader title="Compras" /><Empty title="Sección en preparación" text="Esta sección se completará en la próxima etapa." /></div>),
});
