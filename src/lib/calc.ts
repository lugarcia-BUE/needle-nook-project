// Cálculos puros (sin dependencias) para poder probarlos.

export type RuleOfThreeResult =
  { ok: true; value: number; rounded: number; steps: string[] } | { ok: false; error: string };

export function parseNum(v: string | number | null | undefined): number | null {
  if (v === null || v === undefined) return null;
  const s = String(v).trim().replace(",", ".");
  if (s === "") return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export function fmt(n: number, decimals = 2): string {
  return n.toLocaleString("es-AR", { maximumFractionDigits: decimals });
}

/** nuevo valor = valor original × nueva medida / medida de referencia */
export function ruleOfThree(
  original: string,
  refMeasure: string,
  newMeasure: string,
): RuleOfThreeResult {
  const a = parseNum(original);
  const b = parseNum(refMeasure);
  const c = parseNum(newMeasure);
  if (a === null || b === null || c === null)
    return { ok: false, error: "Completá los tres valores con números válidos." };
  if (b === 0) return { ok: false, error: "La medida de referencia no puede ser cero." };
  if (a < 0 || b < 0 || c < 0) return { ok: false, error: "Los valores no pueden ser negativos." };
  const value = (a * c) / b;
  return {
    ok: true,
    value,
    rounded: Math.round(value),
    steps: [
      `${fmt(a)} corresponden a ${fmt(b)}`,
      `Nuevo valor = ${fmt(a)} × ${fmt(c)} ÷ ${fmt(b)}`,
      `Nuevo valor = ${fmt(a * c)} ÷ ${fmt(b)} = ${fmt(value, 4)}`,
    ],
  };
}

export type GaugeResult =
  | {
      ok: true;
      stitchesPerCm: number;
      rowsPerCm: number;
      stitches: { raw: number; rounded: number } | null;
      rows: { raw: number; rounded: number } | null;
    }
  | { ok: false; error: string };

/** Muestra de 10 × 10 cm */
export function gauge(
  stitches10: string,
  rows10: string,
  width: string,
  height: string,
): GaugeResult {
  const s = parseNum(stitches10);
  const r = parseNum(rows10);
  if (s === null || r === null)
    return { ok: false, error: "Ingresá los puntos y las filas de tu muestra." };
  if (s <= 0 || r <= 0)
    return { ok: false, error: "Los puntos y filas de la muestra deben ser mayores que cero." };
  const w = parseNum(width);
  const h = parseNum(height);
  if ((w !== null && w < 0) || (h !== null && h < 0))
    return { ok: false, error: "Las medidas no pueden ser negativas." };
  const spc = s / 10;
  const rpc = r / 10;
  return {
    ok: true,
    stitchesPerCm: spc,
    rowsPerCm: rpc,
    stitches: w === null ? null : { raw: spc * w, rounded: Math.round(spc * w) },
    rows: h === null ? null : { raw: rpc * h, rounded: Math.round(rpc * h) },
  };
}

/** Progreso de un contador: null si no hay objetivo (no inventamos porcentajes). */
export function counterProgress(current: number, target: number | null | undefined): number | null {
  if (!target || target <= 0) return null;
  return Math.min(100, Math.round((Math.max(0, current) / target) * 100));
}

/** Progreso de un proyecto según los contadores con objetivo. */
export function projectProgress(
  counters: { current_value: number; target_value: number | null }[],
): number | null {
  const withTarget = counters.filter((c) => c.target_value && c.target_value > 0);
  if (withTarget.length === 0) return null;
  const total = withTarget.reduce((a, c) => a + (c.target_value as number), 0);
  const done = withTarget.reduce(
    (a, c) => a + Math.min(c.current_value, c.target_value as number),
    0,
  );
  return Math.round((done / total) * 100);
}

/** Ovillos necesarios: usa gramos y/o metros; si no hay datos devuelve null. */
export function skeinsNeeded(opts: {
  requiredGrams?: number | null | undefined;
  requiredMeters?: number | null | undefined;
  skeinWeight?: number | null | undefined;
  skeinLength?: number | null | undefined;
  manualEstimate?: number | null | undefined;
}): { needed: number; basis: string } | null {
  const candidates: { n: number; basis: string }[] = [];
  if (opts.requiredGrams && opts.skeinWeight)
    candidates.push({
      n: Math.ceil(opts.requiredGrams / opts.skeinWeight),
      basis: `${fmt(opts.requiredGrams)} g ÷ ${fmt(opts.skeinWeight)} g por ovillo`,
    });
  if (opts.requiredMeters && opts.skeinLength)
    candidates.push({
      n: Math.ceil(opts.requiredMeters / opts.skeinLength),
      basis: `${fmt(opts.requiredMeters)} m ÷ ${fmt(opts.skeinLength)} m por ovillo`,
    });
  if (candidates.length) {
    const best = candidates.reduce((a, b) => (b.n > a.n ? b : a));
    return { needed: best.n, basis: best.basis };
  }
  if (opts.manualEstimate != null && opts.manualEstimate >= 0)
    return { needed: opts.manualEstimate, basis: "estimación cargada manualmente" };
  return null;
}

export function skeinsMissing(
  needed: number,
  available: number,
  purchased: number | null | undefined,
): number {
  return Math.max(0, Math.ceil(needed - available - (purchased ?? 0)));
}

// ---- Tiempo ----
export type SessionLike = {
  started_at: string;
  ended_at: string | null;
  paused_seconds: number;
  paused_at: string | null;
  duration_seconds: number | null;
};

export function sessionElapsed(s: SessionLike, now = Date.now()): number {
  if (s.ended_at && s.duration_seconds != null) return s.duration_seconds;
  const start = new Date(s.started_at).getTime();
  const end = s.ended_at
    ? new Date(s.ended_at).getTime()
    : s.paused_at
      ? new Date(s.paused_at).getTime()
      : now;
  return Math.max(0, Math.floor((end - start) / 1000) - s.paused_seconds);
}

/** Suma solo sesiones finalizadas, sin duplicar ids. */
export function totalSeconds(sessions: (SessionLike & { id: string })[]): number {
  const seen = new Set<string>();
  let t = 0;
  for (const s of sessions) {
    if (seen.has(s.id) || !s.ended_at || s.duration_seconds == null) continue;
    seen.add(s.id);
    t += s.duration_seconds;
  }
  return t;
}

export function formatDuration(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h === 0) return `${m} min`;
  return `${h} h ${m.toString().padStart(2, "0")} min`;
}

export function formatClock(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return [h, m, s].map((x) => x.toString().padStart(2, "0")).join(":");
}

/** Tiempo restante aproximado: tiempo invertido × (100 − p) / p */
export function remainingEstimate(totalSec: number, progressPct: number | null): number | null {
  if (progressPct === null || progressPct <= 0 || progressPct >= 100 || totalSec <= 0) return null;
  return Math.round((totalSec * (100 - progressPct)) / progressPct);
}

export function startOfWeek(d = new Date()): Date {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7; // lunes = 0
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - day);
  return x;
}
export function startOfMonth(d = new Date()): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
