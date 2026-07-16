import { useState, useEffect, useCallback } from 'react'
import { UserCog, CalendarPlus, TrendingUp, Star, FileSearch, Megaphone, Rocket, Layers } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { getUser, getProgress, saveProgress, getMeetingsFor, addMeeting, getEvals, getAnnouncements, getCohortFor, STAGES } from '../lib/store'
import GlassNav from '../components/GlassNav'
import SkeuoButton from '../components/SkeuoButton'
import TaskList from '../components/dash/TaskList'
import ResourceList from '../components/dash/ResourceList'
import MessageThread from '../components/dash/MessageThread'
import SchemeList from '../components/dash/SchemeList'

const inputCls = 'w-full brutal-flat bg-white px-3 py-2 text-sm outline-none focus:shadow-[3px_3px_0_var(--blue)]'
const statusColor = { requested: '#FFD84D', accepted: '#97C459', declined: '#F09595' }

export default function StudentDashboard() {
  const { user, updateProfile } = useAuth()
  const [mentor, setMentor] = useState(null)
  const [cohort, setCohort] = useState(null)
  const [progress, setProgress] = useState({ stage: 'Idea', percent: 10, note: '' })
  const [meetings, setMeetings] = useState([])
  const [evals, setEvals] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [meetForm, setMeetForm] = useState({ date: '', time: '', topic: '' })
  const [profile, setProfile] = useState({ startup: user.startup || '', tagline: user.tagline || '', website: user.website || '' })
  const [saved, setSaved] = useState(false)

  const loadMeetings = useCallback(async () => setMeetings(await getMeetingsFor(user.id, 'student')), [user.id])

  useEffect(() => {
    ;(async () => {
      const [m, c, p, ev, an] = await Promise.all([
        getUser(user.mentor_id),
        getCohortFor(user.cohort_id),
        getProgress(user.id),
        getEvals(user.id),
        getAnnouncements(),
      ])
      setMentor(m)
      setCohort(c)
      setProgress({ stage: p.stage, percent: p.percent, note: p.note ?? '', updated_at: p.updated_at })
      setEvals(ev)
      setAnnouncements(an)
      loadMeetings()
    })()
  }, [user.id, user.mentor_id, user.cohort_id, loadMeetings])

  async function saveProg(e) {
    e.preventDefault()
    const row = await saveProgress(user.id, progress)
    setProgress({ ...progress, updated_at: row.updated_at })
  }
  async function book(e) {
    e.preventDefault()
    await addMeeting({ studentId: user.id, mentorId: user.mentor_id, studentName: user.name, ...meetForm })
    setMeetForm({ date: '', time: '', topic: '' })
    loadMeetings()
  }
  async function saveProfile(e) {
    e.preventDefault()
    await updateProfile(profile)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  return (
    <div className="min-h-screen">
      <GlassNav />
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="eyebrow text-[var(--ink-soft)]">// student dashboard</div>
        <h1 className="display mt-2 text-3xl sm:text-4xl">Hi, {(user.name || 'there').split(' ')[0]}.</h1>
        <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-[var(--ink-soft)]">
          <span>{user.startup ? `Working on ${user.startup}` : 'Track your startup journey with your mentor.'}</span>
          {cohort && (
            <span className="brutal-flat inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold uppercase" style={{ background: 'var(--blue)', color: '#fff' }}>
              <Layers size={12} /> {cohort.name}
            </span>
          )}
        </div>

        {announcements.length > 0 && (
          <div className="brutal mt-6 p-4" style={{ background: 'var(--yellow)' }}>
            <div className="eyebrow mb-1 flex items-center gap-2"><Megaphone size={14} /> announcement</div>
            <div className="font-display font-bold">{announcements[0].title}</div>
            <p className="text-sm text-[var(--ink-soft)]">{announcements[0].body}</p>
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="brutal p-5">
            <div className="eyebrow mb-3 flex items-center gap-2"><UserCog size={14} /> your mentor</div>
            {mentor ? (
              <>
                <div className="font-display text-xl font-bold">{mentor.name}</div>
                <div className="text-sm text-[var(--ink-soft)]">{mentor.expertise}</div>
                <div className="mt-1 text-xs text-[var(--muted)]">{mentor.email}</div>
              </>
            ) : (
              <p className="text-sm text-[var(--ink-soft)]">No mentor assigned yet. An admin will assign one.</p>
            )}
          </div>

          <div className="brutal p-5" style={{ background: 'var(--blue)', color: '#fff' }}>
            <div className="eyebrow mb-3 flex items-center gap-2" style={{ color: '#fff' }}><FileSearch size={14} /> idea validation</div>
            <p className="text-sm text-white/85">Run your idea through the 10-agent pipeline and get an investor-ready report.</p>
            <SkeuoButton to="/validate" size="sm" variant="light" className="mt-4">Validate an idea</SkeuoButton>
          </div>
        </div>

        <form onSubmit={saveProfile} className="brutal mt-6 p-5">
          <div className="eyebrow mb-3 flex items-center gap-2"><Rocket size={14} /> startup profile · shown on the public showcase</div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <input className={inputCls} value={profile.startup} onChange={(e) => setProfile({ ...profile, startup: e.target.value })} placeholder="Startup name" />
            <input className={inputCls} value={profile.tagline} onChange={(e) => setProfile({ ...profile, tagline: e.target.value })} placeholder="One-line tagline" />
            <input className={inputCls} value={profile.website} onChange={(e) => setProfile({ ...profile, website: e.target.value })} placeholder="Website (optional)" />
          </div>
          <div className="mt-3 flex items-center gap-3">
            <SkeuoButton type="submit" size="sm">Save profile</SkeuoButton>
            {saved && <span className="text-xs font-bold text-[var(--blue)]">Saved</span>}
          </div>
        </form>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <form onSubmit={saveProg} className="brutal p-5">
            <div className="eyebrow mb-3 flex items-center gap-2"><TrendingUp size={14} /> update startup progress</div>
            <label className="eyebrow mb-1 block text-[var(--muted)]">Stage</label>
            <select className={inputCls} value={progress.stage} onChange={(e) => setProgress({ ...progress, stage: e.target.value })}>
              {STAGES.map((s) => <option key={s}>{s}</option>)}
            </select>
            <label className="eyebrow mb-1 mt-3 block text-[var(--muted)]">Completion: {progress.percent}%</label>
            <input type="range" min="0" max="100" value={progress.percent} onChange={(e) => setProgress({ ...progress, percent: Number(e.target.value) })} className="w-full" />
            <div className="neu-track mt-1 h-2"><div className="bar-fill" style={{ width: `${progress.percent}%` }} /></div>
            <label className="eyebrow mb-1 mt-3 block text-[var(--muted)]">This week's update</label>
            <textarea className={inputCls} rows={2} value={progress.note} onChange={(e) => setProgress({ ...progress, note: e.target.value })} placeholder="What did you ship this week?" />
            <SkeuoButton type="submit" size="sm" className="mt-3 w-full">Save progress</SkeuoButton>
            {progress.updated_at && <p className="mt-2 text-xs text-[var(--muted)]">Last saved {new Date(progress.updated_at).toLocaleString()}</p>}
          </form>

          <div className="brutal p-5">
            <div className="eyebrow mb-3 flex items-center gap-2"><CalendarPlus size={14} /> book a mentor meeting</div>
            <form onSubmit={book} className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input className={inputCls} type="date" value={meetForm.date} onChange={(e) => setMeetForm({ ...meetForm, date: e.target.value })} required />
                <input className={inputCls} type="time" value={meetForm.time} onChange={(e) => setMeetForm({ ...meetForm, time: e.target.value })} required />
              </div>
              <input className={inputCls} value={meetForm.topic} onChange={(e) => setMeetForm({ ...meetForm, topic: e.target.value })} required placeholder="Topic (e.g. fundraising strategy)" />
              <SkeuoButton type="submit" size="sm" className="w-full">Request meeting</SkeuoButton>
            </form>
            <div className="mt-4 space-y-2">
              {meetings.length === 0 && <p className="text-xs text-[var(--muted)]">No meetings yet.</p>}
              {meetings.map((m) => (
                <div key={m.id} className="brutal-flat flex items-center justify-between p-2 text-xs">
                  <span>{m.date} {m.time} · {m.topic}</span>
                  <span className="brutal-flat px-2 py-0.5 font-bold uppercase" style={{ background: statusColor[m.status] }}>{m.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="brutal p-5"><TaskList studentId={user.id} mentorId={user.mentor_id} canAssign={false} /></div>
          <div className="brutal p-5"><ResourceList studentId={user.id} canAdd={false} /></div>
          <div className="brutal p-5"><MessageThread studentId={user.id} role="student" senderId={user.id} senderName={user.name} /></div>
        </div>

        <div className="brutal mt-6 p-5">
          <SchemeList stage={progress.stage} />
        </div>

        <div className="brutal mt-6 p-5">
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
                  <p className="mt-1 text-sm text-[var(--ink-soft)]">{ev.feedback}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
