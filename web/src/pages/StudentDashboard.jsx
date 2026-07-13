import { useState } from 'react'
import { Link } from 'react-router-dom'
import { UserCog, CalendarPlus, TrendingUp, Star, FileSearch } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { getUser, getProgress, saveProgress, getMeetingsFor, addMeeting, getEvals, STAGES } from '../lib/store'
import GlassNav from '../components/GlassNav'
import SkeuoButton from '../components/SkeuoButton'

const inputCls = 'w-full brutal-flat bg-white px-3 py-2 text-sm outline-none focus:shadow-[3px_3px_0_var(--blue)]'
const statusColor = { requested: '#FFD84D', accepted: '#97C459', declined: '#F09595' }

export default function StudentDashboard() {
  const { user } = useAuth()
  const mentor = user.mentorId ? getUser(user.mentorId) : null

  const [progress, setProgress] = useState(() => getProgress(user.id))
  const [meetings, setMeetings] = useState(() => getMeetingsFor(user.id, 'student'))
  const [meetForm, setMeetForm] = useState({ date: '', time: '', topic: '' })
  const evals = getEvals(user.id)

  function saveProg(e) {
    e.preventDefault()
    saveProgress(user.id, progress)
    setProgress(getProgress(user.id))
  }
  function book(e) {
    e.preventDefault()
    addMeeting({ studentId: user.id, mentorId: user.mentorId, studentName: user.name, ...meetForm })
    setMeetings(getMeetingsFor(user.id, 'student'))
    setMeetForm({ date: '', time: '', topic: '' })
  }

  return (
    <div className="min-h-screen">
      <GlassNav />
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="eyebrow text-[var(--ink-soft)]">// student dashboard</div>
        <h1 className="display mt-2 text-3xl sm:text-4xl">Hi, {user.name.split(' ')[0]}.</h1>
        <p className="mt-1 text-sm text-[var(--ink-soft)]">
          {user.startup ? `Working on ${user.startup}` : 'Track your startup journey with your mentor.'}
        </p>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Mentor */}
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

          {/* Validate idea */}
          <div className="brutal p-5" style={{ background: 'var(--blue)', color: '#fff' }}>
            <div className="eyebrow mb-3 flex items-center gap-2" style={{ color: '#fff' }}><FileSearch size={14} /> idea validation</div>
            <p className="text-sm text-white/85">Run your idea through the 10-agent pipeline and get an investor-ready report.</p>
            <SkeuoButton to="/validate" size="sm" variant="light" className="mt-4">Validate an idea</SkeuoButton>
          </div>
        </div>

        {/* Progress */}
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
            {progress.updatedAt && <p className="mt-2 text-xs text-[var(--muted)]">Last saved {new Date(progress.updatedAt).toLocaleString()}</p>}
          </form>

          {/* Book meeting */}
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

        {/* Evaluations */}
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
                    <span className="text-xs text-[var(--muted)]">{new Date(ev.date).toLocaleDateString()}</span>
                  </div>
                  <p className="mt-1 text-sm text-[var(--ink-soft)]">{ev.feedback}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="mt-8 text-xs text-[var(--muted)]">
          Not you? <Link to="/login" className="underline">switch account</Link>
        </p>
      </section>
    </div>
  )
}
