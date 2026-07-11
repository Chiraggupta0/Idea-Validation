import {
  Eye,
  BarChart3,
  Swords,
  Wrench,
  LayoutGrid,
  TrendingUp,
  Landmark,
  Users,
  GitBranch,
  FileText,
  ArrowRight,
  Check,
  X,
} from 'lucide-react'
import GlassNav from '../components/GlassNav'
import Footer from '../components/Footer'
import FadeUp from '../components/FadeUp'
import SkeuoButton from '../components/SkeuoButton'
import { AGENTS } from '../lib/agents'

const ICONS = {
  Eye, BarChart3, Swords, Wrench, LayoutGrid, TrendingUp, Landmark, Users, GitBranch, FileText,
}

const STEPS = [
  { n: '01', t: 'Describe your idea', d: 'Seven structured fields. Two minutes.' },
  { n: '02', t: 'NEXUS orchestrates', d: 'Ten agents run in parallel, sharing context.' },
  { n: '03', t: 'Analysis compounds', d: 'Market, competitors, SWOT, financials, growth.' },
  { n: '04', t: 'One report', d: 'Scored, structured, exportable.' },
]

const PIPELINE = ['Idea', 'NEXUS', 'VisionAI', 'MarketMind · RivalScope · BuildIQ', 'SWOTify', 'FundIQ', 'Report']

const WITHOUT = ['Months of research', 'Guesswork and gut feel', 'Expensive consultants', 'Scattered docs', 'No investor proof']
const WITH = ['Report in minutes', 'Data-backed scores', 'Ten AI specialists', 'One unified report', 'Investor readiness score']

export default function Landing() {
  return (
    <div className="min-h-screen">
      <GlassNav />

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-16 pb-20 md:px-12 md:pt-24">
        <FadeUp>
          <div className="eyebrow text-[var(--ink-soft)]">// startup idea validation platform</div>
          <h1 className="display mt-5 text-5xl md:text-7xl">
            Validate before
            <br />
            you build.
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-[var(--ink-soft)]">
            Ten AI agents research your market, map competitors, model financials, and score investor
            readiness — one brutally honest report, in minutes.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <SkeuoButton to="/validate" size="lg">
              Validate an idea <ArrowRight size={18} />
            </SkeuoButton>
            <SkeuoButton to="/report" size="lg" variant="light">
              Sample report
            </SkeuoButton>
          </div>
        </FadeUp>

        <FadeUp delay={0.1}>
          <div className="mt-14 flex flex-wrap gap-4">
            {[
              { n: '10', l: 'AI agents', y: false },
              { n: '17', l: 'Sections', y: true },
              { n: '~60s', l: 'Full report', y: false },
            ].map((s) => (
              <div
                key={s.l}
                className="brutal min-w-[130px] px-5 py-4"
                style={s.y ? { background: 'var(--yellow)' } : undefined}
              >
                <div className="font-display text-3xl font-bold tracking-tight">{s.n}</div>
                <div className="eyebrow mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </FadeUp>
      </section>

      {/* How it works */}
      <section id="product" className="border-t-2 border-[var(--ink)] bg-[var(--cream-2)] px-6 py-16 md:px-12">
        <div className="mx-auto max-w-6xl">
          <FadeUp>
            <div className="eyebrow">// how it works</div>
          </FadeUp>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <FadeUp key={s.n} delay={i * 0.08}>
                <div className="brutal h-full p-5">
                  <div className="eyebrow text-[var(--muted)]">{s.n}</div>
                  <div className="mt-2 font-display text-lg font-semibold">{s.t}</div>
                  <p className="mt-1 text-sm text-[var(--ink-soft)]">{s.d}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* Pipeline */}
      <section className="border-t-2 border-[var(--ink)] px-6 py-16 md:px-12">
        <div className="mx-auto max-w-6xl">
          <FadeUp>
            <div className="eyebrow">// the nexus pipeline</div>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-bold">
              {PIPELINE.map((p, i) => (
                <span key={p} className="flex items-center gap-3">
                  <span
                    className="brutal-sm px-3.5 py-2"
                    style={
                      p === 'NEXUS'
                        ? { background: 'var(--blue)', color: '#fff' }
                        : p === 'Report'
                          ? { background: 'var(--yellow)' }
                          : undefined
                    }
                  >
                    {p.toUpperCase()}
                  </span>
                  {i < PIPELINE.length - 1 && <span className="font-display text-base">→</span>}
                </span>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* Agents */}
      <section id="agents" className="border-t-2 border-[var(--ink)] bg-[var(--cream-2)] px-6 py-16 md:px-12">
        <div className="mx-auto max-w-6xl">
          <FadeUp>
            <div className="eyebrow">// the agents</div>
            <h2 className="display mt-2 text-3xl md:text-4xl">Ten specialists. One analysis.</h2>
          </FadeUp>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {AGENTS.map((a, i) => {
              const Icon = ICONS[a.icon] ?? Eye
              return (
                <FadeUp key={a.name} delay={(i % 3) * 0.06}>
                  <div className="brutal group h-full p-5 transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5">
                    <div className="flex items-start justify-between">
                      <div className="brutal-flat flex h-10 w-10 items-center justify-center" style={{ background: 'var(--blue)' }}>
                        <Icon size={18} color="#fff" />
                      </div>
                      <span className="eyebrow text-[var(--muted)]">{a.num}</span>
                    </div>
                    <div className="mt-4 font-display text-lg font-bold">{a.name}</div>
                    <p className="mt-1 text-sm text-[var(--ink-soft)]">{a.question}</p>
                    <div className="eyebrow mt-3 text-[var(--blue-2)]">{a.output}</div>
                  </div>
                </FadeUp>
              )
            })}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section id="pricing" className="border-t-2 border-[var(--ink)] px-6 py-16 md:px-12">
        <div className="mx-auto max-w-6xl">
          <FadeUp>
            <div className="eyebrow">// why sivp</div>
          </FadeUp>
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            <FadeUp>
              <div className="brutal-flat h-full p-6">
                <div className="font-display text-lg font-bold uppercase text-[var(--muted)]">Without SIVP</div>
                <ul className="mt-4 space-y-3">
                  {WITHOUT.map((w) => (
                    <li key={w} className="flex items-center gap-3 text-sm text-[var(--ink-soft)]">
                      <X size={16} className="shrink-0" /> {w}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeUp>
            <FadeUp delay={0.08}>
              <div className="brutal h-full p-6" style={{ background: 'var(--blue)', color: '#fff' }}>
                <div className="font-display text-lg font-bold uppercase">With SIVP</div>
                <ul className="mt-4 space-y-3">
                  {WITH.map((w) => (
                    <li key={w} className="flex items-center gap-3 text-sm">
                      <Check size={16} className="shrink-0" /> {w}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t-2 border-[var(--ink)] px-6 py-20 text-center" style={{ background: 'var(--blue)' }}>
        <FadeUp>
          <h2 className="display text-4xl text-white md:text-5xl">Stop guessing.</h2>
          <p className="mx-auto mt-4 max-w-md text-sm text-white/80">
            Turn your startup idea into an investor-ready business — today.
          </p>
          <div className="mt-8 flex justify-center">
            <SkeuoButton to="/validate" size="lg" variant="light">
              Validate free <ArrowRight size={18} />
            </SkeuoButton>
          </div>
        </FadeUp>
      </section>

      <Footer />
    </div>
  )
}
