import { z } from "zod";
import { AccountSchema } from "./account";
import { SignalSchema } from "./signal";
import { ScoreBreakdownSchema } from "./score";
import { ResearchBulletSchema, RankExplanationSchema } from "./research";

export const AccountResultSchema = z.object({
  account: AccountSchema,
  signals: z.array(SignalSchema),
  scores: ScoreBreakdownSchema,
  priorityScore: z.number().int().min(0).max(100),
  rank: z.number().int().positive(),
  isTopPriority: z.boolean(),
  research: z.array(ResearchBulletSchema),
  explanation: RankExplanationSchema,
});
export type AccountResult = z.infer<typeof AccountResultSchema>;

export const FeedItemSchema = z.object({
  accountId: z.string(),
  accountName: z.string(),
  signal: SignalSchema,
});
export type FeedItem = z.infer<typeof FeedItemSchema>;

export const CommandCenterResultSchema = z.object({
  generatedAt: z.string(),
  asOfDate: z.string(),
  accountCount: z.number().int().positive(),
  accounts: z.array(AccountResultSchema),
  globalFeed: z.array(FeedItemSchema),
});
export type CommandCenterResult = z.infer<typeof CommandCenterResultSchema>;
