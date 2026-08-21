import type { Account } from "@/lib/domain/account";

/** Synthetic outreach-recency proxy, 0-100. */
export function engagementScore(account: Account): number {
  const emailEng = Math.min(account.emailOpens / 30, 1);
  const meetingEng = Math.min(account.meetingsBooked / 4, 1);
  const freshness = Math.max(0, 1 - account.lastTouchDaysAgo / 90);

  const raw = 0.4 * emailEng + 0.4 * meetingEng + 0.2 * freshness;
  return Math.round(raw * 100);
}
