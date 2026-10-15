import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, Loading, Empty } from "@/components/common";
import { ProjectCard } from "@/components/ProjectCard";
import { ProjectForm } from "@/components/ProjectForm";
import { useProjects, useAllCounters, useAllSessions } from "@/lib/data";
import { projectProgress, totalSeconds, formatDuration, startOfWeek } from "@/lib/calc";
export const Route = createFileRoute("/_authenticated/inicio")({
  head: () => ({ meta: [{ title: "Inicio — Teje conmigo" }, { name: "description", content: "Tu panel de tejido." }, { property: "og:title", content: "Inicio — Teje conmigo" }, { property: "og:description", content: "Tu panel de tejido." }] }),
  component: Inicio,
});
function Inicio() {
  const p = useProjects(); const c = useAllCounters(); const s = useAllSessions();
  if (p.isLoading) return <Loading />;
  const projects = p.data ?? []; const counters = c.data ?? [];
  const wk = startOfWeek().getTime();
  const week = totalSeconds((s.data ?? []).filter((x) => new Date(x.started_at).getTime() >= wk));
  const prog = (id: string) => projectProgress(counters.filter((x) => x.project_id === id));
  const active = projects.filter((x) => x.status === "activo");
  return (<div>
    <PageHeader title="Inicio" actions={<><ProjectForm trigger={<Button className="h-11"><Plus className="h-4 w-4" /> Nuevo proyecto</Button>} /><Button asChild variant="secondary" className="h-11"><Link to="/contadores">Abrir contadores</Link></Button></>} />
    <div className="mb-8 grid gap-4 sm:grid-cols-3">
      <div className="rounded-2xl border bg-card p-5"><p className="text-muted-foreground">Tiempo esta semana</p><p className="font-display text-3xl">{formatDuration(week)}</p></div>
      <div className="rounded-2xl border bg-card p-5"><p className="text-muted-foreground">Proyectos activos</p><p className="font-display text-3xl">{active.length}</p></div>
      <div className="rounded-2xl border bg-card p-5"><p className="text-muted-foreground">Terminados</p><p className="font-display text-3xl">{projects.filter((x) => x.status === "terminado").length}</p></div>
    </div>
    <h2 className="mb-4 text-2xl font-semibold">Últimos proyectos</h2>
    {projects.length === 0 ? <Empty title="Todavía no tenés proyectos" text="Creá el primero para empezar a contar vueltas." /> :
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{projects.slice(0, 6).map((x) => <ProjectCard key={x.id} p={x} progress={prog(x.id)} />)}</div>}
  </div>);
}
