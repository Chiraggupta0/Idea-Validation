import { useState } from 'react'
import { Landmark, ExternalLink } from 'lucide-react'
import { SCHEMES } from '../../lib/schemes'

export default function SchemeList({ stage }) {
  const [showAll, setShowAll] = useState(false)
  const list = showAll ? SCHEMES : SCHEMES.filter((s) => s.stages.includes(stage))

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="eyebrow flex items-center gap-2"><Landmark size={14} /> government schemes for your startup</div>
        <button onClick={() => setShowAll((v) => !v)} className="btn btn-light btn-sm">
          {showAll ? 'Recommended only' : 'Show all schemes'}
        </button>
      </div>
      <p className="mt-1 text-xs text-[var(--muted)]">
        {showAll ? 'All Indian startup schemes.' : `Matched to your current stage: ${stage}.`} Official government portals — links open directly.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {list.length === 0 && <p className="text-xs text-[var(--muted)]">No stage-matched schemes — tap "Show all schemes".</p>}
        {list.map((s) => (
          <div key={s.name} className="brutal-flat flex flex-col p-3">
            <div className="font-display text-sm font-bold leading-tight">{s.name}</div>
            <div className="text-xs text-[var(--muted)]">{s.org}</div>
            <p className="mt-1 flex-1 text-xs text-[var(--ink-soft)]">{s.desc}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {s.tags.map((t) => (
                <span key={t} className="brutal-flat px-1.5 py-0.5 text-[11px] font-bold uppercase" style={{ background: 'var(--yellow)' }}>{t}</span>
              ))}
            </div>
            <a href={s.url} target="_blank" rel="noreferrer" className="btn btn-light btn-sm mt-3 w-full">
              Visit official site <ExternalLink size={12} />
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}
