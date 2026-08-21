import { ACCOUNTS, SIGNALS, AS_OF_DATE } from "@/data/corpus";
import { runCommandCenter } from "@/lib/command-center";
import { CommandCenterHome } from "@/app/components/command-center-home";

export default function Home() {
  const result = runCommandCenter(ACCOUNTS, SIGNALS, AS_OF_DATE, new Date().toISOString());

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-10 max-w-3xl">
        <p className="font-mono text-xs uppercase tracking-wide text-ink-dim">
          Day 020 of 100 · GTM Command Center
        </p>
        <h1 className="mt-2 font-display text-4xl italic text-ink sm:text-5xl">
          One screen. Every account, ranked, and why.
        </h1>
        <p className="mt-4 text-ink-dim">
          {result.accountCount} synthetic target accounts, each with a Fit / Signal / Engagement
          breakdown, a composite Priority Score, evidence-backed research, and a plain-English
          rank explanation. Drag the weights below and watch the ranking move live.
        </p>
        <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <a
            className="underline decoration-line-strong underline-offset-4 hover:decoration-ink"
            href="https://github.com/akshatiwarix/gtm-command-center"
          >
            Source
          </a>
          <a
            className="underline decoration-line-strong underline-offset-4 hover:decoration-ink"
            href="/api/v1/accounts"
          >
            GET /api/v1/accounts
          </a>
          <a
            className="underline decoration-line-strong underline-offset-4 hover:decoration-ink"
            href="/api/schema"
          >
            GET /api/schema
          </a>
          <a
            className="underline decoration-line-strong underline-offset-4 hover:decoration-ink"
            href="https://github.com/akshatiwarix/gtm-command-center/blob/main/PLAN.md"
          >
            Plan
          </a>
        </p>
      </header>

      <CommandCenterHome result={result} />

      <footer className="mt-16 border-t border-line pt-6 text-xs text-ink-dim">
        Synthetic, seeded corpus — no real accounts, no live API calls, no model calls. Every
        score and research bullet is a documented deterministic formula (see PLAN.md).
      </footer>
    </main>
  );
}
