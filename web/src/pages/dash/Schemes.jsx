import { useState, useEffect } from 'react'
import { Landmark, ExternalLink, Sparkles } from 'lucide-react'
import { useAuth } from '../../lib/auth'
import { getReports } from '../../lib/store'
import { SCHEMES } from '../../lib/schemes'
import PageHead from '../../components/dash/PageHead'

export default function Schemes() {
  const { user } = useAuth()
  const [specific, setSpecific] = useState(null) // { startup, schemes[], grants[], incubators[], accelerators[] }

  useEffect(() => {
    ;(async () => {
      const reports = await getReports(user.id)
      const mentor = reports[0]?.data?.raw?.mentorAI
      if (mentor) {
        setSpecific({
          startup: reports[0].startup_name,
          schemes: mentor.governmentSchemes ?? [],
          grants: mentor.grants ?? [],
          incubators: mentor.incubators ?? [],
          accelerators: mentor.accelerators ?? [],
        })
      }
    })()
  }, [user.id])

  return (
    <div>
      <PageHead eyebrow="schemes & grants" title="Government schemes & grants">
        Common schemes for every startup, plus ones matched to your validated idea.
      </PageHead>

      {/* Part 2 — specific to this startup */}
      <div className="brutal mb-6 p-5" style={{ background: 'var(--yellow)' }}>
        <div className="eyebrow mb-3 flex items-center gap-2"><Sparkles size={14} /> matched to {specific?.startup || 'your startup'}</div>
        {!specific ? (
          <p className="text-sm text-[var(--ink-soft)]">
            Run an idea validation first — MentorAI will surface schemes, grants, incubators and accelerators specific to your idea here.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="brutal-flat bg-white p-3">
              <div className="text-xs font-bold uppercase text-[var(--muted)]">Schemes</div>
              {specific.schemes.length === 0 ? <p className="mt-1 text-xs text-[var(--muted)]">—</p> : (
                <ul className="mt-1 space-y-1.5">
                  {specific.schemes.map((s, i) => (
                    <li key={i} className="text-sm">
                      <span className="font-bold">{s.name}</span>
                      {s.benefit && <span className="text-[var(--ink-soft)]"> — {s.benefit}</span>}
                      {s.eligibility && <span className="block text-xs text-[var(--muted)]">Eligibility: {s.eligibility}</span>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="brutal-flat bg-white p-3">
              <div className="text-xs font-bold uppercase text-[var(--muted)]">Grants</div>
              <ul className="mt-1 space-y-1 text-sm">
                {(specific.grants.length ? specific.grants : ['—']).map((g, i) => <li key={i}>— {g}</li>)}
              </ul>
              <div className="mt-3 text-xs font-bold uppercase text-[var(--muted)]">Incubators & accelerators</div>
              <ul className="mt-1 space-y-1 text-sm">
                {[...(specific.incubators || []), ...(specific.accelerators || [])].slice(0, 6).map((x, i) => <li key={i}>— {x}</li>)}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Part 1 — common schemes */}
      <div className="eyebrow mb-3 flex items-center gap-2"><Landmark size={14} /> common schemes for every startup</div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {SCHEMES.map((s) => (
          <div key={s.name} className="brutal flex flex-col p-4">
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
