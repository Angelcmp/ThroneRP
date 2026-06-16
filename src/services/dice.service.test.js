import { describe, it, expect } from "vitest";
import { roll, rollCheck } from "./dice.service.js";

describe("roll", () => {
  it("tira un d20", () => {
    const result = roll("d20");
    expect(result.formula).toBe("d20");
    expect(result.results).toHaveLength(1);
    expect(result.results[0]).toBeGreaterThanOrEqual(1);
    expect(result.results[0]).toBeLessThanOrEqual(20);
    expect(result.total).toBeGreaterThanOrEqual(1);
    expect(result.total).toBeLessThanOrEqual(20);
  });

  it("tira 3d6", () => {
    const result = roll("3d6");
    expect(result.results).toHaveLength(3);
    result.results.forEach((r) => {
      expect(r).toBeGreaterThanOrEqual(1);
      expect(r).toBeLessThanOrEqual(6);
    });
  });

  it("tira d100 (d%)", () => {
    const result = roll("d%");
    expect(result.results).toHaveLength(1);
    expect(result.results[0]).toBeGreaterThanOrEqual(1);
    expect(result.results[0]).toBeLessThanOrEqual(100);
  });

  it("tira 4d6kh3 (keep highest)", () => {
    const result = roll("4d6kh3");
    expect(result.results).toHaveLength(4);
    expect(result.kept).toHaveLength(3);
    const sorted = [...result.results].sort((a, b) => b - a);
    expect(result.kept).toEqual(sorted.slice(0, 3));
  });

  it("tira con modificador", () => {
    const result = roll("d20+5");
    expect(result.modifier).toBe(5);
    expect(result.total).toBe(result.subtotal + 5);
  });

  it("tira con modificador negativo", () => {
    const result = roll("d20-2");
    expect(result.modifier).toBe(-2);
  });

  it("detecta critical hit en d20", () => {
    let hasCrit = false;
    for (let i = 0; i < 100; i++) {
      const r = roll("d20");
      if (r.criticalHit) {
        hasCrit = true;
        expect(r.results[0]).toBe(20);
        break;
      }
    }
    expect(hasCrit).toBe(true);
  });

  it("lanza error con formula invalida", () => {
    expect(() => roll("")).toThrow();
    expect(() => roll("abc")).toThrow();
    expect(() => roll("d")).toThrow();
  });
});

describe("rollCheck", () => {
  it("hace un ability check con stat 16 (mod +3)", () => {
    const result = rollCheck(16, 15);
    expect(result.modifier).toBe(3);
    expect(typeof result.success).toBe("string");
    expect(result.description).toBeDefined();
  });

  it("hace un ability check con stat 8 (mod -1)", () => {
    const result = rollCheck(8, 10);
    expect(result.modifier).toBe(-1);
  });
});
