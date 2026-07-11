import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Loader2 } from 'lucide-react'
import GlassNav from '../components/GlassNav'
import SkeuoButton from '../components/SkeuoButton'
import { AGENTS } from '../lib/agents'
import type { IdeaInput } from '../lib/types'

const FIELDS: { key: keyof IdeaInput; label: string; textarea?: boolean; ph: string }[] = [
  { key: 'startupName', label: 'Startup name', ph: 'PawPair' },
  { key: 'industry', label: 'Industry (optional — we detect it)', ph: 'Leave blank to auto-detect' },
  { key: 'problemStatement', label: 'Problem statement', textarea: true, ph: 'What painful problem are you solving?' },
  { key: 'solution', label: 'Solution', textarea: true, ph: 'How does your product solve it?' },
  { key: 'targetAudience', label: 'Target audience (optional)', ph: 'Leave blank to auto-detect' },
  { key: 'geographicMarket', label: 'Geographic market', ph: 'India (metro cities first)' },
  { key: 'description', label: 'Description', textarea: true, ph: 'One or two lines about the product.' },
]

const EMPTY: IdeaInput = {
  startupName: '', industry: '', problemStatement: '', solution: '',
  targetAudience: '', geographicMarket: '', description: '',
}

const inputCls =
  'w-full brutal-flat bg-white px-4 py-3 text-sm text-[var(--ink)] outline-none focus:shadow-[3px_3px_0_var(--blue)] placeholder:text-[var(--muted)]'

export default function Validate() {
  const [idea, setIdea] = useState<IdeaInput>(EMPTY)
  const [busy, setBusy] = useState(false)
  const nav = useNavigate()

  const set = (k: keyof IdeaInput, v: string) => setIdea((p) => ({ ...p, [k]: v }))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    // TODO: POST idea to Spring Boot: `/api/validate` -> n8n webhook -> report.
    // For now we simulate the pipeline latency, then show the sample report.
    await new Promise((r) => setTimeout(r, 2200))
    nav('/report')
  }

  if (busy) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <Loader2 size={40} className="animate-spin text-[var(--blue)]" />
        <h2 className="display mt-6 text-2xl">Analyzing your idea</h2>
        <p className="eyebrow mt-2 text-[var(--ink-soft)]">// nexus is orchestrating 10 agents</p>
        <div className="mt-6 flex max-w-md flex-wrap justify-center gap-2">
          {AGENTS.map((a) => (
            <span key={a.name} className="brutal-sm px-2.5 py-1 text-xs font-medium">
              {a.name}
            </span>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <GlassNav />
      <section className="mx-auto max-w-2xl px-6 py-16">
        <div className="eyebrow text-[var(--ink-soft)]">// submit your idea</div>
        <h1 className="display mt-4 text-4xl">Describe your idea.</h1>
        <p className="mt-3 text-sm text-[var(--ink-soft)]">
          Seven fields feed all ten agents — the sharper the input, the sharper the analysis.
        </p>

        <form onSubmit={submit} className="mt-8 space-y-5">
          {FIELDS.map((f) => (
            <div key={f.key}>
              <label className="eyebrow mb-2 block">{f.label}</label>
              {f.textarea ? (
                <textarea
                  className={inputCls}
                  rows={3}
                  placeholder={f.ph}
                  value={idea[f.key]}
                  onChange={(e) => set(f.key, e.target.value)}
                  required={!f.label.includes('optional')}
                />
              ) : (
                <input
                  className={inputCls}
                  placeholder={f.ph}
                  value={idea[f.key]}
                  onChange={(e) => set(f.key, e.target.value)}
                  required={!f.label.includes('optional')}
                />
              )}
            </div>
          ))}
          <SkeuoButton type="submit" size="lg" className="w-full">
            Run validation <ArrowRight size={18} />
          </SkeuoButton>
        </form>
      </section>
    </div>
  )
}
