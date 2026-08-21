export type Tier = "strong" | "moderate" | "weak";

export function tier(score: number): Tier {
  if (score >= 70) return "strong";
  if (score >= 40) return "moderate";
  return "weak";
}
