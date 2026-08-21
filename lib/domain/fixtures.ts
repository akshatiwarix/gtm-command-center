import type { Account } from "./account";
import type { Signal } from "./signal";

export function makeAccount(overrides: Partial<Account> = {}): Account {
  return {
    id: "acc-1",
    name: "Test Co",
    industry: "SaaS",
    sizeBucket: "51-200",
    region: "NA",
    techStackMatch: true,
    emailOpens: 0,
    meetingsBooked: 0,
    lastTouchDaysAgo: 90,
    ...overrides,
  };
}

export function makeSignal(overrides: Partial<Signal> = {}): Signal {
  return {
    id: "sig-1",
    accountId: "acc-1",
    type: "funding",
    strength: 2,
    daysAgo: 30,
    description: "Test signal",
    ...overrides,
  };
}
