import { useState, useEffect, useCallback } from 'react'
import { Users, Trophy, Plus, Trash2, LogOut, Building2 } from 'lucide-react'
import { useAuth } from '../../lib/auth'
import {
  getMyTeam, createTeam, joinTeamByName, updateTeam, leaveTeam,
  getAchievements, addAchievement, deleteAchievement,
  SECTORS, STAGES, ACHIEVEMENT_TYPES,
} from '../../lib/store'
import PageHead from '../../components/dash/PageHead'
import SkeuoButton from '../../components/SkeuoButton'

const inputCls = 'w-full brutal-flat bg-white px-3 py-2 text-sm outline-none focus:shadow-[3px_3px_0_var(--blue)]'
const inr = (n) => '₹' + Number(n || 0).toLocaleString('en-IN')

function Note({ msg }) {
  if (!msg) return null
  return <p className={`mt-2 text-xs font-bold ${msg.ok ? 'text-[var(--blue)]' : 'text-[#c0392b]'}`}>{msg.text}</p>
}

/* ---------- no team yet: create one or join an existing one ---------- */
function NoTeam({ onDone }) {
  const { user } = useAuth()
  const [mode, setMode] = useState('create')
  const [form, setForm] = useState({ name: '', tagline: '', sector: '', stage: 'Idea' })
  const [joinName, setJoinName] = useState('')
  const [msg, setMsg] = useState(null)

  async function submit(e) {
    e.preventDefault()
    setMsg(null)
    try {
      if (mode === 'create') {
        await createTeam({ ...form, profileId: user.id })
      } else {
        await joinTeamByName(joinName, user.id)
      }
      onDone()
    } catch (err) {
      setMsg({ ok: false, text: err.message })
    }
  }

  return (
    <div className="brutal p-5">
      <div className="mb-4 grid grid-cols-2 gap-2">
        {[['create', 'Start a startup'], ['join', 'Join a co-founder']].map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => setMode(k)}
            className={`brutal-flat py-2.5 text-sm font-bold uppercase ${mode === k ? 'text-white' : 'text-[var(--ink)]'}`}
            style={mode === k ? { background: 'var(--blue)' } : { background: '#fff' }}
          >
            {label}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="space-y-3">
        {mode === 'create' ? (
          <>
            <div>
              <label className="eyebrow mb-1 block text-[var(--muted)]">Startup name</label>
              <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="PawPair" />
            </div>
            <div>
              <label className="eyebrow mb-1 block text-[var(--muted)]">One-line tagline</label>
              <input className={inputCls} value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} placeholder="Verified pet-sitting, on demand." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="eyebrow mb-1 block text-[var(--muted)]">Sector</label>
                <select className={inputCls} value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })}>
                  <option value="">—</option>
                  {SECTORS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="eyebrow mb-1 block text-[var(--muted)]">Stage</label>
                <select className={inputCls} value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })}>
                  {STAGES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <SkeuoButton type="submit" size="sm" className="w-full">Create startup</SkeuoButton>
          </>
        ) : (
          <>
            <p className="text-xs text-[var(--muted)]">
              Ask your co-founder for the exact startup name, then join it here.
            </p>
            <input className={inputCls} value={joinName} onChange={(e) => setJoinName(e.target.value)} required placeholder="Startup name" />
            <SkeuoButton type="submit" size="sm" className="w-full">Join startup</SkeuoButton>
          </>
        )}
        <Note msg={msg} />
      </form>
    </div>
  )
}

export default function Team() {
  const { user } = useAuth()
  const [team, setTeam] = useState(null)
  const [achievements, setAchievements] = useState([])
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState({ tagline: '', sector: '', stage: 'Idea', website: '' })
  const [savedMsg, setSavedMsg] = useState(null)
  const [ach, setAch] = useState({ type: 'Funding', title: '', description: '', amount: '', happenedOn: '' })
  const [achMsg, setAchMsg] = useState(null)

  const load = useCallback(async () => {
    const t = await getMyTeam(user.id)
    setTeam(t)
    if (t) {
      setProfile({ tagline: t.tagline || '', sector: t.sector || '', stage: t.stage || 'Idea', website: t.website || '' })
      setAchievements(await getAchievements(t.id))
    }
    setLoading(false)
  }, [user.id])

  useEffect(() => { load() }, [load])

  async function saveProfile(e) {
    e.preventDefault()
    try {
      await updateTeam(team.id, profile)
      setSavedMsg({ ok: true, text: 'Saved.' })
      load()
    } catch (err) {
      setSavedMsg({ ok: false, text: err.message })
    }
  }

  async function submitAchievement(e) {
    e.preventDefault()
    setAchMsg(null)
    try {
      await addAchievement({
        teamId: team.id, type: ach.type, title: ach.title, description: ach.description,
        amount: ach.type === 'Funding' && ach.amount ? Number(ach.amount) : null,
        happenedOn: ach.happenedOn || null, createdBy: user.id,
      })
      setAch({ type: 'Funding', title: '', description: '', amount: '', happenedOn: '' })
      setAchievements(await getAchievements(team.id))
    } catch (err) {
      setAchMsg({ ok: false, text: err.message })
    }
  }

  if (loading) return <p className="eyebrow text-[var(--muted)]">// loading…</p>

  if (!team) {
    return (
      <div>
        <PageHead eyebrow="startup" title="Your startup">
          Create your startup, or join one a co-founder has already set up.
        </PageHead>
        <NoTeam onDone={load} />
      </div>
    )
  }

  return (
    <div>
      <PageHead eyebrow="startup" title={team.name}>
        {team.tagline || 'Add a tagline so mentors and the showcase know what you do.'}
      </PageHead>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Founders */}
        <div className="brutal p-5">
          <div className="eyebrow mb-3 flex items-center gap-2"><Users size={14} /> founding team</div>
          <div className="space-y-2">
            {team.members.map((m) => (
              <div key={m.id} className="brutal-flat flex items-center gap-3 p-2.5">
                {m.avatar_url
                  ? <img src={m.avatar_url} alt="" className="h-9 w-9 rounded-full object-cover" />
                  : <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--blue)] text-xs font-bold text-white">
                      {(m.name || 'U').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()}
                    </div>}
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold">
                    {m.name}{m.id === user.id && <span className="ml-1 text-xs font-normal text-[var(--blue)]">· you</span>}
                  </div>
                  <div className="truncate text-xs text-[var(--muted)]">{m.email}{m.phone ? ` · ${m.phone}` : ''}</div>
                </div>
                <span className="brutal-flat px-2 py-0.5 text-[11px] font-bold uppercase" style={{ background: 'var(--yellow)' }}>{m.role}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-[var(--muted)]">
            Co-founders join by searching this exact startup name from their own account.
          </p>
          <button
            onClick={async () => { if (confirm('Leave this startup?')) { await leaveTeam(user.id); load() } }}
            className="btn btn-light btn-sm mt-3"
          >
            <LogOut size={13} /> Leave startup
          </button>
        </div>

        {/* Startup profile */}
        <form onSubmit={saveProfile} className="brutal p-5">
          <div className="eyebrow mb-3 flex items-center gap-2"><Building2 size={14} /> startup profile</div>
          <label className="eyebrow mb-1 block text-[var(--muted)]">Tagline</label>
          <input className={inputCls} value={profile.tagline} onChange={(e) => setProfile({ ...profile, tagline: e.target.value })} />
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <label className="eyebrow mb-1 block text-[var(--muted)]">Sector</label>
              <select className={inputCls} value={profile.sector} onChange={(e) => setProfile({ ...profile, sector: e.target.value })}>
                <option value="">—</option>
                {SECTORS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="eyebrow mb-1 block text-[var(--muted)]">Stage</label>
              <select className={inputCls} value={profile.stage} onChange={(e) => setProfile({ ...profile, stage: e.target.value })}>
                {STAGES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <label className="eyebrow mb-1 mt-3 block text-[var(--muted)]">Website</label>
          <input className={inputCls} value={profile.website} onChange={(e) => setProfile({ ...profile, website: e.target.value })} placeholder="https://" />
          <div className="mt-3 flex items-center gap-3">
            <SkeuoButton type="submit" size="sm">Save</SkeuoButton>
            <span className="text-xs text-[var(--muted)]">Funding raised: <b>{inr(team.funding_raised)}</b> — set by your mentor</span>
          </div>
          <Note msg={savedMsg} />
        </form>
      </div>

      {/* Achievements */}
      <div className="brutal mt-6 p-5">
        <div className="eyebrow mb-3 flex items-center gap-2"><Trophy size={14} /> achievements</div>

        <form onSubmit={submitAchievement} className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-[140px_1fr_150px_auto]">
          <select className={inputCls} value={ach.type} onChange={(e) => setAch({ ...ach, type: e.target.value })}>
            {ACHIEVEMENT_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
          <input className={inputCls} value={ach.title} onChange={(e) => setAch({ ...ach, title: e.target.value })} required placeholder="What happened? (e.g. Won Smart India Hackathon)" />
          {ach.type === 'Funding'
            ? <input className={inputCls} type="number" min="0" value={ach.amount} onChange={(e) => setAch({ ...ach, amount: e.target.value })} placeholder="Amount ₹" />
            : <input className={inputCls} type="date" value={ach.happenedOn} onChange={(e) => setAch({ ...ach, happenedOn: e.target.value })} />}
          <SkeuoButton type="submit" size="sm"><Plus size={13} /> Add</SkeuoButton>
        </form>
        <Note msg={achMsg} />

        {achievements.length === 0 ? (
          <p className="text-sm text-[var(--ink-soft)]">No achievements yet — log your first win above.</p>
        ) : (
          <div className="space-y-2">
            {achievements.map((a) => (
              <div key={a.id} className="brutal-flat flex flex-wrap items-center justify-between gap-2 p-3 text-sm">
                <div className="min-w-0">
                  <span className="brutal-flat mr-2 px-2 py-0.5 text-[11px] font-bold uppercase" style={{ background: 'var(--yellow)' }}>{a.type}</span>
                  <b>{a.title}</b>
                  {a.amount ? <span className="text-[var(--blue)]"> · {inr(a.amount)}</span> : null}
                  {a.happened_on && <span className="text-xs text-[var(--muted)]"> · {new Date(a.happened_on).toLocaleDateString()}</span>}
                  {a.description && <div className="text-xs text-[var(--ink-soft)]">{a.description}</div>}
                </div>
                <button
                  onClick={async () => { await deleteAchievement(a.id); setAchievements(await getAchievements(team.id)) }}
                  className="text-[var(--muted)] hover:text-[var(--ink)]"
                  aria-label="Delete achievement"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
