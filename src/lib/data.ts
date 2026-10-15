import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { sessionElapsed } from "./calc";

export type Project = Tables<"projects">;
export type Counter = Tables<"counters">;
export type Session = Tables<"time_sessions">;
export type Material = Tables<"materials">;
export type Pattern = Tables<"patterns">;
export type Section = Tables<"sections">;

export const qk = {
  projects: ["projects"] as const,
  project: (id: string) => ["project", id] as const,
  counters: ["counters"] as const,
  sessions: ["sessions"] as const,
  active: ["active-session"] as const,
  materials: ["materials"] as const,
  patterns: ["patterns"] as const,
  shopping: ["shopping"] as const,
  profile: ["profile"] as const,
};

function unwrap<T>(r: { data: T | null; error: { message: string } | null }): T {
  if (r.error) throw new Error(r.error.message);
  return r.data as T;
}

export function useProjects() {
  return useQuery({
    queryKey: qk.projects,
    queryFn: async () => unwrap(await supabase.from("projects").select("*").order("updated_at", { ascending: false })),
  });
}

export function useAllCounters() {
  return useQuery({
    queryKey: qk.counters,
    queryFn: async () => unwrap(await supabase.from("counters").select("*").order("updated_at", { ascending: false })),
  });
}

export function useAllSessions() {
  return useQuery({
    queryKey: qk.sessions,
    queryFn: async () => unwrap(await supabase.from("time_sessions").select("*").order("started_at", { ascending: false })),
  });
}

export function useMaterials() {
  return useQuery({
    queryKey: qk.materials,
    queryFn: async () => unwrap(await supabase.from("materials").select("*").order("name")),
  });
}

export function usePatterns() {
  return useQuery({
    queryKey: qk.patterns,
    queryFn: async () => unwrap(await supabase.from("patterns").select("*").order("title")),
  });
}

export function useActiveSession() {
  return useQuery({
    queryKey: qk.active,
    queryFn: async () => unwrap(await supabase.from("time_sessions").select("*, projects(name)").is("ended_at", null).maybeSingle()),
  });
}

/** Acciones del cronómetro */
export function useTimer() {
  const qc = useQueryClient();
  const refresh = () => {
    qc.invalidateQueries({ queryKey: qk.active });
    qc.invalidateQueries({ queryKey: qk.sessions });
    qc.invalidateQueries({ queryKey: ["project"] });
  };
  const onError = (e: Error) => toast.error(e.message.includes("one_active") ? "Ya tenés una sesión en curso. Finalizala antes de iniciar otra." : e.message);
  const start = useMutation({
    mutationFn: async (projectId: string) => unwrap(await supabase.from("time_sessions").insert({ project_id: projectId }).select().single()),
    onSuccess: () => { toast.success("Sesión iniciada"); refresh(); },
    onError,
  });
  const pause = useMutation({
    mutationFn: async (s: Session) => unwrap(await supabase.from("time_sessions").update({ paused_at: new Date().toISOString() }).eq("id", s.id).select().single()),
    onSuccess: refresh, onError,
  });
  const resume = useMutation({
    mutationFn: async (s: Session) => {
      const extra = s.paused_at ? Math.floor((Date.now() - new Date(s.paused_at).getTime()) / 1000) : 0;
      return unwrap(await supabase.from("time_sessions").update({ paused_at: null, paused_seconds: s.paused_seconds + Math.max(0, extra) }).eq("id", s.id).select().single());
    },
    onSuccess: refresh, onError,
  });
  const finish = useMutation({
    mutationFn: async ({ s, notes }: { s: Session; notes?: string }) => {
      const duration = sessionElapsed(s);
      return unwrap(await supabase.from("time_sessions").update({ ended_at: new Date().toISOString(), duration_seconds: duration, paused_at: null, notes: notes?.slice(0, 1000) || s.notes }).eq("id", s.id).select().single());
    },
    onSuccess: () => { toast.success("Sesión guardada"); refresh(); },
    onError,
  });
  return { start, pause, resume, finish };
}

export function useCounterChange() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: { id: string; action: "sumar" | "restar" | "editar" | "deshacer"; value?: number }) =>
      unwrap(await supabase.rpc("counter_change", { _counter_id: v.id, _action: v.action, _value: v.value })),
    onMutate: async (v) => {
      // Actualización optimista para que el botón responda al instante.
      if (v.action !== "sumar" && v.action !== "restar") return;
      const patch = (c: Counter) => (c.id === v.id ? { ...c, current_value: Math.max(0, c.current_value + (v.action === "sumar" ? 1 : -1)) } : c);
      qc.setQueriesData<Counter[]>({ queryKey: qk.counters }, (old) => old?.map(patch));
    },
    onError: (e: Error) => toast.error(e.message),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: qk.counters });
      qc.invalidateQueries({ queryKey: ["history"] });
    },
  });
}
