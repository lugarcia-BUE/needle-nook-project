import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Pause, Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useActiveSession, useTimer } from "@/lib/data";
import { formatClock, sessionElapsed } from "@/lib/calc";

export function useTick(active: boolean) {
  const [, set] = useState(0);
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => set((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, [active]);
}

export function ActiveSessionBar() {
  const { data: s } = useActiveSession();
  const timer = useTimer();
  useTick(!!s && !s.paused_at);
  if (!s) return null;
  const name = (s as unknown as { projects?: { name: string } }).projects?.name ?? "Proyecto";
  return (
    <div className="sticky top-[57px] z-20 flex flex-wrap items-center justify-between gap-2 border-b bg-secondary px-4 py-2 text-secondary-foreground lg:top-0">
      <Link to="/proyectos/$id" params={{ id: s.project_id }} className="font-medium hover:underline">
        {s.paused_at ? "En pausa" : "Tejiendo"}: {name} · <span className="font-mono tabular-nums">{formatClock(sessionElapsed(s))}</span>
      </Link>
      <div className="flex gap-2">
        {s.paused_at ? (
          <Button size="sm" variant="outline" onClick={() => timer.resume.mutate(s)}><Play className="h-4 w-4" /> Reanudar</Button>
        ) : (
          <Button size="sm" variant="outline" onClick={() => timer.pause.mutate(s)}><Pause className="h-4 w-4" /> Pausar</Button>
        )}
        <Button size="sm" onClick={() => timer.finish.mutate({ s })}><Square className="h-4 w-4" /> Finalizar</Button>
      </div>
    </div>
  );
}
