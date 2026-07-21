import { useState, useEffect, useCallback } from 'react'
import { UserCog, CalendarPlus, Mail as MailIcon } from 'lucide-react'
import { useAuth } from '../../lib/auth'
import { getUser, getMeetingsFor, addMeeting } from '../../lib/store'
import PageHead from '../../components/dash/PageHead'
import SkeuoButton from '../../components/SkeuoButton'
import MessageThread from '../../components/dash/MessageThread'

const inputCls = 'w-full brutal-flat bg-white px-3 py-2 text-sm outline-none focus:shadow-[3px_3px_0_var(--blue)]'
const statusColor = { requested: '#FFD84D', accepted: '#97C459', declined: '#F09595' }

export default function Contact() {
  const { user } = useAuth()
  const [mentor, setMentor] = useState(null)
  const [meetings, setMeetings] = useState([])
  const [form, setForm] = useState({ date: '', time: '', topic: '' })

  const loadMeetings = useCallback(async () => setMeetings(await getMeetingsFor(user.id, 'student')), [user.id])

  useEffect(() => {
    getUser(user.mentor_id).then(setMentor)
    loadMeetings()
  }, [user.mentor_id, loadMeetings])

  async function book(e) {
    e.preventDefault()
    await addMeeting({ studentId: user.id, mentorId: user.mentor_id, studentName: user.name, ...form })
    setForm({ date: '', time: '', topic: '' })
    loadMeetings()
  }

  return (
    <div>
      <PageHead eyebrow="contact" title="Your mentor">
        Reach your mentor, schedule meetings, and keep the conversation in one place.
      </PageHead>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="brutal p-5">
          <div className="eyebrow mb-3 flex items-center gap-2"><UserCog size={14} /> mentor</div>
          {mentor ? (
            <>
              <div className="font-display text-xl font-bold">{mentor.name}</div>
              <div className="text-sm text-[var(--ink-soft)]">{mentor.expertise}</div>
              <a href={`mailto:${mentor.email}`} className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[var(--blue)]">
                <MailIcon size={13} /> {mentor.email}
              </a>
              {mentor.phone && <div className="mt-1 text-sm text-[var(--ink-soft)]">{mentor.phone}</div>}
            </>
          ) : (
            <p className="text-sm text-[var(--ink-soft)]">No mentor assigned yet. An admin will assign one.</p>
          )}

          <div className="mt-5 eyebrow mb-2 flex items-center gap-2"><CalendarPlus size={14} /> book a meeting</div>
          <form onSubmit={book} className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <input className={inputCls} type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
              <input className={inputCls} type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} required />
            </div>
            <input className={inputCls} value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} required placeholder="Topic (e.g. fundraising strategy)" />
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

        <div className="brutal p-5">
          <MessageThread studentId={user.id} role="student" senderId={user.id} senderName={user.name} />
        </div>
      </div>
    </div>
  )
}
