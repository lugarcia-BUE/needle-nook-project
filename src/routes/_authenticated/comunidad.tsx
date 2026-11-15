import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Empty } from "@/components/common";
export const Route = createFileRoute("/_authenticated/comunidad")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Comunidad — Teje conmigo" },
      { name: "description", content: "Comunidad en Teje conmigo." },
      { property: "og:title", content: "Comunidad — Teje conmigo" },
      { property: "og:description", content: "Comunidad en Teje conmigo." },
    ],
  }),
  component: () => (
    <div>
      <PageHeader title="Comunidad" />
      <Empty
        title="Sección en preparación"
        text="Esta sección se completará en la próxima etapa."
      />
    </div>
  ),
});
