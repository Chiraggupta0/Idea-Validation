import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, CalendarCheck, ClipboardCheck, Settings2, TrendingUp, Star } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { getStudentsForMentor, getProgress, getMeetingsFor, updateMeeting, addEval, getEvals } from '../lib/store'
import GlassNav from '../components/GlassNav'
import SkeuoButton from '../components/SkeuoButton'
import TaskList from '../components/dash/TaskList'
import ResourceList from '../components/dash/ResourceList'
import MessageThread from '../components/dash/MessageThread'

const inputCls = 'w-full brutal-flat bg-white px-3 py-2 text-sm outline-none focus:shadow-[3px_3px_0_var(--blue)]'
const statusColor = { requested: '#FFD84D', accepted: '#97C459', declined: '#F09595' }

function MenteeCard({ student, mentorName, mentorId }) {
  const progress = getProgress(student.id)
  const [evals, setEvals] = useState(() => getEvals(student.id))
  const [form, setForm] = useState({ score: 7, feedback: '' })
  const [tools, setTools] = useState(false)

  function evaluate(e) {
    e.preventDefault()
    addEval(student.id, { by: mentorName, score: Number(form.score), feedback: form.feedback })
    setEvals(getEvals(student.id))
    setForm({ score: 7, feedback: '' })
  }

  return (
    <div className="brutal p-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-display text-lg font-bold">{student.name}</div>
          <div className="text-xs text-[var(--muted)]">{student.startup || 'No startup name'} · {student.email}</div>
        </div>
        <span className="brutal-flat px-2 py-1 text-xs font-bold uppercase" style={{ background: 'var(--yellow)' }}>{progress.stage}</span>
      </div>

      <div className="mt-3">
        <div className="flex justify-between text-xs"><span className="font-medium">Progress</span><span>{progress.percent}%</span></div>
        <div className="neu-track mt-1 h-2"><div className="bar-fill" style={{ width: `${progress.percent}%` }} /></div>
        {progress.note && <p className="mt-2 text-xs text-[var(--ink-soft)]">"{progress.note}"</p>}
      </div>

      <form onSubmit={evaluate} className="mt-4 border-t-2 border-[var(--ink)] pt-3">
        <div className="eyebrow mb-2">// evaluate</div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium">Score</label>
          <input type="number" min="0" max="10" className="brutal-flat w-16 bg-white px-2 py-1 text-sm outline-none" value={form.score} onChange={(e) => setForm({ ...form, score: e.target.value })} />
          <span className="text-xs text-[var(--muted)]">/ 10</span>
        </div>
        <textarea className={`${inputCls} mt-2`} rows={2} value={form.feedback} onChange={(e) => setForm({ ...form, feedback: e.target.value })} required placeholder="Feedback for this mentee…" />
        <SkeuoButton type="submit" size="sm" className="mt-2 w-full">Submit evaluation</SkeuoButton>
      </form>

      {evals.length > 0 && (
        <div className="mt-3 space-y-2">
          {evals.slice(0, 2).map((ev) => (
            <div key={ev.id} className="brutal-flat p-2 text-xs"><b>{ev.score}/10</b> — {ev.feedback}</div>
          ))}
        </div>
      )}

      <button onClick={() => setTools((v) => !v)} className="btn btn-light btn-sm mt-3 w-full">
        <Settings2 size={13} /> {tools ? 'Hide tools' : 'Tasks · resources · messages'}
      </button>
      {tools && (
        <div className="mt-4 space-y-5 border-t-2 border-[var(--ink)] pt-4">
          <TaskList studentId={student.id} mentorId={mentorId} canAssign />
          <ResourceList studentId={student.id} canAdd />
          <MessageThread studentId={student.id} role="mentor" senderName={mentorName} />
        </div>
      )}
    </div>
  )
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="neu-sm p-4">
      <div className="flex items-center gap-2 text-[var(--muted)]"><Icon size={14} /><span className="text-xs font-medium">{label}</span></div>
      <div className="mt-1 font-display text-2xl font-bold">{value}</div>
    </div>
  )
}

export default function MentorDashboard() {
  const { user } = useAuth()
  const mentees = getStudentsForMentor(user.id)
  const [meetings, setMeetings] = useState(() => getMeetingsFor(user.id, 'mentor'))

  function respond(id, status) {
    updateMeeting(id, { status })
    setMeetings(getMeetingsFor(user.id, 'mentor'))
  }

  const avgProgress = mentees.length
    ? Math.round(mentees.reduce((s, m) => s + getProgress(m.id).percent, 0) / mentees.length)
    : 0
  const pending = meetings.filter((m) => m.status === 'requested').length
  const evalsGiven = mentees.reduce((s, m) => s + getEvals(m.id).length, 0)

  return (
    <div className="min-h-screen">
      <GlassNav />
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="eyebrow text-[var(--ink-soft)]">// mentor dashboard</div>
        <h1 className="display mt-2 text-3xl sm:text-4xl">Hi, {user.name.split(' ')[0]}.</h1>
        <p className="mt-1 text-sm text-[var(--ink-soft)]">{user.expertise}</p>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat icon={Users} label="Mentees" value={mentees.length} />
          <Stat icon={TrendingUp} label="Avg progress" value={`${avgProgress}%`} />
          <Stat icon={CalendarCheck} label="Pending requests" value={pending} />
          <Stat icon={Star} label="Evaluations" value={evalsGiven} />
        </div>

        <div className="brutal mt-6 p-5">
          <div className="eyebrow mb-3 flex items-center gap-2"><CalendarCheck size={14} /> meeting requests</div>
          {meetings.length === 0 && <p className="text-sm text-[var(--ink-soft)]">No meeting requests.</p>}
          <div className="space-y-2">
            {meetings.map((m) => (
              <div key={m.id} className="brutal-flat flex flex-wrap items-center justify-between gap-2 p-3 text-sm">
                <span><b>{m.studentName}</b> · {m.date} {m.time} · {m.topic}</span>
                {m.status === 'requested' ? (
                  <span className="flex gap-2">
                    <button onClick={() => respond(m.id, 'accepted')} className="btn btn-light btn-sm">Accept</button>
                    <button onClick={() => respond(m.id, 'declined')} className="btn btn-light btn-sm">Decline</button>
                  </span>
                ) : (
                  <span className="brutal-flat px-2 py-0.5 text-xs font-bold uppercase" style={{ background: statusColor[m.status] }}>{m.status}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex items-center gap-2">
          <Users size={16} /><h2 className="font-display text-xl font-bold uppercase">Your mentees</h2>
        </div>
        {mentees.length === 0 ? (
          <div className="brutal mt-3 flex items-center gap-2 p-5 text-sm text-[var(--ink-soft)]">
            <ClipboardCheck size={15} /> No mentees assigned yet. An admin assigns students to you.
          </div>
        ) : (
          <div className="mt-3 grid grid-cols-1 gap-6 md:grid-cols-2">
            {mentees.map((s) => <MenteeCard key={s.id} student={s} mentorName={user.name} mentorId={user.id} />)}
          </div>
        )}

        <p className="mt-8 text-xs text-[var(--muted)]">
          Not you? <Link to="/login" className="underline">switch account</Link>
        </p>
      </section>
    </div>
  )
}
