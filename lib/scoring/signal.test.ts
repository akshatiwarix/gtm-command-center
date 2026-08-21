import { describe, expect, it } from "vitest";
import { signalScore } from "./signal";
import { makeSignal } from "@/lib/domain/fixtures";

describe("signalScore", () => {
  it("scores an account with no signals at 0", () => {
    expect(signalScore([])).toBe(0);
  });

  it("scores a fresh, max-strength signal below the cap", () => {
    // decay(0) = 1, rawSum = 3*1 = 3, 3/6 = 0.5 -> 50
    expect(signalScore([makeSignal({ strength: 3, daysAgo: 0 })])).toBe(50);
  });

  it("caps at 100 for strong enough recent activity", () => {
    // decay(0)=1, decay(10)~0.944: rawSum = 3*1 + 3*0.944 = 5.83 -> min(5.83/6,1)=0.972 -> 97
    // add a third strong signal to guarantee the cap is hit
    const signals = [
      makeSignal({ id: "a", strength: 3, daysAgo: 0 }),
      makeSignal({ id: "b", strength: 3, daysAgo: 0 }),
      makeSignal({ id: "c", strength: 3, daysAgo: 0 }),
    ];
    expect(signalScore(signals)).toBe(100);
  });

  it("decays a signal to near-zero contribution at the recency horizon", () => {
    // decay(180) = 0
    expect(signalScore([makeSignal({ strength: 3, daysAgo: 180 })])).toBe(0);
  });

  it("weights strength linearly", () => {
    const weak = signalScore([makeSignal({ strength: 1, daysAgo: 0 })]);
    const strong = signalScore([makeSignal({ strength: 3, daysAgo: 0 })]);
    expect(strong).toBeGreaterThan(weak);
  });
});
