import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, Loading, Empty, ErrorBox } from "@/components/common";
import { ProjectCard } from "@/components/ProjectCard";
import { ProjectForm } from "@/components/ProjectForm";
import { useProjects, useAllCounters } from "@/lib/data";
import { projectProgress } from "@/lib/calc";
export const Route = createFileRoute("/_authenticated/proyectos/")({
  head: () => ({
    meta: [
      { title: "Mis proyectos — Teje conmigo" },
      { name: "description", content: "Tus proyectos de tejido." },
      { property: "og:title", content: "Mis proyectos — Teje conmigo" },
      { property: "og:description", content: "Tus proyectos de tejido." },
    ],
  }),
  component: ProyectosPage,
});

function ProyectosPage() {
  const p = useProjects();
  const c = useAllCounters();
  return (
    <div>
      <PageHeader
        title="Mis proyectos"
        actions={
          <ProjectForm
            trigger={
              <Button className="h-11">
                <Plus className="h-4 w-4" /> Nuevo proyecto
              </Button>
            }
          />
        }
      />
      {p.isLoading ? (
        <Loading />
      ) : p.error ? (
        <ErrorBox error={p.error} />
      ) : !p.data?.length ? (
        <Empty title="Sin proyectos" text="Creá tu primer proyecto." />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {p.data.map((x) => (
            <ProjectCard
              key={x.id}
              p={x}
              progress={projectProgress((c.data ?? []).filter((k) => k.project_id === x.id))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
