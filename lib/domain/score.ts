import { z } from "zod";

export const ScoreBreakdownSchema = z.object({
  fit: z.number().int().min(0).max(100),
  signal: z.number().int().min(0).max(100),
  engagement: z.number().int().min(0).max(100),
});
export type ScoreBreakdown = z.infer<typeof ScoreBreakdownSchema>;

export const WeightsSchema = z.object({
  fit: z.number().nonnegative(),
  signal: z.number().nonnegative(),
  engagement: z.number().nonnegative(),
});
export type Weights = z.infer<typeof WeightsSchema>;

export const DEFAULT_WEIGHTS: Weights = { fit: 0.4, signal: 0.35, engagement: 0.25 };
