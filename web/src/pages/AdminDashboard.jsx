import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, GraduationCap, UserCog, CalendarDays } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { getUsers, getMentors, assignMentor, getMeetings, getProgress } from '../lib/store'
import GlassNav from '../components/GlassNav'

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
  const [users, setUsers] = useState(() => getUsers())
  const mentors = getMentors()
  const students = users.filter((u) => u.role === 'student')
  const meetings = getMeetings()

  function assign(studentId, mentorId) {
    assignMentor(studentId, mentorId)
    setUsers(getUsers())
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

        {/* Students + mentor assignment */}
        <div className="brutal mt-8 p-5">
          <div className="eyebrow mb-4">// students · assign mentors</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-[var(--ink)] text-left">
                  <th className="pb-2 font-bold uppercase">Student</th>
                  <th className="pb-2 font-bold uppercase">Startup</th>
                  <th className="pb-2 font-bold uppercase">Progress</th>
                  <th className="pb-2 font-bold uppercase">Mentor</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => {
                  const p = getProgress(s.id)
                  return (
                    <tr key={s.id} className="border-b border-[var(--neu-dark)]">
                      <td className="py-2">{s.name}<div className="text-xs text-[var(--muted)]">{s.email}</div></td>
                      <td className="py-2">{s.startup || '—'}</td>
                      <td className="py-2">{p.stage} · {p.percent}%</td>
                      <td className="py-2">
                        <select
                          className="brutal-flat bg-white px-2 py-1 text-xs outline-none"
                          value={s.mentorId || ''}
                          onChange={(e) => assign(s.id, e.target.value)}
                        >
                          <option value="">— unassigned —</option>
                          {mentors.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </select>
                      </td>
                    </tr>
                  )
                })}
                {students.length === 0 && <tr><td colSpan={4} className="py-3 text-[var(--muted)]">No students yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mentors + meetings */}
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="brutal p-5">
            <div className="eyebrow mb-3">// mentors</div>
            {mentors.map((m) => (
              <div key={m.id} className="brutal-flat mb-2 p-3 text-sm">
                <b>{m.name}</b> · {m.expertise}
                <div className="text-xs text-[var(--muted)]">{students.filter((s) => s.mentorId === m.id).length} mentees · {m.email}</div>
              </div>
            ))}
          </div>
          <div className="brutal p-5">
            <div className="eyebrow mb-3">// all meetings</div>
            {meetings.length === 0 && <p className="text-sm text-[var(--muted)]">No meetings booked.</p>}
            {meetings.map((m) => (
              <div key={m.id} className="brutal-flat mb-2 p-2 text-xs">
                {m.studentName} · {m.date} {m.time} · {m.topic} · <b className="uppercase">{m.status}</b>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-8 text-xs text-[var(--muted)]">
          <Link to="/login" className="underline">switch account</Link>
        </p>
      </section>
    </div>
  )
}
