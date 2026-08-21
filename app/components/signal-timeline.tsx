import type { Signal } from "@/lib/domain/signal";

export function SignalTimeline({ signals }: { signals: readonly Signal[] }) {
  if (signals.length === 0) {
    return <p className="text-sm text-ink-dim">No signals in the last 180 days.</p>;
  }

  return (
    <ol className="space-y-3 border-l border-line pl-4">
      {signals.map((signal) => (
        <li key={signal.id} className="relative">
          <span
            className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full"
            style={{ background: "var(--signal)" }}
            aria-hidden
          />
          <p className="text-sm text-ink">{signal.description}</p>
          <p className="font-mono text-xs text-ink-dim">
            {signal.type} · {signal.daysAgo}d ago · strength {signal.strength}
          </p>
        </li>
      ))}
    </ol>
  );
}
