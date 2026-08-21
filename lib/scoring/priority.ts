import type { ScoreBreakdown, Weights } from "@/lib/domain/score";

/**
 * Normalizes an arbitrary non-negative weight triple to sum to 1.
 * All-zero weights fall back to equal thirds rather than dividing by zero.
 */
export function normalizeWeights(weights: Weights): Weights {
  const total = weights.fit + weights.signal + weights.engagement;
  if (total <= 0) return { fit: 1 / 3, signal: 1 / 3, engagement: 1 / 3 };
  return { fit: weights.fit / total, signal: weights.signal / total, engagement: weights.engagement / total };
}

/**
 * The only place weights are applied. Sub-scores in `breakdown` never change
 * with `weights` — only this composite does. Runs identically in the browser
 * (live slider recompute) and on the server (default-weight precompute).
 */
export function priorityScore(breakdown: ScoreBreakdown, weights: Weights): number {
  const w = normalizeWeights(weights);
  const raw = w.fit * breakdown.fit + w.signal * breakdown.signal + w.engagement * breakdown.engagement;
  return Math.round(raw);
}
