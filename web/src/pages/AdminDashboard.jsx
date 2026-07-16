import { useState, useEffect, useCallback } from 'react'
import { Users, GraduationCap, UserCog, CalendarDays, Megaphone, Trash2, BarChart3, Inbox, Layers } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts'
import { useAuth } from '../lib/auth'
import {
  getUsers, assignMentor, getMeetings, getProgressMap,
  getAnnouncements, addAnnouncement, deleteAnnouncement, deleteUser, setUserRole, STAGES,
  getApplications, updateApplication, APP_STAGES,
  getCohorts, addCohort, deleteCohort, setStudentCohort,
} from '../lib/store'
import GlassNav from '../components/GlassNav'
import SkeuoButton from '../components/SkeuoButton'

const inputCls = 'w-full brutal-flat bg-white px-3 py-2 text-sm outline-none focus:shadow-[3px_3px_0_var(--blue)]'

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="neu p-5">
      <div className="flex items-center gap-2 text-[var(--muted)]"><Icon size={15} /><span className="text-xs font-medium">{label}</span></div>
      <div className="mt-1 font-display text-3xl font-bold">{value}</div>
    </div>
  )
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [progressMap, setProgressMap] = useState({})
  const [anns, setAnns] = useState([])
  const [annForm, setAnnForm] = useState({ title: '', body: '' })
  const [apps, setApps] = useState([])
  const [cohorts, setCohorts] = useState([])
  const [cohortName, setCohortName] = useState('')
  const [meetings, setMeetings] = useState([])

  const loadAll = useCallback(async () => {
    const [u, a, ap, c, m] = await Promise.all([
      getUsers(), getAnnouncements(), getApplications(), getCohorts(), getMeetings(),
    ])
    setUsers(u); setAnns(a); setApps(ap); setCohorts(c); setMeetings(m)
    setProgressMap(await getProgressMap(u.filter((x) => x.role === 'student').map((x) => x.id)))
  }, [])

  useEffect(() => { loadAll() }, [loadAll])

  const mentors = users.filter((u) => u.role === 'mentor')
  const students = users.filter((u) => u.role === 'student')
  const stageData = STAGES.map((s) => ({ stage: s, count: students.filter((st) => (progressMap[st.id]?.stage ?? 'Idea') === s).length }))

  async function postAnn(e) {
    e.preventDefault()
    if (!annForm.title.trim()) return
    await addAnnouncement(annForm)
    setAnnForm({ title: '', body: '' })
    setAnns(await getAnnouncements())
  }
  async function createCohort(e) {
    e.preventDefault()
    if (!cohortName.trim()) return
    await addCohort({ name: cohortName })
    setCohortName('')
    setCohorts(await getCohorts())
  }

  return (
    <div className="min-h-screen">
      <GlassNav />
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="eyebrow text-[var(--ink-soft)]">// admin dashboard</div>
        <h1 className="display mt-2 text-3xl sm:text-4xl">Control panel.</h1>
        <p className="mt-1 text-sm text-[var(--ink-soft)]">Signed in as {user.name}</p>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard icon={Users} label="Total users" value={users.length} />
          <StatCard icon={GraduationCap} label="Students" value={students.length} />
          <StatCard icon={UserCog} label="Mentors" value={mentors.length} />
          <StatCard icon={CalendarDays} label="Meetings" value={meetings.length} />
        </div>

        {/* Applications */}
        <div className="brutal mt-6 p-5">
          <div className="eyebrow mb-4 flex items-center gap-2"><Inbox size={14} /> applications ({apps.filter((a) => a.status === 'Applied').length} new)</div>
          {apps.length === 0 && <p className="text-sm text-[var(--muted)]">No applications yet. Share <b>/apply</b> to collect founder applications.</p>}
          <div className="space-y-2">
            {apps.map((a) => (
              <div key={a.id} className="brutal-flat flex flex-wrap items-center justify-between gap-3 p-3">
                <div className="min-w-0">
                  <div className="font-bold">{a.startup} <span className="text-xs font-normal text-[var(--muted)]">· {a.name} · {a.stage}</span></div>
                  <div className="text-xs text-[var(--ink-soft)]">{a.pitch}</div>
                  <div className="text-xs text-[var(--muted)]">{a.email}{a.team_size ? ` · team of ${a.team_size}` : ''}</div>
                </div>
                <select
                  className="brutal-flat bg-white px-2 py-1 text-xs outline-none"
                  value={a.status}
                  onChange={async (e) => { await updateApplication(a.id, { status: e.target.value }); setApps(await getApplications()) }}
                >
                  {APP_STAGES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-[var(--muted)]">Admitted applicants sign up at <b>/signup</b> with the email they applied with.</p>
        </div>

        {/* Analytics + announcements */}
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="neu p-5">
            <div className="eyebrow mb-4 flex items-center gap-2"><BarChart3 size={14} /> students by stage</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stageData} margin={{ top: 4, right: 8, left: -22, bottom: 0 }}>
                <XAxis dataKey="stage" tick={{ fill: '#6b6b6b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: '#6b6b6b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ border: '2px solid #141414', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {stageData.map((_, i) => <Cell key={i} fill="#4a3dff" />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="brutal p-5">
            <div className="eyebrow mb-3 flex items-center gap-2"><Megaphone size={14} /> announcements</div>
            <form onSubmit={postAnn} className="space-y-2">
              <input className={inputCls} value={annForm.title} onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })} placeholder="Announcement title" />
              <textarea className={inputCls} rows={2} value={annForm.body} onChange={(e) => setAnnForm({ ...annForm, body: e.target.value })} placeholder="Message to all users…" />
              <SkeuoButton type="submit" size="sm" className="w-full">Post announcement</SkeuoButton>
            </form>
            <div className="mt-3 space-y-2">
              {anns.map((a) => (
                <div key={a.id} className="brutal-flat flex items-start justify-between gap-2 p-2 text-xs">
                  <div><b>{a.title}</b><div className="text-[var(--ink-soft)]">{a.body}</div></div>
                  <button onClick={async () => { await deleteAnnouncement(a.id); setAnns(await getAnnouncements()) }} className="text-[var(--muted)] hover:text-[var(--ink)]" aria-label="Delete"><Trash2 size={13} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Users */}
        <div className="brutal mt-6 p-5">
          <div className="eyebrow mb-4">// manage users</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-[var(--ink)] text-left">
                  <th className="pb-2 font-bold uppercase">User</th>
                  <th className="pb-2 font-bold uppercase">Role</th>
                  <th className="pb-2 font-bold uppercase">Progress</th>
                  <th className="pb-2 font-bold uppercase">Mentor</th>
                  <th className="pb-2 font-bold uppercase"></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const p = u.role === 'student' ? progressMap[u.id] : null
                  return (
                    <tr key={u.id} className="border-b border-[var(--neu-dark)]">
                      <td className="py-2">{u.name}<div className="text-xs text-[var(--muted)]">{u.email}</div></td>
                      <td className="py-2">
                        <select className="brutal-flat bg-white px-2 py-1 text-xs outline-none" value={u.role} onChange={async (e) => { await setUserRole(u.id, e.target.value); loadAll() }}>
                          <option value="student">student</option>
                          <option value="mentor">mentor</option>
                          <option value="admin">admin</option>
                        </select>
                      </td>
                      <td className="py-2">{p ? `${p.stage} · ${p.percent}%` : '—'}</td>
                      <td className="py-2">
                        {u.role === 'student' ? (
                          <select className="brutal-flat bg-white px-2 py-1 text-xs outline-none" value={u.mentor_id || ''} onChange={async (e) => { await assignMentor(u.id, e.target.value); loadAll() }}>
                            <option value="">— unassigned —</option>
                            {mentors.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                          </select>
                        ) : '—'}
                      </td>
                      <td className="py-2 text-right">
                        {u.id !== user.id && (
                          <button onClick={async () => { if (confirm(`Delete ${u.name}?`)) { await deleteUser(u.id); loadAll() } }} className="text-[var(--muted)] hover:text-[var(--ink)]" aria-label="Delete user"><Trash2 size={14} /></button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cohorts */}
        <div className="brutal mt-6 p-5">
          <div className="eyebrow mb-4 flex items-center gap-2"><Layers size={14} /> cohorts / batches</div>
          <form onSubmit={createCohort} className="mb-4 flex gap-2">
            <input className={inputCls} value={cohortName} onChange={(e) => setCohortName(e.target.value)} placeholder="New cohort (e.g. Batch 2026)" />
            <SkeuoButton type="submit" size="sm">Create</SkeuoButton>
          </form>
          {cohorts.length === 0 && <p className="text-sm text-[var(--muted)]">No cohorts yet.</p>}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {cohorts.map((c) => (
              <div key={c.id} className="brutal-flat p-3">
                <div className="flex items-center justify-between">
                  <b>{c.name}</b>
                  <button onClick={async () => { await deleteCohort(c.id); loadAll() }} className="text-[var(--muted)] hover:text-[var(--ink)]" aria-label="Delete cohort"><Trash2 size={13} /></button>
                </div>
                <div className="text-xs text-[var(--muted)]">{students.filter((s) => s.cohort_id === c.id).length} students</div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {students.filter((s) => s.cohort_id === c.id).map((s) => (
                    <span key={s.id} className="brutal-flat px-1.5 py-0.5 text-[11px] font-bold">{(s.name || '').split(' ')[0]}</span>
                  ))}
                </div>
                <select className="brutal-flat mt-2 w-full bg-white px-2 py-1 text-xs outline-none" value="" onChange={async (e) => { if (e.target.value) { await setStudentCohort(e.target.value, c.id); loadAll() } }}>
                  <option value="">+ add student…</option>
                  {students.filter((s) => s.cohort_id !== c.id).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* Meetings */}
        <div className="brutal mt-6 p-5">
          <div className="eyebrow mb-3">// all meetings</div>
          {meetings.length === 0 && <p className="text-sm text-[var(--muted)]">No meetings booked.</p>}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {meetings.map((m) => (
              <div key={m.id} className="brutal-flat p-2 text-xs">
                {m.student_name} · {m.date} {m.time} · {m.topic} · <b className="uppercase">{m.status}</b>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
