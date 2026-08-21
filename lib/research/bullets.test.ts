import { describe, expect, it } from "vitest";
import { deriveResearchBullets } from "./bullets";
import { makeAccount, makeSignal } from "@/lib/domain/fixtures";

describe("deriveResearchBullets", () => {
  it("produces at least 3 bullets for a zero-signal account", () => {
    const account = makeAccount();
    const bullets = deriveResearchBullets(account, [], { fit: 50, signal: 0, engagement: 50 });
    expect(bullets.length).toBeGreaterThanOrEqual(3);
  });

  it("caps at 6 bullets even with many signals", () => {
    const account = makeAccount();
    const signals = Array.from({ length: 8 }, (_, i) =>
      makeSignal({ id: `sig-${i}`, daysAgo: i * 10 }),
    );
    const bullets = deriveResearchBullets(account, signals, { fit: 50, signal: 80, engagement: 50 });
    expect(bullets.length).toBeLessThanOrEqual(6);
  });

  it("every bullet's sourceSignalId is null or an id present in this account's own signals", () => {
    const account = makeAccount();
    const signals = [makeSignal({ id: "sig-a", daysAgo: 5 }), makeSignal({ id: "sig-b", daysAgo: 40 })];
    const bullets = deriveResearchBullets(account, signals, { fit: 60, signal: 50, engagement: 30 });
    const signalIds = new Set(signals.map((s) => s.id));
    for (const bullet of bullets) {
      expect(bullet.sourceSignalId === null || signalIds.has(bullet.sourceSignalId)).toBe(true);
    }
  });

  it("orders signal bullets most-recent-first regardless of input order", () => {
    const account = makeAccount();
    const signals = [
      makeSignal({ id: "old", daysAgo: 100, description: "Old signal" }),
      makeSignal({ id: "new", daysAgo: 5, description: "New signal" }),
    ];
    const bullets = deriveResearchBullets(account, signals, { fit: 50, signal: 30, engagement: 30 });
    const signalBulletTexts = bullets.filter((b) => b.sourceSignalId !== null).map((b) => b.text);
    expect(signalBulletTexts[0]).toContain("New signal");
    expect(signalBulletTexts[1]).toContain("Old signal");
  });

  it("is deterministic for the same inputs", () => {
    const account = makeAccount();
    const signals = [makeSignal()];
    const a = deriveResearchBullets(account, signals, { fit: 50, signal: 40, engagement: 30 });
    const b = deriveResearchBullets(account, signals, { fit: 50, signal: 40, engagement: 30 });
    expect(a).toEqual(b);
  });
});
