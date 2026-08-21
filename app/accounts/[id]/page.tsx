import { notFound } from "next/navigation";
import Link from "next/link";
import { ACCOUNTS, SIGNALS, AS_OF_DATE } from "@/data/corpus";
import { runCommandCenter } from "@/lib/command-center";
import { ScoreBreakdownChart } from "@/app/components/score-breakdown-chart";
import { SignalTimeline } from "@/app/components/signal-timeline";

export default async function AccountDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = runCommandCenter(ACCOUNTS, SIGNALS, AS_OF_DATE, new Date().toISOString());
  const accountResult = result.accounts.find((a) => a.account.id === id);

  if (!accountResult) notFound();

  const { account, signals, scores, priorityScore, rank, isTopPriority, research, explanation } = accountResult;

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/" className="text-sm underline decoration-line-strong underline-offset-4 hover:decoration-ink">
        ← Back to Command Center
      </Link>

      <header className="mt-4">
        <div className="flex flex-wrap items-center gap-2">
          {isTopPriority && (
            <span
              className="rounded-full px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wide"
              style={{ background: "var(--priority-dim)", color: "var(--priority)" }}
            >
              Top Priority
            </span>
          )}
          <span className="font-mono text-xs uppercase tracking-wide text-ink-dim">
            Rank #{rank} of {result.accountCount}
          </span>
        </div>
        <h1 className="mt-1 font-display text-3xl italic text-ink sm:text-4xl">{account.name}</h1>
        <p className="mt-1 text-ink-dim">
          {account.industry} · {account.sizeBucket} employees · {account.region}
          {account.techStackMatch ? " · tech stack match" : ""}
        </p>
      </header>

      <section className="mt-8 grid gap-8 sm:grid-cols-2">
        <div>
          <h2 className="font-mono text-xs uppercase tracking-wide text-ink-dim">Score breakdown</h2>
          <div className="mt-3">
            <ScoreBreakdownChart scores={scores} priorityScore={priorityScore} />
          </div>
        </div>
        <div>
          <h2 className="font-mono text-xs uppercase tracking-wide text-ink-dim">Why this rank</h2>
          <p className="mt-3 text-sm text-ink">{explanation.text}</p>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl italic text-ink">Signal timeline</h2>
        <div className="mt-3">
          <SignalTimeline signals={signals} />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl italic text-ink">Research</h2>
        <ul className="mt-3 space-y-2">
          {research.map((bullet, i) => (
            <li key={i} className="flex gap-2 text-sm text-ink">
              <span className="text-ink-dim">·</span>
              <span>{bullet.text}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
