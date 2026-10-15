import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Empty } from "@/components/common";
export const Route = createFileRoute("/_authenticated/perfil")({
  head: () => ({
    meta: [
      { title: "Mi perfil — Teje conmigo" },
      { name: "description", content: "Mi perfil en Teje conmigo." },
      { property: "og:title", content: "Mi perfil — Teje conmigo" },
      { property: "og:description", content: "Mi perfil en Teje conmigo." },
    ],
  }),
  component: () => (
    <div>
      <PageHeader title="Mi perfil" />
      <Empty
        title="Sección en preparación"
        text="Esta sección se completará en la próxima etapa."
      />
    </div>
  ),
});
