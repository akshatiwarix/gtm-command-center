import { describe, expect, it } from "vitest";
import { AccountSchema } from "./account";
import { SignalSchema } from "./signal";
import { ScoreBreakdownSchema, WeightsSchema, DEFAULT_WEIGHTS } from "./score";
import { ResearchBulletSchema, RankExplanationSchema } from "./research";
import { AccountResultSchema, CommandCenterResultSchema } from "./result";
import { makeAccount, makeSignal } from "./fixtures";

describe("domain schemas", () => {
  it("accepts a well-formed Account", () => {
    expect(() => AccountSchema.parse(makeAccount())).not.toThrow();
  });

  it("rejects an Account with an out-of-range lastTouchDaysAgo", () => {
    expect(() => AccountSchema.parse(makeAccount({ lastTouchDaysAgo: 200 }))).toThrow();
  });

  it("accepts a well-formed Signal", () => {
    expect(() => SignalSchema.parse(makeSignal())).not.toThrow();
  });

  it("rejects a Signal with an invalid strength", () => {
    expect(() => SignalSchema.parse({ ...makeSignal(), strength: 4 })).toThrow();
  });

  it("accepts a well-formed ScoreBreakdown", () => {
    expect(() => ScoreBreakdownSchema.parse({ fit: 80, signal: 40, engagement: 10 })).not.toThrow();
  });

  it("rejects a ScoreBreakdown component over 100", () => {
    expect(() => ScoreBreakdownSchema.parse({ fit: 101, signal: 40, engagement: 10 })).toThrow();
  });

  it("DEFAULT_WEIGHTS parses and sums to 1", () => {
    WeightsSchema.parse(DEFAULT_WEIGHTS);
    expect(DEFAULT_WEIGHTS.fit + DEFAULT_WEIGHTS.signal + DEFAULT_WEIGHTS.engagement).toBeCloseTo(1);
  });

  it("accepts a well-formed ResearchBullet and RankExplanation", () => {
    expect(() => ResearchBulletSchema.parse({ text: "hi", sourceSignalId: null })).not.toThrow();
    expect(() =>
      RankExplanationSchema.parse({ dominantDriver: "fit", text: "explained" }),
    ).not.toThrow();
  });

  it("accepts a well-formed AccountResult and CommandCenterResult", () => {
    const account = makeAccount();
    const signal = makeSignal();
    const accountResult = {
      account,
      signals: [signal],
      scores: { fit: 80, signal: 40, engagement: 10 },
      priorityScore: 55,
      rank: 1,
      isTopPriority: true,
      research: [{ text: "hi", sourceSignalId: signal.id }],
      explanation: { dominantDriver: "fit" as const, text: "explained" },
    };
    expect(() => AccountResultSchema.parse(accountResult)).not.toThrow();
    expect(() =>
      CommandCenterResultSchema.parse({
        generatedAt: new Date().toISOString(),
        asOfDate: "2026-01-01",
        accountCount: 1,
        accounts: [accountResult],
        globalFeed: [{ accountId: account.id, accountName: account.name, signal }],
      }),
    ).not.toThrow();
  });
});
