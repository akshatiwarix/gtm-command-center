import { z } from "zod";
import { AccountSchema } from "@/lib/domain/account";
import { SignalSchema } from "@/lib/domain/signal";
import corpusJson from "./corpus.json";

const CorpusSchema = z.object({
  asOfDate: z.string(),
  accounts: z.array(AccountSchema),
  signals: z.array(SignalSchema),
});

const corpus = CorpusSchema.parse(corpusJson);

export const AS_OF_DATE = corpus.asOfDate;
export const ACCOUNTS = corpus.accounts;
export const SIGNALS = corpus.signals;

export const SIGNALS_BY_ACCOUNT: ReadonlyMap<string, typeof SIGNALS> = (() => {
  const map = new Map<string, typeof SIGNALS>();
  for (const account of ACCOUNTS) map.set(account.id, []);
  for (const signal of SIGNALS) {
    map.get(signal.accountId)?.push(signal);
  }
  for (const list of map.values()) list.sort((a, b) => a.daysAgo - b.daysAgo);
  return map;
})();
