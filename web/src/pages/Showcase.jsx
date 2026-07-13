import { Link } from 'react-router-dom'
import { getUsers, getProgress } from '../lib/store'
import GlassNav from '../components/GlassNav'
import Footer from '../components/Footer'
import FadeUp from '../components/FadeUp'
import SkeuoButton from '../components/SkeuoButton'

export default function Showcase() {
  const startups = getUsers().filter((u) => u.role === 'student' && u.startup)

  return (
    <div className="min-h-screen">
      <GlassNav />
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <FadeUp>
          <div className="eyebrow text-[var(--ink-soft)]">// portfolio</div>
          <h1 className="display mt-3 text-4xl sm:text-5xl">Startups in the incubator.</h1>
          <p className="mt-3 max-w-lg text-sm text-[var(--ink-soft)]">
            Founders building the future — validated, mentored, and growing inside SIVP.
          </p>
        </FadeUp>

        {startups.length === 0 ? (
          <div className="brutal mt-10 p-8 text-center text-sm text-[var(--ink-soft)]">
            No startups yet. <Link to="/apply" className="font-bold text-[var(--blue)]">Apply</Link> to be the first.
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {startups.map((s, i) => {
              const p = getProgress(s.id)
              return (
                <FadeUp key={s.id} delay={(i % 3) * 0.06}>
                  <div className="brutal flex h-full flex-col p-5">
                    <div className="flex items-center justify-between">
                      <div className="brutal-flat flex h-11 w-11 items-center justify-center font-display text-lg font-bold" style={{ background: 'var(--blue)', color: '#fff' }}>
                        {s.startup[0].toUpperCase()}
                      </div>
                      <span className="brutal-flat px-2 py-1 text-xs font-bold uppercase" style={{ background: 'var(--yellow)' }}>{p.stage}</span>
                    </div>
                    <div className="mt-4 font-display text-xl font-bold">{s.startup}</div>
                    {s.tagline && <p className="mt-1 text-sm text-[var(--ink-soft)]">{s.tagline}</p>}
                    <div className="mt-auto pt-4">
                      <div className="flex justify-between text-xs"><span className="text-[var(--muted)]">Founder: {s.name}</span><span>{p.percent}%</span></div>
                      <div className="neu-track mt-1 h-2"><div className="bar-fill" style={{ width: `${p.percent}%` }} /></div>
                    </div>
                  </div>
                </FadeUp>
              )
            })}
          </div>
        )}

        <div className="mt-14 text-center">
          <div className="eyebrow mb-3">// building something?</div>
          <SkeuoButton to="/apply" size="lg">Apply to the incubator</SkeuoButton>
        </div>
      </section>
      <Footer />
    </div>
  )
}
