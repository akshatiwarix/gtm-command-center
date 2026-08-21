import { Rng, derive } from "@/lib/rng";
import { INDUSTRIES, SIZE_BUCKETS, REGIONS, type Account } from "@/lib/domain/account";
import { SIGNAL_TYPES, type Signal, type SignalType } from "@/lib/domain/signal";

export const SEED = 20;
export const ACCOUNT_COUNT = 200;
/** Fixed narrative reference date — every `daysAgo` in the corpus is relative to this, never the real current date. */
export const AS_OF_DATE = "2026-08-15";

const NAME_PREFIXES = [
  "Nova", "Atlas", "Vertex", "Quantum", "Beacon", "Cobalt", "Summit", "Orbit",
  "Pioneer", "Lumen", "Anchor", "Catalyst", "Horizon", "Meridian", "Ember",
  "Granite", "Cascade", "Foundry", "Pinnacle", "Vector", "Northwind",
  "Ironclad", "Bright", "Clearwater", "Silverline", "Redwood", "Bluewave",
  "Crestline", "Ridgeline", "Stonebridge",
] as const;

const NAME_SUFFIXES = [
  "Labs", "Systems", "Works", "Group", "Technologies", "Analytics",
  "Software", "Solutions", "Networks", "Dynamics", "Robotics", "Health",
  "Financial", "Logistics", "Cloud", "Data", "AI", "Digital", "Industries",
  "Partners",
] as const;

/** Counts 0..8, skewed toward 1-3 (most accounts have a little recent activity, few have none, fewer have a lot). */
const SIGNAL_COUNT_WEIGHTS = [10, 20, 25, 20, 12, 7, 3, 2, 1];

const STRENGTH_WEIGHTS = [40, 35, 25]; // 1, 2, 3

const FUNDING_ROUNDS = [
  "$4M Seed", "$8M Seed", "$15M Series A", "$22M Series A", "$42M Series B",
  "$68M Series B", "$95M Series C", "$120M Series C",
] as const;

const HIRING_DEPTS = ["Engineering", "Sales", "Product", "Customer Success", "Marketing"] as const;

const LEADERSHIP_ROLES = [
  "VP of Sales", "VP of Engineering", "Chief Revenue Officer", "Chief Technology Officer",
  "Head of Marketing", "VP of Customer Success", "Chief Product Officer",
] as const;

const TECH_MIGRATIONS = [
  "Kubernetes", "Snowflake", "Salesforce", "HubSpot", "Segment", "Datadog", "Stripe Billing",
] as const;

const WEBSITE_CHANGES = [
  "relaunched their pricing page",
  "published a new enterprise product line page",
  "rebranded their homepage",
  "shipped a new developer documentation site",
  "added a public product changelog",
] as const;

function generateCompanyName(rng: Rng, used: Set<string>): string {
  for (let attempt = 0; attempt < 50; attempt++) {
    const name = `${rng.pick(NAME_PREFIXES)} ${rng.pick(NAME_SUFFIXES)}`;
    if (!used.has(name)) {
      used.add(name);
      return name;
    }
  }
  // Combinatorial space (600) comfortably exceeds ACCOUNT_COUNT (200); this is an
  // unreachable-in-practice fallback, not a real collision-handling path.
  const fallback = `${rng.pick(NAME_PREFIXES)} ${rng.pick(NAME_SUFFIXES)} ${used.size}`;
  used.add(fallback);
  return fallback;
}

function generateDescription(rng: Rng, type: SignalType, accountName: string): string {
  switch (type) {
    case "funding":
      return `Raised ${rng.pick(FUNDING_ROUNDS)}`;
    case "hiring-surge": {
      const count = rng.intBetween(6, 25);
      return `Posted ${count} new ${rng.pick(HIRING_DEPTS)} job postings in the last 30 days`;
    }
    case "leadership-change":
      return `Hired a new ${rng.pick(LEADERSHIP_ROLES)}`;
    case "tech-change":
      return `Migrated to ${rng.pick(TECH_MIGRATIONS)}`;
    case "website-change":
      return `${accountName} ${rng.pick(WEBSITE_CHANGES)}`;
  }
}

export function generateCorpus(): { asOfDate: string; accounts: Account[]; signals: Signal[] } {
  const nameRng = new Rng(derive(SEED, "company-name"));
  const firmographicRng = new Rng(derive(SEED, "firmographics"));
  const engagementRng = new Rng(derive(SEED, "engagement"));
  const signalCountRng = new Rng(derive(SEED, "signal-count"));
  const signalFieldsRng = new Rng(derive(SEED, "signal-fields"));

  const usedNames = new Set<string>();
  const accounts: Account[] = [];
  const signals: Signal[] = [];
  let signalCounter = 0;

  for (let i = 0; i < ACCOUNT_COUNT; i++) {
    const id = `acc-${String(i + 1).padStart(3, "0")}`;
    const account: Account = {
      id,
      name: generateCompanyName(nameRng, usedNames),
      industry: firmographicRng.pick(INDUSTRIES),
      sizeBucket: firmographicRng.pick(SIZE_BUCKETS),
      region: firmographicRng.pick(REGIONS),
      techStackMatch: firmographicRng.bool(0.45),
      emailOpens: engagementRng.intBetween(0, 40),
      meetingsBooked: engagementRng.intBetween(0, 6),
      lastTouchDaysAgo: engagementRng.intBetween(0, 180),
    };
    accounts.push(account);

    const signalCount = signalCountRng.weightedIndex(SIGNAL_COUNT_WEIGHTS);
    for (let s = 0; s < signalCount; s++) {
      signalCounter++;
      const type = signalFieldsRng.pick(SIGNAL_TYPES);
      signals.push({
        id: `sig-${String(signalCounter).padStart(4, "0")}`,
        accountId: id,
        type,
        strength: (signalFieldsRng.weightedIndex(STRENGTH_WEIGHTS) + 1) as 1 | 2 | 3,
        daysAgo: signalFieldsRng.intBetween(0, 180),
        description: generateDescription(signalFieldsRng, type, account.name),
      });
    }
  }

  return { asOfDate: AS_OF_DATE, accounts, signals };
}
