import { useState, useEffect, useMemo } from 'react'
import { Trophy } from 'lucide-react'
import { useAuth } from '../../lib/auth'
import { getLeaderboard, getMyTeam, SECTORS, STAGES } from '../../lib/store'
import PageHead from '../../components/dash/PageHead'

function inr(n) {
  if (!n) return '₹0'
  return '₹' + Number(n).toLocaleString('en-IN')
}
const medal = ['🥇', '🥈', '🥉']
const selectCls = 'brutal-flat bg-white px-2 py-1.5 text-xs outline-none'

export default function Leaderboard() {
  const { user } = useAuth()
  const [rows, setRows] = useState([])
  const [myTeamId, setMyTeamId] = useState(null)
  const [sector, setSector] = useState('')
  const [stage, setStage] = useState('')

  useEffect(() => {
    getLeaderboard().then(setRows)
    getMyTeam(user.id).then((t) => setMyTeamId(t?.id ?? null))
  }, [user.id])

  // Filtering after ranking, so a startup keeps its overall rank number.
  const filtered = useMemo(
    () => rows
      .map((r, i) => ({ ...r, rank: i + 1 }))
      .filter((r) => (!sector || r.sector === sector) && (!stage || r.stage === stage)),
    [rows, sector, stage]
  )

  return (
    <div>
      <PageHead eyebrow="leaderboard" title="Startup leaderboard">
        Ranked by funding raised, then by how far each startup has progressed.
      </PageHead>

      <div className="mb-4 flex flex-wrap gap-2">
        <select className={selectCls} value={sector} onChange={(e) => setSector(e.target.value)}>
          <option value="">All sectors</option>
          {SECTORS.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select className={selectCls} value={stage} onChange={(e) => setStage(e.target.value)}>
          <option value="">All stages</option>
          {STAGES.map((s) => <option key={s}>{s}</option>)}
        </select>
        {(sector || stage) && (
          <button className="btn btn-light btn-sm" onClick={() => { setSector(''); setStage('') }}>Reset</button>
        )}
      </div>

      <div className="brutal overflow-x-auto p-2 sm:p-4">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="text-left text-xs uppercase text-[var(--muted)]">
              <th className="px-3 py-2">#</th>
              <th className="px-3 py-2">Startup</th>
              <th className="px-3 py-2">Founders</th>
              <th className="px-3 py-2">Sector</th>
              <th className="px-3 py-2">Funding</th>
              <th className="px-3 py-2">Stage</th>
              <th className="w-40 px-3 py-2">Progress</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-3 py-6 text-center text-[var(--muted)]">No startups match these filters.</td></tr>
            )}
            {filtered.map((r) => {
              const mine = r.id === myTeamId
              return (
                <tr key={r.id} className="border-t border-black/10" style={mine ? { background: 'var(--yellow)' } : undefined}>
                  <td className="px-3 py-2.5 font-bold">{medal[r.rank - 1] || r.rank}</td>
                  <td className="px-3 py-2.5">
                    <div className="font-bold">{r.startup}{mine && <span className="ml-1 text-xs text-[var(--blue)]">· you</span>}</div>
                    {r.tagline && <div className="text-xs text-[var(--muted)]">{r.tagline}</div>}
                  </td>
                  <td className="px-3 py-2.5 text-xs text-[var(--ink-soft)]">{r.founders.join(', ') || '—'}</td>
                  <td className="px-3 py-2.5 text-xs">{r.sector || '—'}</td>
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
        <Trophy size={13} /> Funding figures are set by your mentor or admin as your startup raises.
      </p>
    </div>
  )
}
