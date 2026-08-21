import { ACCOUNTS, SIGNALS, AS_OF_DATE, SIGNALS_BY_ACCOUNT } from "../data/corpus";
import { generateCorpus } from "../data/generate";
import { fitScore } from "../lib/scoring/fit";
import { signalScore } from "../lib/scoring/signal";
import { engagementScore } from "../lib/scoring/engagement";
import { priorityScore } from "../lib/scoring/priority";
import { runCommandCenter } from "../lib/command-center";

let failures = 0;

function check(name: string, condition: boolean, detail: string): void {
  if (condition) {
    console.log(`  ok  ${name}`);
  } else {
    failures++;
    console.log(`FAIL  ${name} — ${detail}`);
  }
}

console.log("Sweep: nine invariants over the committed corpus + full command-center pipeline\n");

// 1. Corpus size.
check(
  "1. corpus size",
  ACCOUNTS.length === 200 && new Set(ACCOUNTS.map((a) => a.id)).size === 200,
  `expected 200 unique accounts, got ${ACCOUNTS.length} (${new Set(ACCOUNTS.map((a) => a.id)).size} unique)`,
);

// 2. Signal volume.
{
  const perAccountOk = ACCOUNTS.every((a) => {
    const count = SIGNALS_BY_ACCOUNT.get(a.id)?.length ?? 0;
    return count >= 0 && count <= 8;
  });
  const daysAgoOk = SIGNALS.every((s) => s.daysAgo >= 0 && s.daysAgo <= 180);
  const volumeOk = SIGNALS.length > 200 && SIGNALS.length < 1000;
  check(
    "2. signal volume + daysAgo range",
    perAccountOk && daysAgoOk && volumeOk,
    `signals=${SIGNALS.length} perAccountOk=${perAccountOk} daysAgoOk=${daysAgoOk}`,
  );
}

// 3. Sub-score bounds.
{
  const inBounds = (n: number) => Number.isInteger(n) && n >= 0 && n <= 100;
  const ok = ACCOUNTS.every((a) => {
    const signals = SIGNALS_BY_ACCOUNT.get(a.id) ?? [];
    return inBounds(fitScore(a)) && inBounds(signalScore(signals)) && inBounds(engagementScore(a));
  });
  check("3. sub-score bounds [0,100]", ok, "a sub-score fell outside [0,100] or was non-integer");
}

// 4. Priority bounds under any weights.
{
  const weightSets = [
    { fit: 1, signal: 0, engagement: 0 },
    { fit: 0, signal: 1, engagement: 0 },
    { fit: 0, signal: 0, engagement: 1 },
    { fit: 0, signal: 0, engagement: 0 },
    { fit: 1, signal: 1, engagement: 1 },
  ];
  let ok = true;
  for (const account of ACCOUNTS) {
    const signals = SIGNALS_BY_ACCOUNT.get(account.id) ?? [];
    const breakdown = { fit: fitScore(account), signal: signalScore(signals), engagement: engagementScore(account) };
    for (const weights of weightSets) {
      const p = priorityScore(breakdown, weights);
      if (p < 0 || p > 100) ok = false;
    }
  }
  check("4. priority bounds under any weights", ok, "a priorityScore fell outside [0,100] for some weight triple");
}

// 5. Weights don't touch sub-scores.
{
  const weightSets = [
    { fit: 0.4, signal: 0.35, engagement: 0.25 },
    { fit: 1, signal: 0, engagement: 0 },
    { fit: 0, signal: 0, engagement: 1 },
  ];
  let ok = true;
  for (const account of ACCOUNTS.slice(0, 20)) {
    const signals = SIGNALS_BY_ACCOUNT.get(account.id) ?? [];
    const breakdown = { fit: fitScore(account), signal: signalScore(signals), engagement: engagementScore(account) };
    const snapshot = { ...breakdown };
    for (const weights of weightSets) priorityScore(breakdown, weights);
    if (breakdown.fit !== snapshot.fit || breakdown.signal !== snapshot.signal || breakdown.engagement !== snapshot.engagement) {
      ok = false;
    }
  }
  check("5. weights never mutate sub-scores", ok, "priorityScore mutated its breakdown argument");
}

// 6. Fit realism.
{
  const topIndustries = new Set(["SaaS", "Fintech", "Healthcare"]);
  const top = ACCOUNTS.filter((a) => topIndustries.has(a.industry));
  const bottom = ACCOUNTS.filter((a) => !topIndustries.has(a.industry));
  const avg = (accts: typeof ACCOUNTS) => accts.reduce((sum, a) => sum + fitScore(a), 0) / accts.length;
  const topAvg = avg(top);
  const bottomAvg = avg(bottom);
  check(
    "6. fit realism (top-fit industries score higher)",
    top.length > 0 && bottom.length > 0 && topAvg > bottomAvg,
    `topAvg=${topAvg.toFixed(2)} (n=${top.length}) bottomAvg=${bottomAvg.toFixed(2)} (n=${bottom.length})`,
  );
}

const generatedAt = "2026-08-15T00:00:00.000Z"; // fixed, for determinism checks below
const result = runCommandCenter(ACCOUNTS, SIGNALS, AS_OF_DATE, generatedAt);

// 7. Default-weight rank consistency.
{
  const rankMatchesPosition = result.accounts.every((a, i) => a.rank === i + 1);
  const sortedByPriority = result.accounts.every((a, i) => {
    if (i === 0) return true;
    const prev = result.accounts[i - 1]!;
    if (prev.priorityScore !== a.priorityScore) return prev.priorityScore > a.priorityScore;
    return prev.account.id < a.account.id;
  });
  const topCount = result.accounts.filter((a) => a.isTopPriority).length;
  const topAreFirst = result.accounts.every((a) => a.isTopPriority === a.rank <= 10);
  check(
    "7. default-weight rank consistency + top-10 badging",
    rankMatchesPosition && sortedByPriority && topCount === Math.min(10, result.accounts.length) && topAreFirst,
    `rankMatchesPosition=${rankMatchesPosition} sortedByPriority=${sortedByPriority} topCount=${topCount}`,
  );
}

// 8. Global feed correctness.
{
  const expected = [...SIGNALS].sort((a, b) => a.daysAgo - b.daysAgo).slice(0, 20).map((s) => s.id);
  const actual = result.globalFeed.map((f) => f.signal.id);
  check(
    "8. global feed = top 20 most-recent signals corpus-wide",
    JSON.stringify(expected) === JSON.stringify(actual),
    `expected=[${expected.join(",")}] actual=[${actual.join(",")}]`,
  );
}

// 9. Determinism.
{
  const corpusA = JSON.stringify(generateCorpus());
  const corpusB = JSON.stringify(generateCorpus());
  const pipelineA = JSON.stringify(runCommandCenter(ACCOUNTS, SIGNALS, AS_OF_DATE, generatedAt));
  const pipelineB = JSON.stringify(runCommandCenter(ACCOUNTS, SIGNALS, AS_OF_DATE, generatedAt));
  check(
    "9. determinism (corpus generation + full pipeline, byte-identical across two runs)",
    corpusA === corpusB && pipelineA === pipelineB,
    "two runs over the same seed/inputs differed",
  );
}

console.log(`\n${failures === 0 ? "All nine invariants passed." : `${failures} invariant(s) FAILED.`}`);
if (failures > 0) process.exit(1);

console.log("\nHeadline (top 5 by default-weight Priority Score):");
for (const a of result.accounts.slice(0, 5)) {
  console.log(
    `  #${a.rank}  ${a.account.name.padEnd(24)} priority=${a.priorityScore}  fit=${a.scores.fit} signal=${a.scores.signal} engagement=${a.scores.engagement}`,
  );
}
