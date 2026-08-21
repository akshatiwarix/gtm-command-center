import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <p className="font-mono text-xs uppercase tracking-wide text-ink-dim">404</p>
      <h1 className="mt-2 font-display text-3xl italic text-ink">No account found.</h1>
      <p className="mt-3 text-ink-dim">That account id isn&rsquo;t in the corpus.</p>
      <Link
        href="/"
        className="mt-6 inline-block text-sm underline decoration-line-strong underline-offset-4 hover:decoration-ink"
      >
        ← Back to Command Center
      </Link>
    </main>
  );
}
