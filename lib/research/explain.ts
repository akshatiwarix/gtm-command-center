import type { ScoreBreakdown, Weights } from "@/lib/domain/score";
import type { RankExplanation, ScoreDriver } from "@/lib/domain/research";
import { normalizeWeights } from "@/lib/scoring/priority";
import { tier } from "./tier";

const DRIVER_LABEL: Record<ScoreDriver, string> = {
  fit: "account fit",
  signal: "recent signal activity",
  engagement: "engagement history",
};

/** Fixed tie-break order when weighted contributions are equal: fit, then signal, then engagement. */
const DRIVER_ORDER: readonly ScoreDriver[] = ["fit", "signal", "engagement"];

function dominantDriver(breakdown: ScoreBreakdown, weights: Weights): ScoreDriver {
  const w = normalizeWeights(weights);
  const contributions: Record<ScoreDriver, number> = {
    fit: w.fit * breakdown.fit,
    signal: w.signal * breakdown.signal,
    engagement: w.engagement * breakdown.engagement,
  };

  let best: ScoreDriver = "fit";
  for (const driver of DRIVER_ORDER) {
    if (contributions[driver] > contributions[best]) best = driver;
  }
  return best;
}

/** Reused identically by the precomputed default-weight result and, if ever needed, client-side. */
export function explainRank(
  breakdown: ScoreBreakdown,
  weights: Weights,
  rank: number,
  accountCount: number,
): RankExplanation {
  const driver = dominantDriver(breakdown, weights);
  const text =
    `Ranked #${rank} of ${accountCount} — driven primarily by ${DRIVER_LABEL[driver]}. ` +
    `Fit is ${tier(breakdown.fit)}, recent signal activity is ${tier(breakdown.signal)}, ` +
    `and engagement is ${tier(breakdown.engagement)}.`;

  return { dominantDriver: driver, text };
}
