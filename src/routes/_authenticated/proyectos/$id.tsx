import { createFileRoute } from "@tanstack/react-router";
import { Play, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, Loading, PrivateImage } from "@/components/common";
import { ProjectForm } from "@/components/ProjectForm";
import { CounterCard, CounterForm } from "@/components/CounterCard";
import { useProjects, useAllCounters, useAllSessions, useTimer } from "@/lib/data";
import { totalSeconds, formatDuration, projectProgress, remainingEstimate } from "@/lib/calc";
export const Route = createFileRoute("/_authenticated/proyectos/$id")({
  head: () => ({ meta: [{ title: "Proyecto — Teje conmigo" }, { name: "description", content: "Detalle del proyecto." }, { property: "og:title", content: "Proyecto — Teje conmigo" }, { property: "og:description", content: "Detalle del proyecto." }] }),
  component: Detail,
});
function Detail() {
  const { id } = Route.useParams();
  const p = useProjects(); const c = useAllCounters(); const s = useAllSessions(); const timer = useTimer();
  if (p.isLoading) return <Loading />;
  const project = p.data?.find((x) => x.id === id);
  if (!project) return <p>Proyecto no encontrado.</p>;
  const counters = (c.data ?? []).filter((x) => x.project_id === id);
  const total = totalSeconds((s.data ?? []).filter((x) => x.project_id === id));
  const prog = projectProgress(counters); const rem = remainingEstimate(total, prog);
  return (<div>
    <PageHeader title={project.name} subtitle={project.description ?? undefined} actions={<>
      <Button className="h-11" onClick={() => timer.start.mutate(id)}><Play className="h-4 w-4" /> Iniciar sesión</Button>
      <ProjectForm project={project} trigger={<Button variant="outline" className="h-11">Editar</Button>} /></>} />
    <PrivateImage path={project.cover_path} alt={project.name} className="mb-6 aspect-[16/7] w-full rounded-2xl" />
    <p className="mb-6">Tiempo total: <b>{formatDuration(total)}</b>{prog !== null && <> · Avance: <b>{prog}%</b></>}{rem !== null && <> · Restante aproximado: <b>{formatDuration(rem)}</b></>}</p>
    <div className="mb-4 flex items-center justify-between"><h2 className="text-2xl font-semibold">Contadores</h2>
      <CounterForm projectId={id} trigger={<Button variant="secondary"><Plus className="h-4 w-4" /> Contador</Button>} /></div>
    <div className="grid gap-5 md:grid-cols-2">{counters.map((k) => <CounterCard key={k.id} c={k} />)}</div>
  </div>);
}
