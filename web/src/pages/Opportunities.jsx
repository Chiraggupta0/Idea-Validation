import { useState } from 'react'
import { ExternalLink, Target, Clock } from 'lucide-react'
import { OPPORTUNITIES } from '../lib/opportunities'
import GlassNav from '../components/GlassNav'
import FadeUp from '../components/FadeUp'

const ALL = 'All'
const TYPES = [ALL, ...Array.from(new Set(OPPORTUNITIES.map((o) => o.type)))]

export default function Opportunities() {
  const [type, setType] = useState(ALL)
  const list = type === ALL ? OPPORTUNITIES : OPPORTUNITIES.filter((o) => o.type === type)

  return (
    <div className="min-h-screen">
      <GlassNav />
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <FadeUp>
          <div className="eyebrow text-[var(--ink-soft)]">// funding & growth</div>
          <h1 className="display mt-3 text-4xl sm:text-5xl">Opportunities board.</h1>
          <p className="mt-3 max-w-lg text-sm text-[var(--ink-soft)]">
            Grants, competitions, accelerators and perks worth applying to — curated for founders.
          </p>
        </FadeUp>

        <div className="mt-8 flex flex-wrap gap-2">
          {TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`brutal-flat px-3 py-1.5 text-xs font-bold uppercase ${type === t ? 'text-white' : 'text-[var(--ink)]'}`}
              style={type === t ? { background: 'var(--blue)' } : { background: '#fff' }}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((o, i) => (
            <FadeUp key={o.name} delay={(i % 3) * 0.05}>
              <div className="brutal flex h-full flex-col p-5">
                <div className="flex items-center justify-between">
                  <Target size={20} className="text-[var(--blue)]" />
                  <span className="brutal-flat px-2 py-0.5 text-[11px] font-bold uppercase" style={{ background: 'var(--yellow)' }}>{o.type}</span>
                </div>
                <div className="mt-3 font-display text-lg font-bold leading-tight">{o.name}</div>
                <div className="text-xs text-[var(--muted)]">{o.org}</div>
                <p className="mt-2 flex-1 text-sm text-[var(--ink-soft)]">{o.desc}</p>
                <div className="mt-3 flex items-center gap-1 text-xs text-[var(--ink-soft)]"><Clock size={12} /> {o.deadline}</div>
                <a href={o.url} target="_blank" rel="noreferrer" className="btn btn-light btn-sm mt-3 w-full">Apply / learn more <ExternalLink size={12} /></a>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>
    </div>
  )
}
