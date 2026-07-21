export function MarketBars({ rows, note }) {
  return (
    <div className="neu p-5">
      <div className="mb-4 text-xs font-bold uppercase tracking-wide">Market size · MarketMind</div>
      {rows.map((r) => (
        <div key={r.label} className="mb-4 last:mb-0">
          <div className="flex items-baseline gap-2 text-xs">
            <span className="shrink-0 font-semibold">{r.label}</span>
            <span className="leading-snug text-[var(--muted)]">{r.value}</span>
          </div>
          <div className="neu-track mt-1.5 h-3">
            <div className="bar-fill" style={{ width: `${r.pct}%` }} />
          </div>
        </div>
      ))}
      <p className="mt-4 text-xs leading-relaxed text-[var(--muted)]">{note}</p>
    </div>
  )
}

export function ScoreBreakdown({ rows }) {
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
