import { describe, expect, it } from "vitest";
import { fitScore } from "./fit";
import { makeAccount } from "@/lib/domain/fixtures";

describe("fitScore", () => {
  it("scores a full-match account at 100", () => {
    // industryFit=1.0 (SaaS), sizeFit=1.0 (51-200), regionFit=1.0 (NA), techFit=1.0
    // raw = 0.35 + 0.25 + 0.15 + 0.25 = 1.0
    const account = makeAccount({
      industry: "SaaS",
      sizeBucket: "51-200",
      region: "NA",
      techStackMatch: true,
    });
    expect(fitScore(account)).toBe(100);
  });

  it("scores a worst-case account near 0", () => {
    // industryFit=0.2 (Other), sizeFit=0.3 (1-50), regionFit=0.5 (LATAM), techFit=0
    // raw = 0.35*0.2 + 0.25*0.3 + 0.15*0.5 + 0.25*0 = 0.07 + 0.075 + 0.075 + 0 = 0.22
    const account = makeAccount({
      industry: "Other",
      sizeBucket: "1-50",
      region: "LATAM",
      techStackMatch: false,
    });
    expect(fitScore(account)).toBe(22);
  });

  it("never changes with the account's signals or engagement fields", () => {
    const a = makeAccount({ emailOpens: 0, meetingsBooked: 0 });
    const b = makeAccount({ emailOpens: 40, meetingsBooked: 6 });
    expect(fitScore(a)).toBe(fitScore(b));
  });
});
