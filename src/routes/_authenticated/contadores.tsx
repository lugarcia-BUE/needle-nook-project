import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, Loading, Empty } from "@/components/common";
import { CounterCard, CounterForm } from "@/components/CounterCard";
import { useProjects, useAllCounters } from "@/lib/data";
export const Route = createFileRoute("/_authenticated/contadores")({
  head: () => ({ meta: [{ title: "Contadores — Teje conmigo" }, { name: "description", content: "Tus contadores de vueltas." }, { property: "og:title", content: "Contadores — Teje conmigo" }, { property: "og:description", content: "Tus contadores de vueltas." }] }),
  component: () => {
    const p = useProjects(); const c = useAllCounters();
    if (c.isLoading) return <Loading />;
    const name = (id: string) => p.data?.find((x) => x.id === id)?.name;
    return (<div>
      <PageHeader title="Contadores" actions={p.data?.length ? <CounterForm projects={p.data} trigger={<Button className="h-11"><Plus className="h-4 w-4" /> Nuevo contador</Button>} /> : undefined} />
      {!c.data?.length ? <Empty title="Sin contadores" text={p.data?.length ? "Creá un contador." : "Primero creá un proyecto."} /> :
        <div className="grid gap-5 md:grid-cols-2">{c.data.map((k) => <CounterCard key={k.id} c={k} subtitle={name(k.project_id)} />)}</div>}
    </div>);
  },
});
