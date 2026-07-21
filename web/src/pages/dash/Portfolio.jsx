import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, ArrowRight } from 'lucide-react'
import { useAuth } from '../../lib/auth'
import { getReports } from '../../lib/store'
import PageHead from '../../components/dash/PageHead'
import SkeuoButton from '../../components/SkeuoButton'

export default function Portfolio() {
  const { user } = useAuth()
  const [reports, setReports] = useState([])
  const nav = useNavigate()

  useEffect(() => { getReports(user.id).then(setReports) }, [user.id])

  function openReport(row) {
    const stored = row.data || {}
    if (stored.report) sessionStorage.setItem('sivpReport', JSON.stringify(stored.report))
    if (stored.raw) sessionStorage.setItem('sivpReportRaw', JSON.stringify(stored.raw))
    nav('/report')
  }

  return (
    <div>
      <PageHead eyebrow="portfolio" title="Your validations">
        Every idea validation you’ve run, saved so you can reopen the full report anytime.
      </PageHead>

      {reports.length === 0 ? (
        <div className="brutal p-6 text-center">
          <p className="text-sm text-[var(--ink-soft)]">No validations yet.</p>
          <SkeuoButton to="/validate" size="sm" className="mt-3">Validate an idea</SkeuoButton>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {reports.map((row) => {
            const rep = row.data?.report
            const score = rep?.investorReadinessScore
            return (
              <div key={row.id} className="brutal flex flex-col p-5">
                <div className="eyebrow mb-2 flex items-center gap-2"><FileText size={14} /> validation report</div>
                <div className="font-display text-xl font-bold">{row.startup_name}</div>
                <div className="text-xs text-[var(--muted)]">{new Date(row.created_at).toLocaleString()}</div>
                {typeof score === 'number' && (
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="font-display text-3xl font-bold text-[var(--blue)]">{score}</span>
                    <span className="text-xs text-[var(--muted)]">/ 100 investor readiness</span>
                  </div>
                )}
                <button className="btn btn-light btn-sm mt-4 self-start" onClick={() => openReport(row)}>
                  Open report <ArrowRight size={13} />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
