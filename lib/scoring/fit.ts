import type { Account, Industry, CompanySizeBucket, Region } from "@/lib/domain/account";

const INDUSTRY_FIT: Record<Industry, number> = {
  SaaS: 1.0,
  Fintech: 0.9,
  Healthcare: 0.5,
  Retail: 0.3,
  Manufacturing: 0.3,
  Other: 0.2,
};

const SIZE_FIT: Record<CompanySizeBucket, number> = {
  "1-50": 0.3,
  "51-200": 1.0,
  "201-1000": 0.8,
  "1000+": 0.4,
};

const REGION_FIT: Record<Region, number> = {
  NA: 1.0,
  EMEA: 0.8,
  APAC: 0.6,
  LATAM: 0.5,
};

/** Static firmographic ICP match, 0-100. Never changes with the weight sliders. */
export function fitScore(account: Account): number {
  const industryFit = INDUSTRY_FIT[account.industry];
  const sizeFit = SIZE_FIT[account.sizeBucket];
  const regionFit = REGION_FIT[account.region];
  const techFit = account.techStackMatch ? 1.0 : 0.0;

  const raw = 0.35 * industryFit + 0.25 * sizeFit + 0.15 * regionFit + 0.25 * techFit;
  return Math.round(raw * 100);
}
