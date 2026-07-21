import { useState, useEffect } from 'react'
import { Trophy } from 'lucide-react'
import { useAuth } from '../../lib/auth'
import { getLeaderboard } from '../../lib/store'
import PageHead from '../../components/dash/PageHead'

function inr(n) {
  if (!n) return '₹0'
  return '₹' + Number(n).toLocaleString('en-IN')
}
const medal = ['🥇', '🥈', '🥉']

export default function Leaderboard() {
  const { user } = useAuth()
  const [rows, setRows] = useState([])

  useEffect(() => { getLeaderboard().then(setRows) }, [])

  return (
    <div>
      <PageHead eyebrow="leaderboard" title="Startup leaderboard">
        Ranked by funding raised, then by how far each startup has progressed.
      </PageHead>

      <div className="brutal overflow-x-auto p-2 sm:p-4">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr className="text-left text-xs uppercase text-[var(--muted)]">
              <th className="px-3 py-2">#</th>
              <th className="px-3 py-2">Startup</th>
              <th className="px-3 py-2">Founder</th>
              <th className="px-3 py-2">Funding</th>
              <th className="px-3 py-2">Stage</th>
              <th className="px-3 py-2 w-40">Progress</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={6} className="px-3 py-6 text-center text-[var(--muted)]">No startups ranked yet.</td></tr>
            )}
            {rows.map((r, i) => {
              const me = r.id === user.id
              return (
                <tr key={r.id} className="border-t border-black/10" style={me ? { background: 'var(--yellow)' } : undefined}>
                  <td className="px-3 py-2.5 font-bold">{medal[i] || i + 1}</td>
                  <td className="px-3 py-2.5">
                    <div className="font-bold">{r.startup}{me && <span className="ml-1 text-xs text-[var(--blue)]">· you</span>}</div>
                    {r.tagline && <div className="text-xs text-[var(--muted)]">{r.tagline}</div>}
                  </td>
                  <td className="px-3 py-2.5 text-[var(--ink-soft)]">{r.founder}</td>
                  <td className="px-3 py-2.5 font-bold">{inr(r.funding)}</td>
                  <td className="px-3 py-2.5"><span className="brutal-flat px-2 py-0.5 text-xs font-bold uppercase">{r.stage}</span></td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="neu-track h-2 flex-1"><div className="bar-fill" style={{ width: `${r.percent}%` }} /></div>
                      <span className="text-xs text-[var(--muted)]">{r.percent}%</span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-3 flex items-center gap-2 text-xs text-[var(--muted)]">
        <Trophy size={13} /> Funding figures are set by your mentor/admin as your startup raises.
      </p>
    </div>
  )
}
