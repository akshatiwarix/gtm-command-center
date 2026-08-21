# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Day 020 of a 100-day portfolio series. A unified GTM dashboard over a synthetic
corpus of 200 target accounts — showing fit, recent buying signals, a visible
three-factor score breakdown, evidence-backed research, and a live-reweightable
priority ranking on one screen. **`PLAN.md` is the contract for this repo** — it
was settled with the user before any code was written and is not a draft to
improve on. If code and `PLAN.md` disagree, the code is wrong; if `PLAN.md` needs
to change, it changes there first, in writing, with a reason. Read `PLAN.md` in
full before implementing anything — it contains the data model, the exact corpus
generative model, all scoring formulas, the research/explanation logic, and the
numbered implementation task order this repo is built in.

## Commands

- `npm run dev` — start the dev server.
- `npm run build` — production build.
- `npm run typecheck` — `next typegen && tsc --noEmit`.
- `npm run lint` — ESLint (flat config, `eslint-config-next`).
- `npm test` / `npm run test:watch` — vitest over `lib/**/*.test.ts` and
  `data/**/*.test.ts`.
- `npm run sweep` — `vite-node` script (`scripts/sweep.mts`) asserting the nine
  cross-account invariants listed in `PLAN.md` (§ Validation / test plan). No
  network.
- `npm run corpus` — regenerates the committed synthetic corpus from
  `data/generate.ts` (fixed seed; only needed if the generator changes, since the
  JSON is committed).
- Run a single test file: `npx vitest run lib/scoring/fit.test.ts`.

## Architecture

Six downward-only dependency layers. Nothing below `app/` may import React, HTTP,
or DOM APIs.

```
data/               corpus generation (accounts + signals, seeded RNG) + committed JSON + zod load schema
  ↓
lib/domain/         Account, Signal, ScoreBreakdown, Weights, ResearchBullet, CommandCenterResult — types + zod
  ↓
lib/scoring/        fitScore, signalScore, engagementScore, priorityScore(breakdown, weights)
  ↓
lib/research/       research bullet derivation + rank explanation
  ↓
lib/command-center/ orchestration — assembles CommandCenterResult
  ↓
app/                two screens (home + account detail) + /api/v1/accounts + /api/schema
```

Load-bearing rules (each enforced by a `npm run sweep` invariant — see `PLAN.md`):

- `lib/scoring/` and `lib/research/` are pure and deterministic: same corpus +
  same weights ⇒ byte-identical output. No `Date.now()`, no unseeded
  `Math.random()`. Recency is computed relative to the corpus's committed
  `asOfDate`, never the real current date.
- `priorityScore` must run identically in the browser (for the live weight
  sliders) and in the API route — no Node-only or DOM-only APIs below `app/`.
- Weight sliders only ever change the composite `priorityScore` — the three
  sub-scores (Fit / Signal / Engagement) never change with the weights.
- Every measurement is computed once. The home screen's sliders reuse
  `priorityScore` client-side; the detail page's explanation reuses
  `explainRank` — neither reimplements its logic for display.

## Stack

Next.js (App Router) + React + TypeScript strict with `noUncheckedIndexedAccess`,
Tailwind CSS 4, zod at every boundary (API output, corpus load), vitest + vite-node
for tests/scripts, deployed on Vercel. **Zero dependency exceptions** — the
score-breakdown chart and the signal timeline are hand-rolled SVG, no charting
library.

## Corpus

`data/generate.ts` produces the committed corpus (200 accounts, 0–8 signals each)
from a fixed seed. Every signal's `description` is templated deterministically
from its type and a randomized magnitude detail, documented in full in `PLAN.md`
(§ Method). If you touch the generator, run `data/*.test.ts` and `npm run sweep`
to confirm all nine invariants still hold.
