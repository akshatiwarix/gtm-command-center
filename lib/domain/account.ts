import { z } from "zod";

export const INDUSTRIES = ["SaaS", "Fintech", "Healthcare", "Retail", "Manufacturing", "Other"] as const;
export type Industry = (typeof INDUSTRIES)[number];

export const SIZE_BUCKETS = ["1-50", "51-200", "201-1000", "1000+"] as const;
export type CompanySizeBucket = (typeof SIZE_BUCKETS)[number];

export const REGIONS = ["NA", "EMEA", "APAC", "LATAM"] as const;
export type Region = (typeof REGIONS)[number];

export const AccountSchema = z.object({
  id: z.string(),
  name: z.string(),
  industry: z.enum(INDUSTRIES),
  sizeBucket: z.enum(SIZE_BUCKETS),
  region: z.enum(REGIONS),
  techStackMatch: z.boolean(),
  emailOpens: z.number().int().nonnegative(),
  meetingsBooked: z.number().int().nonnegative(),
  lastTouchDaysAgo: z.number().int().min(0).max(180),
});

export type Account = z.infer<typeof AccountSchema>;
