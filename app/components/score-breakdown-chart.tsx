import type { ScoreBreakdown } from "@/lib/domain/score";

const WIDTH = 340;
const PAD_L = 100;
const PAD_R = 44;
const BAR_H = 22;
const GAP = 16;
const PLOT_W = WIDTH - PAD_L - PAD_R;

const ROWS: { key: "fit" | "signal" | "engagement" | "priority"; label: string; color: string }[] = [
  { key: "fit", label: "Fit", color: "var(--fit)" },
  { key: "signal", label: "Signal", color: "var(--signal)" },
  { key: "engagement", label: "Engagement", color: "var(--engagement)" },
  { key: "priority", label: "Priority", color: "var(--priority)" },
];

export function ScoreBreakdownChart({
  scores,
  priorityScore,
}: {
  scores: ScoreBreakdown;
  priorityScore: number;
}) {
  const values = { ...scores, priority: priorityScore };
  const height = ROWS.length * (BAR_H + GAP);

  return (
    <svg viewBox={`0 0 ${WIDTH} ${height}`} role="img" aria-label="Score breakdown" className="w-full max-w-sm">
      {ROWS.map((row, i) => {
        const y = i * (BAR_H + GAP);
        const value = values[row.key];
        const w = Math.max((value / 100) * PLOT_W, 1);
        return (
          <g key={row.key}>
            <text x={0} y={y + BAR_H / 2 + 4} fontSize={12} fill="var(--ink-dim)">
              {row.label}
            </text>
            <rect x={PAD_L} y={y} width={PLOT_W} height={BAR_H} rx={3} fill="var(--paper)" />
            <rect x={PAD_L} y={y} width={w} height={BAR_H} rx={3} fill={row.color} />
            <text
              x={PAD_L + PLOT_W + 8}
              y={y + BAR_H / 2 + 4}
              fontSize={13}
              className="tabular"
              fontFamily="var(--font-jetbrains-mono)"
              fill="var(--ink)"
            >
              {value}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
