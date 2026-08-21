import { z } from "zod";

export const SIGNAL_TYPES = [
  "funding",
  "hiring-surge",
  "leadership-change",
  "tech-change",
  "website-change",
] as const;
export type SignalType = (typeof SIGNAL_TYPES)[number];

export const SignalSchema = z.object({
  id: z.string(),
  accountId: z.string(),
  type: z.enum(SIGNAL_TYPES),
  strength: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  daysAgo: z.number().int().min(0).max(180),
  description: z.string(),
});

export type Signal = z.infer<typeof SignalSchema>;
