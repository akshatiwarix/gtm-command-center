"use client";

import type { Weights } from "@/lib/domain/score";
import { SCORE_COLOR, SCORE_LABEL, SCORE_DRIVERS_LIST } from "./scorer-style";

export function WeightSliders({ weights, onChange }: { weights: Weights; onChange: (weights: Weights) => void }) {
  return (
    <section aria-labelledby="weights-heading" className="rounded-lg border border-line bg-paper-raised p-4">
      <h2 id="weights-heading" className="font-mono text-xs uppercase tracking-wide text-ink-dim">
        Reweight the Priority Score
      </h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-3">
        {SCORE_DRIVERS_LIST.map((driver) => (
          <label key={driver} className="flex flex-col gap-1.5">
            <span className="flex items-center justify-between text-sm">
              <span className="font-medium" style={{ color: SCORE_COLOR[driver] }}>
                {SCORE_LABEL[driver]}
              </span>
              <span className="tabular font-mono text-xs text-ink-dim">{weights[driver]}</span>
            </span>
            <input
              type="range"
              min={0}
              max={100}
              value={weights[driver]}
              onChange={(e) => onChange({ ...weights, [driver]: Number(e.target.value) })}
              style={{ accentColor: SCORE_COLOR[driver] }}
              aria-label={`${SCORE_LABEL[driver]} weight`}
            />
          </label>
        ))}
      </div>
    </section>
  );
}
