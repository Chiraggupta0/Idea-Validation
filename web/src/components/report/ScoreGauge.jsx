export default function ScoreGauge({ score, category }) {
  const r = 56
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  return (
    <div className="neu flex flex-col items-center p-6">
      <svg width="150" height="150" viewBox="0 0 150 150" role="img" aria-label={`Investor readiness ${score} of 100`}>
        <circle cx="75" cy="75" r={r} fill="none" stroke="var(--neu-track)" strokeWidth="14" />
        <circle
          cx="75"
          cy="75"
          r={r}
          fill="none"
          stroke="var(--blue)"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          transform="rotate(-90 75 75)"
        />
        <text x="75" y="78" textAnchor="middle" fill="var(--ink)" fontSize="38" fontWeight="700" fontFamily="Space Grotesk, sans-serif">
          {score}
        </text>
        <text x="75" y="98" textAnchor="middle" fill="var(--muted)" fontSize="11" fontFamily="JetBrains Mono, monospace">
          / 100
        </text>
      </svg>
      <div className="mt-2 text-sm font-medium text-[var(--ink-soft)]">Investor readiness</div>
      <div className="mt-1 text-sm font-bold uppercase text-[var(--blue)]">{category}</div>
    </div>
  )
}
