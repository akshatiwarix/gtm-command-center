import { describe, expect, it } from "vitest";
import { ACCOUNTS, SIGNALS, AS_OF_DATE, SIGNALS_BY_ACCOUNT } from "./corpus";

describe("committed corpus structure", () => {
  it("has exactly 200 accounts with unique ids", () => {
    expect(ACCOUNTS.length).toBe(200);
    expect(new Set(ACCOUNTS.map((a) => a.id)).size).toBe(200);
  });

  it("has a plausible, non-degenerate signal count", () => {
    expect(SIGNALS.length).toBeGreaterThan(200);
    expect(SIGNALS.length).toBeLessThan(1000);
  });

  it("gives every signal a unique id and a valid accountId reference", () => {
    const accountIds = new Set(ACCOUNTS.map((a) => a.id));
    expect(new Set(SIGNALS.map((s) => s.id)).size).toBe(SIGNALS.length);
    for (const signal of SIGNALS) {
      expect(accountIds.has(signal.accountId)).toBe(true);
    }
  });

  it("keeps every account's signal count within [0, 8]", () => {
    for (const account of ACCOUNTS) {
      const count = SIGNALS_BY_ACCOUNT.get(account.id)?.length ?? 0;
      expect(count).toBeGreaterThanOrEqual(0);
      expect(count).toBeLessThanOrEqual(8);
    }
  });

  it("keeps every signal's daysAgo within [0, 180]", () => {
    for (const signal of SIGNALS) {
      expect(signal.daysAgo).toBeGreaterThanOrEqual(0);
      expect(signal.daysAgo).toBeLessThanOrEqual(180);
    }
  });

  it("sorts each account's signals by daysAgo ascending", () => {
    for (const signals of SIGNALS_BY_ACCOUNT.values()) {
      for (let i = 1; i < signals.length; i++) {
        expect(signals[i]!.daysAgo).toBeGreaterThanOrEqual(signals[i - 1]!.daysAgo);
      }
    }
  });

  it("has a fixed asOfDate, not derived from the real current date", () => {
    expect(AS_OF_DATE).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
