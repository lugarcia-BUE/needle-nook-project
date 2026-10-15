import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, Json } from "@/integrations/supabase/types";
import { sessionElapsed } from "./calc";

export type Project = Tables<"projects">;
export type Counter = Tables<"counters">;
export type Session = Tables<"time_sessions">;
export type Material = Tables<"materials">;
export type Pattern = Tables<"patterns">;
export type Section = Tables<"sections">;
export type Calculation = Tables<"calculations">;
export type ProjectMaterial = Tables<"project_materials">;
export type ShoppingItem = Tables<"shopping_items">;
export type Profile = Tables<"profiles">;

export const qk = {
  projects: ["projects"] as const,
  project: (id: string) => ["project", id] as const,
  counters: ["counters"] as const,
  sessions: ["sessions"] as const,
  active: ["active-session"] as const,
  materials: ["materials"] as const,
  projectMaterials: (projectId?: string) => ["project_materials", projectId ?? "all"] as const,
  calculations: (projectId?: string) => ["calculations", projectId ?? "all"] as const,
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
    queryFn: async () =>
      unwrap(await supabase.from("projects").select("*").order("updated_at", { ascending: false })),
  });
}

export function useAllCounters() {
  return useQuery({
    queryKey: qk.counters,
    queryFn: async () =>
      unwrap(await supabase.from("counters").select("*").order("updated_at", { ascending: false })),
  });
}

export function useAllSessions() {
  return useQuery({
    queryKey: qk.sessions,
    queryFn: async () =>
      unwrap(
        await supabase.from("time_sessions").select("*").order("started_at", { ascending: false }),
      ),
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
    queryFn: async () =>
      unwrap(
        await supabase
          .from("time_sessions")
          .select("*, projects(name)")
          .is("ended_at", null)
          .maybeSingle(),
      ),
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
  const onError = (e: Error) =>
    toast.error(
      e.message.includes("one_active")
        ? "Ya tenés una sesión en curso. Finalizala antes de iniciar otra."
        : e.message,
    );
  const start = useMutation({
    mutationFn: async (projectId: string) =>
      unwrap(
        await supabase.from("time_sessions").insert({ project_id: projectId }).select().single(),
      ),
    onSuccess: () => {
      toast.success("Sesión iniciada");
      refresh();
    },
    onError,
  });
  const pause = useMutation({
    mutationFn: async (s: Session) =>
      unwrap(
        await supabase
          .from("time_sessions")
          .update({ paused_at: new Date().toISOString() })
          .eq("id", s.id)
          .select()
          .single(),
      ),
    onSuccess: refresh,
    onError,
  });
  const resume = useMutation({
    mutationFn: async (s: Session) => {
      const extra = s.paused_at
        ? Math.floor((Date.now() - new Date(s.paused_at).getTime()) / 1000)
        : 0;
      return unwrap(
        await supabase
          .from("time_sessions")
          .update({ paused_at: null, paused_seconds: s.paused_seconds + Math.max(0, extra) })
          .eq("id", s.id)
          .select()
          .single(),
      );
    },
    onSuccess: refresh,
    onError,
  });
  const finish = useMutation({
    mutationFn: async ({ s, notes }: { s: Session; notes?: string }) => {
      const duration = sessionElapsed(s);
      return unwrap(
        await supabase
          .from("time_sessions")
          .update({
            ended_at: new Date().toISOString(),
            duration_seconds: duration,
            paused_at: null,
            notes: notes?.slice(0, 1000) || s.notes,
          })
          .eq("id", s.id)
          .select()
          .single(),
      );
    },
    onSuccess: () => {
      toast.success("Sesión guardada");
      refresh();
    },
    onError,
  });
  return { start, pause, resume, finish };
}

export function useCounterChange() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: {
      id: string;
      action: "sumar" | "restar" | "editar" | "deshacer";
      value?: number;
    }) =>
      unwrap(
        await supabase.rpc("counter_change", {
          _counter_id: v.id,
          _action: v.action,
          ...(v.value !== undefined ? { _value: v.value } : {}),
        }),
      ),
    onMutate: async (v) => {
      // Actualización optimista para que el botón responda al instante.
      if (v.action !== "sumar" && v.action !== "restar") return;
      const patch = (c: Counter) =>
        c.id === v.id
          ? { ...c, current_value: Math.max(0, c.current_value + (v.action === "sumar" ? 1 : -1)) }
          : c;
      qc.setQueriesData<Counter[]>({ queryKey: qk.counters }, (old) => old?.map(patch));
    },
    onError: (e: Error) => toast.error(e.message),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: qk.counters });
      qc.invalidateQueries({ queryKey: ["history"] });
    },
  });
}

// ---- Cálculos ----
export function useCalculations(projectId?: string) {
  return useQuery({
    queryKey: qk.calculations(projectId),
    queryFn: async () => {
      let q = supabase
        .from("calculations")
        .select("*, projects(name)")
        .order("created_at", { ascending: false });
      if (projectId) {
        q = q.eq("project_id", projectId);
      }
      return unwrap(await q);
    },
  });
}

export function useSaveCalculation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (c: {
      project_id: string;
      kind: "regla_de_tres" | "muestra";
      title?: string | null;
      inputs: Json;
      result: Json;
    }) =>
      unwrap(
        await supabase
          .from("calculations")
          .insert({
            project_id: c.project_id,
            kind: c.kind,
            title: c.title || null,
            inputs: c.inputs,
            result: c.result,
          })
          .select()
          .single(),
      ),
    onSuccess: () => {
      toast.success("Cálculo guardado en el proyecto");
      qc.invalidateQueries({ queryKey: ["calculations"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteCalculation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return unwrap(await supabase.from("calculations").delete().eq("id", id));
    },
    onSuccess: () => {
      toast.success("Cálculo eliminado");
      qc.invalidateQueries({ queryKey: ["calculations"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ---- Materiales ----
export function useSaveMaterial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (m: {
      id?: string;
      kind: "hilado" | "aguja" | "accesorio";
      name: string;
      brand?: string | null;
      composition?: string | null;
      weight_category?: string | null;
      color?: string | null;
      color_code?: string | null;
      skein_weight_g?: number | null;
      skein_length_m?: number | null;
      quantity_available?: number;
      needle_type?: string | null;
      diameter_mm?: number | null;
      length_cm?: number | null;
      notes?: string | null;
    }) => {
      const { id, ...data } = m;
      if (id) {
        return unwrap(await supabase.from("materials").update(data).eq("id", id).select().single());
      }
      return unwrap(await supabase.from("materials").insert(data).select().single());
    },
    onSuccess: (_data, variables) => {
      toast.success(variables.id ? "Material actualizado" : "Material guardado");
      qc.invalidateQueries({ queryKey: qk.materials });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteMaterial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return unwrap(await supabase.from("materials").delete().eq("id", id));
    },
    onSuccess: () => {
      toast.success("Material eliminado");
      qc.invalidateQueries({ queryKey: qk.materials });
      qc.invalidateQueries({ queryKey: ["project_materials"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export type PopulatedProjectMaterial = ProjectMaterial & {
  materials: Material | null;
  projects: { name: string } | null;
};

export function useProjectMaterials(projectId?: string) {
  return useQuery({
    queryKey: qk.projectMaterials(projectId),
    queryFn: async () => {
      let q = supabase
        .from("project_materials")
        .select("*, materials(*), projects(name)")
        .order("created_at", { ascending: false });
      if (projectId) {
        q = q.eq("project_id", projectId);
      }
      return unwrap(await q) as unknown as PopulatedProjectMaterial[];
    },
  });
}

export function useAssignProjectMaterial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (pm: {
      project_id: string;
      material_id: string;
      required_grams?: number | null;
      required_meters?: number | null;
      qty_estimated?: number | null;
      qty_purchased?: number | null;
      qty_used?: number | null;
      notes?: string | null;
    }) => unwrap(await supabase.from("project_materials").insert(pm).select().single()),
    onSuccess: () => {
      toast.success("Material asignado al proyecto");
      qc.invalidateQueries({ queryKey: ["project_materials"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateProjectMaterial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...patch
    }: {
      id: string;
      required_grams?: number | null;
      required_meters?: number | null;
      qty_estimated?: number | null;
      qty_purchased?: number | null;
      qty_used?: number | null;
      notes?: string | null;
    }) =>
      unwrap(await supabase.from("project_materials").update(patch).eq("id", id).select().single()),
    onSuccess: () => {
      toast.success("Material de proyecto actualizado");
      qc.invalidateQueries({ queryKey: ["project_materials"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useRemoveProjectMaterial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return unwrap(await supabase.from("project_materials").delete().eq("id", id));
    },
    onSuccess: () => {
      toast.success("Material quitado del proyecto");
      qc.invalidateQueries({ queryKey: ["project_materials"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ---- Compras ----
export function useShoppingItems(projectId?: string) {
  return useQuery({
    queryKey: qk.shopping,
    queryFn: async () => {
      let q = supabase
        .from("shopping_items")
        .select("*, projects(name)")
        .order("created_at", { ascending: false });
      if (projectId) {
        q = q.eq("project_id", projectId);
      }
      return unwrap(await q);
    },
  });
}

export function useAddShoppingItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (item: {
      description: string;
      quantity?: number | null;
      unit?: string | null;
      project_id?: string | null;
    }) => unwrap(await supabase.from("shopping_items").insert(item).select().single()),
    onSuccess: () => {
      toast.success("Elemento agregado a la lista de compras");
      qc.invalidateQueries({ queryKey: qk.shopping });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
