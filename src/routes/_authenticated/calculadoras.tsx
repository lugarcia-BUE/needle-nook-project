import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Empty } from "@/components/common";
export const Route = createFileRoute("/_authenticated/calculadoras")({
  head: () => ({ meta: [{ title: "Calculadoras — Teje conmigo" }, { name: "description", content: "Calculadoras en Teje conmigo." }, { property: "og:title", content: "Calculadoras — Teje conmigo" }, { property: "og:description", content: "Calculadoras en Teje conmigo." }] }),
  component: () => (<div><PageHeader title="Calculadoras" /><Empty title="Sección en preparación" text="Esta sección se completará en la próxima etapa." /></div>),
});
