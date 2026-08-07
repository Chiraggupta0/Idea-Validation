import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { UserCog, Megaphone, FileSearch, TrendingUp, FileText } from 'lucide-react'
import { useAuth } from '../../lib/auth'
import { getUser, getProgress, getAnnouncements, getReports, getCohortFor, getMyTeam } from '../../lib/store'
import PageHead from '../../components/dash/PageHead'
import SkeuoButton from '../../components/SkeuoButton'

export default function DashHome() {
  const { user } = useAuth()
  const [mentor, setMentor] = useState(null)
  const [cohort, setCohort] = useState(null)
  const [progress, setProgress] = useState({ stage: 'Idea', percent: 10 })
  const [announcement, setAnnouncement] = useState(null)
  const [reports, setReports] = useState([])
  const [team, setTeam] = useState(null)

  useEffect(() => {
    ;(async () => {
      const [m, c, p, an, rp, t] = await Promise.all([
        getUser(user.mentor_id),
        getCohortFor(user.cohort_id),
        getProgress(user.id),
        getAnnouncements(),
        getReports(user.id),
        getMyTeam(user.id),
      ])
      setMentor(m)
      setCohort(c)
      setProgress(p)
      setAnnouncement(an[0] ?? null)
      setReports(rp)
      setTeam(t)
    })()
  }, [user.id, user.mentor_id, user.cohort_id])

  const latestReport = reports[0]

  return (
    <div>
      <PageHead eyebrow="dashboard" title={`Hi, ${(user.name || 'there').split(' ')[0]}.`}>
        {team ? `Everything about ${team.name}, in one place.` : 'Track your startup journey with your mentor.'}
      </PageHead>

      {announcement && (
        <div className="brutal mb-6 p-4" style={{ background: 'var(--yellow)' }}>
          <div className="eyebrow mb-1 flex items-center gap-2"><Megaphone size={14} /> announcement</div>
          <div className="font-display font-bold">{announcement.title}</div>
          <p className="text-sm text-[var(--ink-soft)]">{announcement.body}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Startup + mentor */}
        <div className="brutal p-5">
          <div className="eyebrow mb-3">your startup</div>
          {team ? (
            <>
              <div className="font-display text-2xl font-bold">{team.name}</div>
              {team.tagline && <p className="text-sm text-[var(--ink-soft)]">{team.tagline}</p>}
              <div className="mt-1 text-xs text-[var(--muted)]">
                {team.members.length} founder{team.members.length === 1 ? '' : 's'}
                {team.sector ? ` · ${team.sector}` : ''}
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-[var(--ink-soft)]">You haven't set up a startup yet.</p>
              <Link to="/student/team" className="btn btn-light btn-sm mt-2">Create or join one</Link>
            </>
          )}
          {cohort && <div className="mt-2 inline-block brutal-flat px-2 py-0.5 text-xs font-bold uppercase" style={{ background: 'var(--blue)', color: '#fff' }}>{cohort.name}</div>}

          <div className="mt-5 eyebrow mb-2 flex items-center gap-2"><UserCog size={14} /> your mentor</div>
          {mentor ? (
            <>
              <div className="font-display font-bold">{mentor.name}</div>
              <div className="text-sm text-[var(--ink-soft)]">{mentor.expertise}</div>
              <div className="text-xs text-[var(--muted)]">{mentor.email}</div>
            </>
          ) : (
            <p className="text-sm text-[var(--ink-soft)]">No mentor assigned yet.</p>
          )}
        </div>

        {/* Progress + validate */}
        <div className="flex flex-col gap-6">
          <div className="brutal p-5">
            <div className="eyebrow mb-2 flex items-center gap-2"><TrendingUp size={14} /> progress</div>
            <div className="flex items-baseline justify-between">
              <span className="font-display text-xl font-bold">{progress.stage}</span>
              <span className="text-sm text-[var(--muted)]">{progress.percent}%</span>
            </div>
            <div className="neu-track mt-2 h-2"><div className="bar-fill" style={{ width: `${progress.percent}%` }} /></div>
          </div>

          <div className="brutal p-5" style={{ background: 'var(--blue)', color: '#fff' }}>
            <div className="eyebrow mb-2 flex items-center gap-2" style={{ color: '#fff' }}><FileSearch size={14} /> idea validation</div>
            <p className="text-sm text-white/85">Run your idea through the 10-agent pipeline and get an investor-ready report.</p>
            <SkeuoButton to="/validate" size="sm" variant="light" className="mt-3">Validate an idea</SkeuoButton>
          </div>
        </div>
      </div>

      {/* Latest validation */}
      <div className="brutal mt-6 p-5">
        <div className="eyebrow mb-3 flex items-center gap-2"><FileText size={14} /> latest validation</div>
        {latestReport ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="font-display font-bold">{latestReport.startup_name}</div>
              <div className="text-xs text-[var(--muted)]">{new Date(latestReport.created_at).toLocaleDateString()}</div>
            </div>
            <Link to="/student/portfolio" className="btn btn-light btn-sm">View portfolio</Link>
          </div>
        ) : (
          <p className="text-sm text-[var(--ink-soft)]">No validations yet — run your first one above.</p>
        )}
      </div>
    </div>
  )
}
