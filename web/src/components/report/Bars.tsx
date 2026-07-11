import type { ScoreMetric } from '../../lib/types'

export function MarketBars({
  rows,
  note,
}: {
  rows: { label: string; value: string; pct: number }[]
  note: string
}) {
  return (
    <div className="neu p-5">
      <div className="mb-4 text-xs font-bold uppercase tracking-wide">Market size · MarketMind</div>
      {rows.map((r) => (
        <div key={r.label} className="mb-3 last:mb-0">
          <div className="mb-1 flex justify-between text-xs">
            <span className="font-medium">{r.label}</span>
            <span className="text-[var(--muted)]">{r.value}</span>
          </div>
          <div className="neu-track h-3">
            <div className="bar-fill" style={{ width: `${r.pct}%` }} />
          </div>
        </div>
      ))}
      <p className="mt-4 text-xs leading-relaxed text-[var(--muted)]">{note}</p>
    </div>
  )
}

export function ScoreBreakdown({ rows }: { rows: ScoreMetric[] }) {
  return (
    <div className="neu p-5">
      <div className="mb-4 text-xs font-bold uppercase tracking-wide">Score breakdown · FundIQ</div>
      {rows.map((r) => (
        <div key={r.label} className="mb-2.5 last:mb-0">
          <div className="mb-1 flex justify-between text-xs">
            <span className="font-medium">
              {r.label} <span className="text-[var(--muted)]">· {r.weight}%</span>
            </span>
            <span>{r.value}</span>
          </div>
          <div className="neu-track h-2">
            <div className="bar-fill" style={{ width: `${r.value}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}
