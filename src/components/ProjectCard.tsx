import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { PrivateImage, ProgressBar } from "./common";
import { label, STATUSES, TECHNIQUES } from "@/lib/options";
import type { Project } from "@/lib/data";

export function ProjectCard({ p, progress }: { p: Project; progress: number | null }) {
  return (
    <Link
      to="/proyectos/$id"
      params={{ id: p.id }}
      className="group overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:shadow-md"
    >
      <PrivateImage path={p.cover_path} alt={p.name} className="aspect-[4/3] w-full" />
      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold leading-tight group-hover:text-primary">{p.name}</h3>
          <Badge variant={p.status === "activo" ? "default" : "secondary"}>
            {label(STATUSES, p.status)}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {label(TECHNIQUES, p.technique)}
          {p.garment_type ? ` · ${p.garment_type}` : ""}
        </p>
        {progress !== null ? (
          <div className="space-y-1">
            <ProgressBar value={progress} />
            <p className="text-xs text-muted-foreground">{progress}% de avance</p>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Sin objetivo de vueltas definido</p>
        )}
      </div>
    </Link>
  );
}
