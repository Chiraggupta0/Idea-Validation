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
  Sparkles,
  Inbox,
  Megaphone,
  Layers,
  UserCog,
  CalendarCheck,
  ClipboardCheck,
  MessageSquare,
  FolderOpen,
  Trophy,
  Settings,
  ShieldCheck,
  Rocket,
} from 'lucide-react'
import GlassNav from '../components/GlassNav'
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

/* ---------- reusable section pieces ---------- */

function ImpactStat({ value, label, highlight }) {
  return (
    <div className="brutal-flat px-5 py-4 text-center sm:text-left" style={highlight ? { background: 'var(--yellow)' } : { background: '#fff' }}>
      <div className="font-display text-3xl font-bold tracking-tight">{value}</div>
      <div className="eyebrow mt-1 text-[var(--muted)]">{label}</div>
    </div>
  )
}

function ProblemCard({ icon: Icon, title, desc }) {
  return (
    <div className="brutal-flat h-full p-4">
      <Icon size={18} className="text-[var(--muted)]" />
      <div className="mt-2 font-display text-sm font-bold">{title}</div>
      <p className="mt-1 text-xs leading-relaxed text-[var(--ink-soft)]">{desc}</p>
    </div>
  )
}

function SolutionCard({ icon: Icon, title, desc, bullets }) {
  return (
    <div className="brutal h-full p-5">
      <div className="brutal-flat flex h-9 w-9 items-center justify-center" style={{ background: 'var(--blue)' }}>
        <Icon size={16} color="#fff" />
      </div>
      <div className="mt-3 font-display text-base font-bold">{title}</div>
      <p className="mt-1 text-xs leading-relaxed text-[var(--ink-soft)]">{desc}</p>
      {bullets && (
        <ul className="mt-3 space-y-1.5">
          {bullets.map((b) => (
            <li key={b} className="flex items-start gap-2 text-xs text-[var(--ink-soft)]">
              <Check size={13} className="mt-0.5 shrink-0 text-[var(--blue)]" /> {b}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/** A section built the same way Projexa structures its per-audience pitch:
 *  eyebrow -> headline -> "the struggle" problem cards -> "the solution"
 *  cards -> a row of honest, structural impact stats (no invented metrics). */
function AudienceSection({ id, eyebrow, title, sub, problems, solutions, stats, tint }) {
  return (
    <section id={id} className={`border-t-2 border-[var(--ink)] px-6 py-16 md:px-12 ${tint ? 'bg-[var(--cream-2)]' : ''}`}>
      <div className="mx-auto max-w-6xl">
        <FadeUp>
          <div className="eyebrow">// {eyebrow}</div>
          <h2 className="display mt-2 text-3xl md:text-4xl">{title}</h2>
          {sub && <p className="mt-3 max-w-xl text-sm text-[var(--ink-soft)]">{sub}</p>}
        </FadeUp>

        <FadeUp delay={0.05}>
          <div className="mt-8 eyebrow text-[var(--muted)]">the struggle today</div>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {problems.map((p) => (
              <ProblemCard key={p.title} {...p} />
            ))}
          </div>
        </FadeUp>

        <FadeUp delay={0.1}>
          <div className="mt-10 eyebrow text-[var(--blue-2)]">how sivp helps</div>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {solutions.map((s) => (
              <SolutionCard key={s.title} {...s} />
            ))}
          </div>
        </FadeUp>

        {stats && (
          <FadeUp delay={0.15}>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {stats.map((s) => (
                <ImpactStat key={s.label} {...s} />
              ))}
            </div>
          </FadeUp>
        )}
      </div>
    </section>
  )
}

export default function Landing() {
  return (
    <div className="min-h-screen">
      <GlassNav />

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-16 pb-20 md:px-12 md:pt-24">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <FadeUp>
              <div className="brutal-flat inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide" style={{ background: 'var(--yellow)' }}>
                <Sparkles size={11} /> new: 10-agent validation engine
              </div>
              <h1 className="display mt-5 text-5xl md:text-6xl">
                Validate ideas.
                <br />
                Run your incubator.
              </h1>
              <p className="mt-6 max-w-md text-base leading-relaxed text-[var(--ink-soft)]">
                Ten AI agents research your market, map competitors, model financials, and score investor
                readiness — then the same platform runs the incubator around it: mentors, cohorts,
                documents, and evaluations.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <SkeuoButton to="/validate" size="lg">
                  Validate an idea <ArrowRight size={18} />
                </SkeuoButton>
                <SkeuoButton to="/report" size="lg" variant="light">
                  Sample report
                </SkeuoButton>
              </div>
              <p className="mt-6 eyebrow text-[var(--muted)]">10 AI agents · 3 roles supported · full report in ~90s</p>
            </FadeUp>
          </div>

          {/* Decorative mockup panel — a static preview, not live data */}
          <FadeUp delay={0.1}>
            <div className="brutal p-5">
              <div className="flex items-center justify-between">
                <span className="eyebrow text-[var(--muted)]">// nexus — analyzing idea</span>
                <span className="flex h-2 w-2 animate-pulse rounded-full" style={{ background: 'var(--blue)' }} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {['VisionAI', 'MarketMind', 'RivalScope', 'BuildIQ', 'SWOTify', 'FundIQ'].map((a) => (
                  <span key={a} className="brutal-sm flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold">
                    <Check size={11} className="text-[var(--blue)]" /> {a}
                  </span>
                ))}
              </div>
              <div className="neu mt-5 flex items-center gap-4 p-4">
                <div className="brutal-flat flex h-14 w-14 shrink-0 items-center justify-center font-display text-xl font-bold" style={{ background: 'var(--blue)', color: '#fff' }}>
                  84
                </div>
                <div>
                  <div className="font-display text-sm font-bold uppercase">Investor readiness</div>
                  <div className="text-xs text-[var(--muted)]">Good · worth pursuing</div>
                </div>
              </div>
              <div className="mt-3 font-mono text-[11px] text-[var(--muted)]">$ report exported → pdf, docx, pptx</div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t-2 border-[var(--ink)] bg-[var(--cream-2)] px-6 py-16 md:px-12">
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

      {/* For Incubators & Admins */}
      <AudienceSection
        id="for-admins"
        eyebrow="for incubators & admins"
        title="Spreadsheets and inboxes don't scale a cohort."
        sub="Run applications, mentor assignment, and cohort oversight from one control panel instead of scattered tools."
        problems={[
          { icon: Inbox, title: 'Manual applications', desc: 'Founder applications tracked in email or a spreadsheet, easy to lose.' },
          { icon: UserCog, title: 'Ad-hoc mentor pairing', desc: 'No structured way to match mentors to founders by cohort.' },
          { icon: BarChart3, title: 'No cohort visibility', desc: "Can't see at a glance which founders are stuck vs. progressing." },
          { icon: Megaphone, title: 'Scattered updates', desc: 'Announcements sent one-off, no single place everyone checks.' },
        ]}
        solutions={[
          {
            icon: Inbox,
            title: 'Application pipeline',
            desc: 'Every founder application lands in one inbox with a status pipeline.',
            bullets: ['Applied → Shortlisted → Interview → Admitted → Rejected', 'Public /apply intake form, no manual entry'],
          },
          {
            icon: Layers,
            title: 'Cohorts & mentor assignment',
            desc: 'Group founders into batches and assign mentors with a click.',
            bullets: ['Create/manage cohorts (e.g. "Batch 2026")', 'Reassign mentors per student anytime'],
          },
          {
            icon: BarChart3,
            title: 'Live progress analytics',
            desc: 'A stage-by-stage breakdown of every founder in the program.',
            bullets: ['Students-by-stage chart, updated in real time', 'Full user directory with role management'],
          },
          {
            icon: Megaphone,
            title: 'Centre-wide announcements',
            desc: 'Post once, every founder and mentor sees it in their dashboard.',
            bullets: ['Instant broadcast, no email list to maintain'],
          },
        ]}
        stats={[
          { value: '5', label: 'Admission stages' },
          { value: '1', label: 'Control panel' },
          { value: '3', label: 'Roles governed' },
          { value: 'RLS', label: 'DB-level access control' },
        ]}
      />

      {/* For Mentors */}
      <AudienceSection
        id="for-mentors"
        eyebrow="for mentors"
        title="Guide founders without living in your inbox."
        sub="See every mentee's progress, respond to meeting requests, and leave structured evaluations in one place."
        tint
        problems={[
          { icon: MessageSquare, title: 'Scattered check-ins', desc: 'Feedback and updates spread across email, chat, and memory.' },
          { icon: CalendarCheck, title: 'Manual scheduling', desc: 'Back-and-forth to find a meeting time with each founder.' },
          { icon: ClipboardCheck, title: 'No structured evaluation', desc: 'Feedback given verbally, never recorded for later reference.' },
          { icon: TrendingUp, title: 'Progress is invisible', desc: "Can't tell who's stalled without asking directly." },
        ]}
        solutions={[
          {
            icon: Users,
            title: 'Mentee roster with live progress',
            desc: 'Every assigned founder, their stage, and completion % in one view.',
          },
          {
            icon: CalendarCheck,
            title: 'Meeting requests, accept or decline',
            desc: 'Founders request a slot; you respond with one click.',
          },
          {
            icon: ClipboardCheck,
            title: 'Structured evaluations',
            desc: 'Score out of 10 with written feedback, saved to the founder\'s record.',
          },
          {
            icon: FolderOpen,
            title: 'Tasks, resources & messaging',
            desc: 'Assign tasks, share resources, and message each mentee directly.',
          },
        ]}
        stats={[
          { value: '1', label: 'Roster view' },
          { value: '0/10', label: 'Structured scoring' },
          { value: '↔', label: 'Direct messaging' },
          { value: 'Live', label: 'Progress tracking' },
        ]}
      />

      {/* For Founders */}
      <AudienceSection
        id="for-founders"
        eyebrow="for founders"
        title="From idea to funded, all in one dashboard."
        sub="Validate your idea, then use the same platform to run your journey through the incubator."
        problems={[
          { icon: Eye, title: 'No early feedback', desc: "Build for months before finding out if the idea even holds up." },
          { icon: MessageSquare, title: 'No cohort community', desc: 'No easy way to connect with other founders in the program.' },
          { icon: FolderOpen, title: 'Document chasing', desc: 'Mentors and admins ask for files over email, one at a time.' },
          { icon: Landmark, title: 'Missed schemes & grants', desc: "Relevant government support is hard to find and easy to miss." },
        ]}
        solutions={[
          {
            icon: Rocket,
            title: 'Validation on demand',
            desc: 'Re-run the 10-agent pipeline anytime your idea evolves.',
            bullets: ['Full portfolio of every validation you\'ve run', 'Export any report as PDF, DOCX, or PPTX'],
          },
          {
            icon: Users,
            title: 'Community & mentor contact',
            desc: 'Live chat with the whole cohort, plus a direct line to your mentor.',
            bullets: ['Community-wide chat', 'Meeting scheduler + message thread with your mentor'],
          },
          {
            icon: FolderOpen,
            title: 'Documents, handled',
            desc: 'Upload files once; mentors/admins can request specific ones.',
            bullets: ['Secure private storage per founder', 'Request → upload → fulfilled, tracked automatically'],
          },
          {
            icon: Trophy,
            title: 'Leaderboard & schemes',
            desc: 'See where you rank, and which government support applies to you.',
            bullets: ['Ranked by funding raised + progress', 'Common schemes + ones matched to your specific idea'],
          },
        ]}
        stats={[
          { value: '10', label: 'AI agents per validation' },
          { value: '~90s', label: 'Full report time' },
          { value: '3', label: 'Export formats' },
          { value: '1', label: 'Dashboard for everything' },
        ]}
      />

      {/* Everything you need */}
      <section className="border-t-2 border-[var(--ink)] px-6 py-16 md:px-12">
        <div className="mx-auto max-w-6xl">
          <FadeUp>
            <div className="eyebrow">// everything you need</div>
            <h2 className="display mt-2 text-3xl md:text-4xl">One platform, idea to funding.</h2>
          </FadeUp>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Rocket, title: '10-Agent Validation', desc: 'Market, competitors, financials, SWOT, and more — one report.' },
              { icon: ShieldCheck, title: 'Role-Based Access', desc: 'Founder, mentor, admin — enforced at the database, not just the UI.' },
              { icon: Users, title: 'Community Chat', desc: 'Live, centre-wide chat for the whole cohort.' },
              { icon: FolderOpen, title: 'Secure Documents', desc: 'Private uploads with mentor/admin document requests.' },
              { icon: Landmark, title: 'Schemes & Grants', desc: 'Common + idea-specific government support, surfaced automatically.' },
              { icon: Trophy, title: 'Funding Leaderboard', desc: 'Startups ranked by funding raised and progress.' },
              { icon: ClipboardCheck, title: 'Mentor Evaluations', desc: 'Structured, scored feedback saved to every founder\'s record.' },
              { icon: Settings, title: 'Full Profile Control', desc: 'Name, photo, phone, and password — all self-serve.' },
            ].map((f, i) => (
              <FadeUp key={f.title} delay={(i % 4) * 0.06}>
                <div className="brutal-flat h-full p-4">
                  <f.icon size={18} className="text-[var(--blue)]" />
                  <div className="mt-2 font-display text-sm font-bold">{f.title}</div>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--ink-soft)]">{f.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section id="pricing" className="border-t-2 border-[var(--ink)] bg-[var(--cream-2)] px-6 py-16 md:px-12">
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
    </div>
  )
}
