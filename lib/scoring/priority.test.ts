import { describe, expect, it } from "vitest";
import { priorityScore, normalizeWeights } from "./priority";

describe("normalizeWeights", () => {
  it("normalizes an arbitrary triple to sum to 1", () => {
    const w = normalizeWeights({ fit: 2, signal: 1, engagement: 1 });
    expect(w.fit + w.signal + w.engagement).toBeCloseTo(1);
    expect(w.fit).toBeCloseTo(0.5);
  });

  it("falls back to equal thirds for all-zero weights", () => {
    const w = normalizeWeights({ fit: 0, signal: 0, engagement: 0 });
    expect(w.fit).toBeCloseTo(1 / 3);
    expect(w.signal).toBeCloseTo(1 / 3);
    expect(w.engagement).toBeCloseTo(1 / 3);
  });
});

describe("priorityScore", () => {
  const breakdown = { fit: 80, signal: 40, engagement: 20 };

  it("matches the weighted sum under default-shaped weights", () => {
    // 0.4*80 + 0.35*40 + 0.25*20 = 32 + 14 + 5 = 51
    expect(priorityScore(breakdown, { fit: 0.4, signal: 0.35, engagement: 0.25 })).toBe(51);
  });

  it("equals the single sub-score when weight is concentrated on one factor", () => {
    expect(priorityScore(breakdown, { fit: 1, signal: 0, engagement: 0 })).toBe(80);
    expect(priorityScore(breakdown, { fit: 0, signal: 1, engagement: 0 })).toBe(40);
    expect(priorityScore(breakdown, { fit: 0, signal: 0, engagement: 1 })).toBe(20);
  });

  it("is invariant to uniformly scaling the weights", () => {
    const a = priorityScore(breakdown, { fit: 1, signal: 1, engagement: 1 });
    const b = priorityScore(breakdown, { fit: 10, signal: 10, engagement: 10 });
    expect(a).toBe(b);
  });

  it("stays within [0, 100] for any non-negative weight triple", () => {
    const weightSets = [
      { fit: 0, signal: 0, engagement: 0 },
      { fit: 5, signal: 0, engagement: 0 },
      { fit: 0, signal: 0, engagement: 5 },
      { fit: 1, signal: 2, engagement: 3 },
    ];
    for (const w of weightSets) {
      const score = priorityScore({ fit: 100, signal: 100, engagement: 100 }, w);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    }
  });
});
