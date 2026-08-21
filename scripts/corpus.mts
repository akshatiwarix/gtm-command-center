import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { generateCorpus } from "../data/generate";

const corpus = generateCorpus();

const outPath = fileURLToPath(new URL("../data/corpus.json", import.meta.url));
writeFileSync(outPath, JSON.stringify(corpus, null, 2) + "\n");

const signalCounts = new Map<string, number>();
for (const s of corpus.signals) {
  signalCounts.set(s.accountId, (signalCounts.get(s.accountId) ?? 0) + 1);
}
const zeroSignalAccounts = corpus.accounts.filter((a) => !signalCounts.has(a.id)).length;

console.log(`accounts: ${corpus.accounts.length}`);
console.log(`signals: ${corpus.signals.length}`);
console.log(`accounts with zero signals: ${zeroSignalAccounts}`);
console.log(`asOfDate: ${corpus.asOfDate}`);
console.log(`wrote ${outPath}`);
