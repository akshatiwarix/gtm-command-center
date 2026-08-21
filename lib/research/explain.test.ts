import { describe, expect, it } from "vitest";
import { explainRank } from "./explain";

describe("explainRank", () => {
  const defaultWeights = { fit: 0.4, signal: 0.35, engagement: 0.25 };

  it("names fit as the dominant driver when it contributes the most", () => {
    const result = explainRank({ fit: 100, signal: 0, engagement: 0 }, defaultWeights, 1, 200);
    expect(result.dominantDriver).toBe("fit");
    expect(result.text).toContain("account fit");
  });

  it("names signal as the dominant driver when weighted toward signal", () => {
    const result = explainRank({ fit: 20, signal: 100, engagement: 20 }, { fit: 0, signal: 1, engagement: 0 }, 1, 200);
    expect(result.dominantDriver).toBe("signal");
  });

  it("breaks ties in the fixed order fit > signal > engagement", () => {
    const result = explainRank({ fit: 50, signal: 50, engagement: 50 }, { fit: 1, signal: 1, engagement: 1 }, 1, 200);
    expect(result.dominantDriver).toBe("fit");
  });

  it("includes the rank and account count in the text", () => {
    const result = explainRank({ fit: 80, signal: 40, engagement: 20 }, defaultWeights, 4, 200);
    expect(result.text).toContain("Ranked #4 of 200");
  });

  it("is deterministic for the same inputs", () => {
    const a = explainRank({ fit: 60, signal: 45, engagement: 30 }, defaultWeights, 12, 200);
    const b = explainRank({ fit: 60, signal: 45, engagement: 30 }, defaultWeights, 12, 200);
    expect(a).toEqual(b);
  });
});
