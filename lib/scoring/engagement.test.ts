import { describe, expect, it } from "vitest";
import { engagementScore } from "./engagement";
import { makeAccount } from "@/lib/domain/fixtures";

describe("engagementScore", () => {
  it("scores a fully cold account at 0", () => {
    const account = makeAccount({ emailOpens: 0, meetingsBooked: 0, lastTouchDaysAgo: 180 });
    // freshness = max(0, 1 - 180/90) = 0
    expect(engagementScore(account)).toBe(0);
  });

  it("scores a fully warm account at 100", () => {
    // emailEng=min(30/30,1)=1, meetingEng=min(4/4,1)=1, freshness=max(0,1-0/90)=1
    // raw = 0.4+0.4+0.2 = 1.0
    const account = makeAccount({ emailOpens: 30, meetingsBooked: 4, lastTouchDaysAgo: 0 });
    expect(engagementScore(account)).toBe(100);
  });

  it("caps email opens and meetings booked beyond their thresholds", () => {
    const capped = makeAccount({ emailOpens: 30, meetingsBooked: 4, lastTouchDaysAgo: 0 });
    const overCapped = makeAccount({ emailOpens: 500, meetingsBooked: 50, lastTouchDaysAgo: 0 });
    expect(engagementScore(capped)).toBe(engagementScore(overCapped));
  });

  it("never changes with the account's firmographic fields", () => {
    const a = makeAccount({ industry: "SaaS", emailOpens: 10, meetingsBooked: 2, lastTouchDaysAgo: 20 });
    const b = makeAccount({ industry: "Retail", emailOpens: 10, meetingsBooked: 2, lastTouchDaysAgo: 20 });
    expect(engagementScore(a)).toBe(engagementScore(b));
  });
});
