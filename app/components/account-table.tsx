"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { AccountResult } from "@/lib/domain/result";
import type { Weights } from "@/lib/domain/score";
import { INDUSTRIES, SIZE_BUCKETS, REGIONS, type Industry, type CompanySizeBucket, type Region } from "@/lib/domain/account";
import { priorityScore } from "@/lib/scoring/priority";
import { ScoreBar } from "./score-bar";
import { SCORE_COLOR } from "./scorer-style";

type SortColumn = "priority" | "fit" | "signal" | "engagement";

const SORT_LABEL: Record<SortColumn, string> = {
  priority: "Priority",
  fit: "Fit",
  signal: "Signal",
  engagement: "Engagement",
};

const ALL = "All" as const;

export function AccountTable({ accounts, weights }: { accounts: AccountResult[]; weights: Weights }) {
  const [sortColumn, setSortColumn] = useState<SortColumn>("priority");
  const [industryFilter, setIndustryFilter] = useState<Industry | typeof ALL>(ALL);
  const [sizeFilter, setSizeFilter] = useState<CompanySizeBucket | typeof ALL>(ALL);
  const [regionFilter, setRegionFilter] = useState<Region | typeof ALL>(ALL);

  const withLivePriority = useMemo(
    () =>
      accounts.map((a) => ({
        ...a,
        livePriority: priorityScore(a.scores, weights),
      })),
    [accounts, weights],
  );

  const topPriorityIds = useMemo(() => {
    const sorted = [...withLivePriority].sort((a, b) => {
      if (b.livePriority !== a.livePriority) return b.livePriority - a.livePriority;
      return a.account.id.localeCompare(b.account.id);
    });
    return new Set(sorted.slice(0, 10).map((a) => a.account.id));
  }, [withLivePriority]);

  const filtered = useMemo(
    () =>
      withLivePriority.filter(
        (a) =>
          (industryFilter === ALL || a.account.industry === industryFilter) &&
          (sizeFilter === ALL || a.account.sizeBucket === sizeFilter) &&
          (regionFilter === ALL || a.account.region === regionFilter),
      ),
    [withLivePriority, industryFilter, sizeFilter, regionFilter],
  );

  const sorted = useMemo(() => {
    const value = (a: (typeof filtered)[number]) => (sortColumn === "priority" ? a.livePriority : a.scores[sortColumn]);
    return [...filtered].sort((a, b) => {
      const diff = value(b) - value(a);
      if (diff !== 0) return diff;
      return a.account.id.localeCompare(b.account.id);
    });
  }, [filtered, sortColumn]);

  return (
    <section aria-labelledby="table-heading" className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 id="table-heading" className="font-display text-2xl italic text-ink">
          Accounts
        </h2>
        <div className="flex flex-wrap gap-2 text-sm">
          <select
            aria-label="Filter by industry"
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value as Industry | typeof ALL)}
            className="rounded-md border border-line bg-paper-raised px-2 py-1"
          >
            <option value={ALL}>All industries</option>
            {INDUSTRIES.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
          <select
            aria-label="Filter by size"
            value={sizeFilter}
            onChange={(e) => setSizeFilter(e.target.value as CompanySizeBucket | typeof ALL)}
            className="rounded-md border border-line bg-paper-raised px-2 py-1"
          >
            <option value={ALL}>All sizes</option>
            {SIZE_BUCKETS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            aria-label="Filter by region"
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value as Region | typeof ALL)}
            className="rounded-md border border-line bg-paper-raised px-2 py-1"
          >
            <option value={ALL}>All regions</option>
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="text-sm text-ink-dim">
        Showing {sorted.length} of {accounts.length} accounts, sorted by{" "}
        <span className="font-medium text-ink">{SORT_LABEL[sortColumn]}</span>. Top 10 by live Priority
        Score are badged, independent of which column is sorted.
      </p>

      <div className="overflow-x-auto rounded-lg border border-line">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-line bg-paper-raised text-left text-xs uppercase tracking-wide text-ink-dim">
              <th className="px-3 py-2">Account</th>
              {(["fit", "signal", "engagement", "priority"] as const).map((col) => (
                <th key={col} className="px-3 py-2">
                  <button
                    type="button"
                    onClick={() => setSortColumn(col)}
                    className="flex items-center gap-1"
                    style={{ color: col === "priority" ? "var(--priority)" : SCORE_COLOR[col] }}
                  >
                    {SORT_LABEL[col]}
                    {sortColumn === col ? " ↓" : ""}
                  </button>
                </th>
              ))}
              <th className="px-3 py-2">Top signal</th>
              <th className="px-3 py-2">Research</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((a) => {
              const isTop = topPriorityIds.has(a.account.id);
              const topSignal = a.signals[0];
              const snippet = a.research[0]?.text ?? "";
              return (
                <tr key={a.account.id} className="border-b border-line last:border-0 hover:bg-paper-raised">
                  <td className="px-3 py-2">
                    <Link href={`/accounts/${a.account.id}`} className="font-medium text-ink underline decoration-line-strong underline-offset-2 hover:decoration-ink">
                      {a.account.name}
                    </Link>
                    <div className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-dim">
                      {isTop && (
                        <span
                          className="rounded-full px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wide"
                          style={{ background: "var(--priority-dim)", color: "var(--priority)" }}
                        >
                          Top Priority
                        </span>
                      )}
                      <span>
                        {a.account.industry} · {a.account.sizeBucket} · {a.account.region}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <ScoreBar value={a.scores.fit} color={SCORE_COLOR.fit} />
                  </td>
                  <td className="px-3 py-2">
                    <ScoreBar value={a.scores.signal} color={SCORE_COLOR.signal} />
                  </td>
                  <td className="px-3 py-2">
                    <ScoreBar value={a.scores.engagement} color={SCORE_COLOR.engagement} />
                  </td>
                  <td className="px-3 py-2">
                    <span className="tabular font-mono text-base font-semibold" style={{ color: "var(--priority)" }}>
                      {a.livePriority}
                    </span>
                  </td>
                  <td className="max-w-[220px] px-3 py-2 text-xs text-ink-dim">
                    {topSignal ? `${topSignal.description} (${topSignal.daysAgo}d ago)` : "No recent signals"}
                  </td>
                  <td className="max-w-[260px] px-3 py-2 text-xs text-ink-dim">{snippet}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
