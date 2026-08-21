import type { ScoreDriver } from "@/lib/domain/research";

export const SCORE_COLOR: Record<ScoreDriver, string> = {
  fit: "var(--fit)",
  signal: "var(--signal)",
  engagement: "var(--engagement)",
};

export const SCORE_DIM: Record<ScoreDriver, string> = {
  fit: "var(--fit-dim)",
  signal: "var(--signal-dim)",
  engagement: "var(--engagement-dim)",
};

export const SCORE_LABEL: Record<ScoreDriver, string> = {
  fit: "Fit",
  signal: "Signal",
  engagement: "Engagement",
};

export const SCORE_DRIVERS_LIST: readonly ScoreDriver[] = ["fit", "signal", "engagement"];
