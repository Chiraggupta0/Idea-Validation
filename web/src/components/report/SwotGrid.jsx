const QUADS = [
  { key: 'strengths', label: 'Strengths' },
  { key: 'weaknesses', label: 'Weaknesses' },
  { key: 'opportunities', label: 'Opportunities' },
  { key: 'threats', label: 'Threats', highlight: true },
]

export default function SwotGrid({ swot }) {
  return (
    <div>
      <div className="eyebrow mb-3">// SWOT · SWOTify</div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {QUADS.map((q) => (
          <div
            key={q.key}
            className="brutal p-4"
            style={q.highlight ? { background: 'var(--yellow)' } : undefined}
          >
            <div className="font-display text-sm font-bold uppercase">{q.label}</div>
            <ul className="mt-2 space-y-1.5">
              {swot[q.key].map((item) => (
                <li key={item} className="text-xs leading-relaxed text-[var(--ink-soft)]">
                  — {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
