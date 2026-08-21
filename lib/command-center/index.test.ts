import { describe, expect, it } from "vitest";
import { runCommandCenter } from "./index";
import { makeAccount, makeSignal } from "@/lib/domain/fixtures";

const ACCOUNTS = [
  makeAccount({ id: "acc-001", name: "Alpha", industry: "SaaS", sizeBucket: "51-200", techStackMatch: true }),
  makeAccount({ id: "acc-002", name: "Beta", industry: "Other", sizeBucket: "1-50", techStackMatch: false }),
  makeAccount({ id: "acc-003", name: "Gamma", industry: "SaaS", sizeBucket: "51-200", techStackMatch: true }),
];

const SIGNALS = [
  makeSignal({ id: "sig-1", accountId: "acc-001", daysAgo: 2, strength: 3 }),
  makeSignal({ id: "sig-2", accountId: "acc-002", daysAgo: 50, strength: 1 }),
  makeSignal({ id: "sig-3", accountId: "acc-003", daysAgo: 10, strength: 2 }),
];

describe("runCommandCenter", () => {
  it("sets accountCount to the number of accounts given", () => {
    const result = runCommandCenter(ACCOUNTS, SIGNALS, "2026-08-15", "2026-08-15T00:00:00.000Z");
    expect(result.accountCount).toBe(3);
    expect(result.accounts.length).toBe(3);
  });

  it("ranks accounts by default-weight priorityScore descending, ties broken by id", () => {
    const result = runCommandCenter(ACCOUNTS, SIGNALS, "2026-08-15", "2026-08-15T00:00:00.000Z");
    for (let i = 1; i < result.accounts.length; i++) {
      const prev = result.accounts[i - 1]!;
      const curr = result.accounts[i]!;
      expect(prev.priorityScore).toBeGreaterThanOrEqual(curr.priorityScore);
      expect(prev.rank).toBeLessThan(curr.rank);
    }
  });

  it("flags exactly the top 10 (or fewer, if the corpus is smaller) as top priority", () => {
    const result = runCommandCenter(ACCOUNTS, SIGNALS, "2026-08-15", "2026-08-15T00:00:00.000Z");
    const topCount = result.accounts.filter((a) => a.isTopPriority).length;
    expect(topCount).toBe(Math.min(10, ACCOUNTS.length));
    expect(result.accounts.filter((a) => a.isTopPriority).every((a) => a.rank <= 10)).toBe(true);
  });

  it("builds a global feed sorted by daysAgo ascending, matching a from-scratch scan", () => {
    const result = runCommandCenter(ACCOUNTS, SIGNALS, "2026-08-15", "2026-08-15T00:00:00.000Z");
    const expectedOrder = [...SIGNALS].sort((a, b) => a.daysAgo - b.daysAgo).map((s) => s.id);
    expect(result.globalFeed.map((f) => f.signal.id)).toEqual(expectedOrder);
  });

  it("is deterministic for the same inputs", () => {
    const a = runCommandCenter(ACCOUNTS, SIGNALS, "2026-08-15", "2026-08-15T00:00:00.000Z");
    const b = runCommandCenter(ACCOUNTS, SIGNALS, "2026-08-15", "2026-08-15T00:00:00.000Z");
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });
});
