import type { Account } from "@/lib/domain/account";
import type { Signal } from "@/lib/domain/signal";
import type { AccountResult, CommandCenterResult, FeedItem } from "@/lib/domain/result";
import { DEFAULT_WEIGHTS } from "@/lib/domain/score";
import { fitScore } from "@/lib/scoring/fit";
import { signalScore } from "@/lib/scoring/signal";
import { engagementScore } from "@/lib/scoring/engagement";
import { priorityScore } from "@/lib/scoring/priority";
import { deriveResearchBullets } from "@/lib/research/bullets";
import { explainRank } from "@/lib/research/explain";

const GLOBAL_FEED_SIZE = 20;
const TOP_PRIORITY_COUNT = 10;

/**
 * Pure orchestration: same accounts + signals + asOfDate + generatedAt ⇒
 * byte-identical result. `generatedAt` is a caller-supplied input, not
 * `Date.now()` read internally, so this function itself never touches real
 * time — the only clock read lives in app/ or the API route that calls it.
 */
export function runCommandCenter(
  accounts: readonly Account[],
  signals: readonly Signal[],
  asOfDate: string,
  generatedAt: string,
): CommandCenterResult {
  const signalsByAccount = new Map<string, Signal[]>();
  for (const account of accounts) signalsByAccount.set(account.id, []);
  for (const signal of signals) signalsByAccount.get(signal.accountId)?.push(signal);

  const computed = accounts.map((account) => {
    const accountSignals = [...(signalsByAccount.get(account.id) ?? [])].sort(
      (a, b) => a.daysAgo - b.daysAgo,
    );
    const scores = {
      fit: fitScore(account),
      signal: signalScore(accountSignals),
      engagement: engagementScore(account),
    };
    return { account, accountSignals, scores, priority: priorityScore(scores, DEFAULT_WEIGHTS) };
  });

  const sorted = [...computed].sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    return a.account.id.localeCompare(b.account.id);
  });

  const accountResults: AccountResult[] = sorted.map((entry, index) => {
    const rank = index + 1;
    return {
      account: entry.account,
      signals: entry.accountSignals,
      scores: entry.scores,
      priorityScore: entry.priority,
      rank,
      isTopPriority: rank <= TOP_PRIORITY_COUNT,
      research: deriveResearchBullets(entry.account, entry.accountSignals, entry.scores),
      explanation: explainRank(entry.scores, DEFAULT_WEIGHTS, rank, accounts.length),
    };
  });

  const accountsById = new Map(accounts.map((a) => [a.id, a]));
  const globalFeed: FeedItem[] = [...signals]
    .sort((a, b) => a.daysAgo - b.daysAgo)
    .slice(0, GLOBAL_FEED_SIZE)
    .map((signal) => ({
      accountId: signal.accountId,
      accountName: accountsById.get(signal.accountId)?.name ?? signal.accountId,
      signal,
    }));

  return {
    generatedAt,
    asOfDate,
    accountCount: accounts.length,
    accounts: accountResults,
    globalFeed,
  };
}
