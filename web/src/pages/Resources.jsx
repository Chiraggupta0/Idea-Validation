import { useState } from 'react'
import { ExternalLink, BookOpen } from 'lucide-react'
import { RESOURCE_LIB } from '../lib/resources'
import GlassNav from '../components/GlassNav'
import FadeUp from '../components/FadeUp'

const ALL = 'All'
const CATS = [ALL, ...Array.from(new Set(RESOURCE_LIB.flatMap((r) => r.tags)))]

export default function Resources() {
  const [cat, setCat] = useState(ALL)
  const list = cat === ALL ? RESOURCE_LIB : RESOURCE_LIB.filter((r) => r.tags.includes(cat))

  return (
    <div className="min-h-screen">
      <GlassNav />
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <FadeUp>
          <div className="eyebrow text-[var(--ink-soft)]">// founder toolkit</div>
          <h1 className="display mt-3 text-4xl sm:text-5xl">Resource library.</h1>
          <p className="mt-3 max-w-lg text-sm text-[var(--ink-soft)]">
            Templates and guides for pitching, financials, legal, and fundraising — curated for founders.
          </p>
        </FadeUp>

        <div className="mt-8 flex flex-wrap gap-2">
          {CATS.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`brutal-flat px-3 py-1.5 text-xs font-bold uppercase ${cat === c ? 'text-white' : 'text-[var(--ink)]'}`}
              style={cat === c ? { background: 'var(--blue)' } : { background: '#fff' }}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((r, i) => (
            <FadeUp key={r.name} delay={(i % 3) * 0.05}>
              <div className="brutal flex h-full flex-col p-5">
                <BookOpen size={20} className="text-[var(--blue)]" />
                <div className="mt-3 font-display text-lg font-bold leading-tight">{r.name}</div>
                <div className="text-xs text-[var(--muted)]">{r.org}</div>
                <p className="mt-2 flex-1 text-sm text-[var(--ink-soft)]">{r.desc}</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {r.tags.map((t) => <span key={t} className="brutal-flat px-1.5 py-0.5 text-[11px] font-bold uppercase" style={{ background: 'var(--yellow)' }}>{t}</span>)}
                </div>
                <a href={r.url} target="_blank" rel="noreferrer" className="btn btn-light btn-sm mt-4 w-full">Open <ExternalLink size={12} /></a>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>
    </div>
  )
}
