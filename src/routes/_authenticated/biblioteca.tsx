import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Empty } from "@/components/common";
export const Route = createFileRoute("/_authenticated/biblioteca")({
  head: () => ({
    meta: [
      { title: "Biblioteca — Teje conmigo" },
      { name: "description", content: "Biblioteca en Teje conmigo." },
      { property: "og:title", content: "Biblioteca — Teje conmigo" },
      { property: "og:description", content: "Biblioteca en Teje conmigo." },
    ],
  }),
  component: () => (
    <div>
      <PageHeader title="Biblioteca" />
      <Empty
        title="Sección en preparación"
        text="Esta sección se completará en la próxima etapa."
      />
    </div>
  ),
});
