import type { Account } from "@/lib/domain/account";
import type { Signal } from "@/lib/domain/signal";
import type { ResearchBullet } from "@/lib/domain/research";
import type { ScoreBreakdown } from "@/lib/domain/score";
import { tier } from "./tier";

const MAX_SIGNAL_BULLETS = 4;

function fitBullet(account: Account, fitScore: number): ResearchBullet {
  const t = tier(fitScore);
  const techNote = account.techStackMatch ? "tech stack match" : "no tech stack match";
  if (t === "strong") {
    return {
      text: `Strong ICP fit: ${account.sizeBucket} employees, ${account.industry}, ${account.region}, ${techNote}.`,
      sourceSignalId: null,
    };
  }
  if (t === "moderate") {
    return {
      text: `Moderate fit: ${account.sizeBucket} employees, ${account.industry}, ${account.region}, ${techNote}.`,
      sourceSignalId: null,
    };
  }
  return {
    text: `Partial fit: ${account.sizeBucket} employees, ${account.industry}, ${account.region}, ${techNote}.`,
    sourceSignalId: null,
  };
}

function signalBullet(signal: Signal): ResearchBullet {
  const days = signal.daysAgo === 0 ? "today" : `${signal.daysAgo} day${signal.daysAgo === 1 ? "" : "s"} ago`;
  return { text: `${signal.description} — ${days}.`, sourceSignalId: signal.id };
}

function engagementBullet(account: Account): ResearchBullet {
  const meetings = `${account.meetingsBooked} meeting${account.meetingsBooked === 1 ? "" : "s"} booked`;
  const opens = `${account.emailOpens} email open${account.emailOpens === 1 ? "" : "s"}`;
  const touch =
    account.lastTouchDaysAgo === 0
      ? "last touch today"
      : `last touch ${account.lastTouchDaysAgo} days ago`;
  return { text: `${meetings}, ${opens}, ${touch}.`, sourceSignalId: null };
}

/**
 * Deterministic and fully traceable: every bullet is built from either this
 * account's own signals (sourceSignalId set) or its firmographic/engagement
 * fields (sourceSignalId null) — never from data absent on the account.
 */
export function deriveResearchBullets(
  account: Account,
  signals: readonly Signal[],
  scores: ScoreBreakdown,
): ResearchBullet[] {
  const bullets: ResearchBullet[] = [fitBullet(account, scores.fit)];

  const recentSignals = [...signals].sort((a, b) => a.daysAgo - b.daysAgo).slice(0, MAX_SIGNAL_BULLETS);
  for (const signal of recentSignals) bullets.push(signalBullet(signal));

  bullets.push(engagementBullet(account));

  if (bullets.length < 3) {
    bullets.push({ text: "No significant recent signal activity.", sourceSignalId: null });
  }

  return bullets;
}
