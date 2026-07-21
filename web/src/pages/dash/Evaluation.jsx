import { useState, useEffect } from 'react'
import { Star, Megaphone } from 'lucide-react'
import { useAuth } from '../../lib/auth'
import { getEvals, getAnnouncements } from '../../lib/store'
import PageHead from '../../components/dash/PageHead'

export default function Evaluation() {
  const { user } = useAuth()
  const [evals, setEvals] = useState([])
  const [notices, setNotices] = useState([])

  useEffect(() => {
    getEvals(user.id).then(setEvals)
    getAnnouncements().then(setNotices)
  }, [user.id])

  return (
    <div>
      <PageHead eyebrow="evaluation" title="Reviews & notices">
        Feedback and scores from your mentor, plus notices from the incubation centre.
      </PageHead>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="brutal p-5">
          <div className="eyebrow mb-3 flex items-center gap-2"><Star size={14} /> mentor evaluations</div>
          {evals.length === 0 ? (
            <p className="text-sm text-[var(--ink-soft)]">No evaluations yet — your mentor will review your progress.</p>
          ) : (
            <div className="space-y-3">
              {evals.map((ev) => (
                <div key={ev.id} className="brutal-flat p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold">Score: {ev.score}/10</span>
                    <span className="text-xs text-[var(--muted)]">{new Date(ev.created_at).toLocaleDateString()}</span>
                  </div>
                  {ev.by_name && <div className="text-xs text-[var(--muted)]">by {ev.by_name}</div>}
                  <p className="mt-1 text-sm text-[var(--ink-soft)]">{ev.feedback}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="brutal p-5">
          <div className="eyebrow mb-3 flex items-center gap-2"><Megaphone size={14} /> notices</div>
          {notices.length === 0 ? (
            <p className="text-sm text-[var(--ink-soft)]">No notices right now.</p>
          ) : (
            <div className="space-y-3">
              {notices.map((n) => (
                <div key={n.id} className="brutal-flat p-3">
                  <div className="font-display font-bold">{n.title}</div>
                  <p className="mt-0.5 text-sm text-[var(--ink-soft)]">{n.body}</p>
                  <div className="mt-1 text-xs text-[var(--muted)]">{new Date(n.created_at).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
