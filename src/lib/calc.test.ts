import { describe, it, expect } from "vitest";
import { ruleOfThree, gauge, counterProgress, projectProgress, skeinsNeeded, skeinsMissing, totalSeconds, remainingEstimate, sessionElapsed } from "./calc";

describe("regla de tres", () => {
  it("20 pts = 10 cm → 35 cm = 70 pts", () => {
    const r = ruleOfThree("20", "10", "35");
    expect(r.ok && r.value).toBe(70);
  });
  it("rechaza referencia cero y texto", () => {
    expect(ruleOfThree("20", "0", "5").ok).toBe(false);
    expect(ruleOfThree("abc", "10", "5").ok).toBe(false);
  });
  it("acepta coma decimal", () => {
    const r = ruleOfThree("18", "10", "12,5");
    expect(r.ok && r.value).toBeCloseTo(22.5);
  });
});

describe("muestra", () => {
  it("calcula y redondea conservando el valor", () => {
    const g = gauge("22", "30", "45", "60");
    expect(g.ok).toBe(true);
    if (g.ok) {
      expect(g.stitchesPerCm).toBeCloseTo(2.2);
      expect(g.stitches?.raw).toBeCloseTo(99);
      expect(g.stitches?.rounded).toBe(99);
      expect(g.rows?.rounded).toBe(180);
    }
    const g2 = gauge("17", "23", "33", "");
    if (g2.ok) {
      expect(g2.stitches?.raw).toBeCloseTo(56.1);
      expect(g2.stitches?.rounded).toBe(56);
      expect(g2.rows).toBeNull();
    }
  });
  it("rechaza cero", () => expect(gauge("0", "10", "1", "1").ok).toBe(false));
});

describe("progreso", () => {
  it("sin objetivo no inventa porcentaje", () => {
    expect(counterProgress(5, null)).toBeNull();
    expect(projectProgress([{ current_value: 3, target_value: null }])).toBeNull();
  });
  it("con objetivo", () => {
    expect(counterProgress(25, 100)).toBe(25);
    expect(counterProgress(150, 100)).toBe(100);
    expect(projectProgress([{ current_value: 10, target_value: 20 }, { current_value: 30, target_value: 20 }])).toBe(75);
  });
});

describe("materiales", () => {
  it("ovillos por gramos y metros (toma el mayor)", () => {
    expect(skeinsNeeded({ requiredGrams: 450, skeinWeight: 100 })?.needed).toBe(5);
    expect(skeinsNeeded({ requiredGrams: 300, skeinWeight: 100, requiredMeters: 900, skeinLength: 200 })?.needed).toBe(5);
    expect(skeinsNeeded({})).toBeNull();
    expect(skeinsMissing(5, 2, 1)).toBe(2);
    expect(skeinsMissing(5, 8, 0)).toBe(0);
  });
});

describe("tiempo", () => {
  it("suma sin duplicar y omite activas", () => {
    const base = { paused_seconds: 0, paused_at: null, started_at: "2026-01-01T10:00:00Z" };
    const s = [
      { ...base, id: "a", ended_at: "x", duration_seconds: 600 },
      { ...base, id: "a", ended_at: "x", duration_seconds: 600 },
      { ...base, id: "b", ended_at: null, duration_seconds: null },
      { ...base, id: "c", ended_at: "x", duration_seconds: 300 },
    ];
    expect(totalSeconds(s)).toBe(900);
  });
  it("descuenta pausas", () => {
    const e = sessionElapsed({ started_at: "2026-01-01T10:00:00Z", ended_at: null, paused_at: null, paused_seconds: 60, duration_seconds: null }, new Date("2026-01-01T10:10:00Z").getTime());
    expect(e).toBe(540);
  });
  it("estimación restante", () => {
    expect(remainingEstimate(3600, 25)).toBe(10800);
    expect(remainingEstimate(3600, null)).toBeNull();
  });
});
