import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Empty } from "@/components/common";
export const Route = createFileRoute("/_authenticated/materiales")({
  head: () => ({ meta: [{ title: "Materiales — Teje conmigo" }, { name: "description", content: "Materiales en Teje conmigo." }, { property: "og:title", content: "Materiales — Teje conmigo" }, { property: "og:description", content: "Materiales en Teje conmigo." }] }),
  component: () => (<div><PageHeader title="Materiales" /><Empty title="Sección en preparación" text="Esta sección se completará en la próxima etapa." /></div>),
});
