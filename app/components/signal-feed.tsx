import Link from "next/link";
import type { FeedItem } from "@/lib/domain/result";

export function SignalFeed({ items }: { items: FeedItem[] }) {
  return (
    <section aria-labelledby="feed-heading" className="rounded-lg border border-line bg-paper-raised p-4">
      <h2 id="feed-heading" className="font-mono text-xs uppercase tracking-wide text-ink-dim">
        Recent signals, all accounts
      </h2>
      <ul className="mt-3 max-h-80 space-y-2 overflow-y-auto pr-1">
        {items.map((item) => (
          <li key={item.signal.id} className="border-b border-line pb-2 text-sm last:border-0 last:pb-0">
            <Link
              href={`/accounts/${item.accountId}`}
              className="font-medium text-ink underline decoration-line-strong underline-offset-2 hover:decoration-ink"
            >
              {item.accountName}
            </Link>
            <p className="text-ink-dim">
              {item.signal.description}{" "}
              <span className="tabular font-mono text-xs">({item.signal.daysAgo}d ago)</span>
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
