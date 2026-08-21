import type { Signal } from "@/lib/domain/signal";

const RECENCY_HORIZON_DAYS = 180;
/** A strength-3 signal today plus a strength-3 signal at ~60% recency reaches the cap. */
const RAW_SUM_CAP = 6;

function recencyDecay(daysAgo: number): number {
  return Math.max(0, 1 - daysAgo / RECENCY_HORIZON_DAYS);
}

/**
 * Recency-weighted signal activity, 0-100. Deliberately capped rather than
 * min-max normalized across the corpus, so one account's score never depends
 * on what any other account happens to contain.
 */
export function signalScore(signals: readonly Signal[]): number {
  const rawSum = signals.reduce((sum, s) => sum + s.strength * recencyDecay(s.daysAgo), 0);
  return Math.round(Math.min(rawSum / RAW_SUM_CAP, 1) * 100);
}
