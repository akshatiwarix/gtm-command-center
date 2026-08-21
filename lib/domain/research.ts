import { z } from "zod";

export const ResearchBulletSchema = z.object({
  text: z.string(),
  sourceSignalId: z.string().nullable(),
});
export type ResearchBullet = z.infer<typeof ResearchBulletSchema>;

export const SCORE_DRIVERS = ["fit", "signal", "engagement"] as const;
export type ScoreDriver = (typeof SCORE_DRIVERS)[number];

export const RankExplanationSchema = z.object({
  dominantDriver: z.enum(SCORE_DRIVERS),
  text: z.string(),
});
export type RankExplanation = z.infer<typeof RankExplanationSchema>;
