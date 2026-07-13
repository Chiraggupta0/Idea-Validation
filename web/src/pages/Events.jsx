import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, MapPin, Users, Trash2, Check } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { getEvents, addEvent, deleteEvent, toggleRsvp, EVENT_TYPES } from '../lib/store'
import GlassNav from '../components/GlassNav'
import Footer from '../components/Footer'
import SkeuoButton from '../components/SkeuoButton'

const inputCls = 'w-full brutal-flat bg-white px-3 py-2 text-sm outline-none focus:shadow-[3px_3px_0_var(--blue)]'
const typeColor = { 'Demo Day': '#4A3DFF', 'Pitch Night': '#FFD84D', Workshop: '#97C459', 'Guest Talk': '#67E8F9', Deadline: '#F09595' }

export default function Events() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [events, setEvents] = useState(() => getEvents())
  const [form, setForm] = useState({ title: '', date: '', time: '', type: 'Workshop', location: '', description: '' })
  const refresh = () => setEvents(getEvents())

  function create(e) {
    e.preventDefault()
    addEvent(form)
    refresh()
    setForm({ title: '', date: '', time: '', type: 'Workshop', location: '', description: '' })
  }
  function rsvp(id) {
    if (!user) return
    toggleRsvp(id, user.id)
    refresh()
  }

  return (
    <div className="min-h-screen">
      <GlassNav />
      <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
        <div className="eyebrow text-[var(--ink-soft)]">// what's on</div>
        <h1 className="display mt-3 text-4xl sm:text-5xl">Events & workshops.</h1>
        <p className="mt-3 text-sm text-[var(--ink-soft)]">Demo days, pitch nights, workshops and guest talks at the incubator.</p>

        {isAdmin && (
          <form onSubmit={create} className="brutal mt-8 space-y-3 p-5">
            <div className="eyebrow">// create event (admin)</div>
            <input className={inputCls} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder="Event title" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <input className={inputCls} type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
              <input className={inputCls} type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} required />
              <select className={inputCls} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>{EVENT_TYPES.map((t) => <option key={t}>{t}</option>)}</select>
              <input className={inputCls} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Location" />
            </div>
            <textarea className={inputCls} rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" />
            <SkeuoButton type="submit" size="sm">Publish event</SkeuoButton>
          </form>
        )}

        <div className="mt-8 space-y-4">
          {events.length === 0 && <div className="brutal p-6 text-center text-sm text-[var(--ink-soft)]">No events scheduled yet.</div>}
          {events.map((ev) => {
            const going = user && (ev.rsvps || []).includes(user.id)
            return (
              <div key={ev.id} className="brutal p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <span className="brutal-flat px-2 py-0.5 text-xs font-bold uppercase" style={{ background: typeColor[ev.type] || 'var(--yellow)' }}>{ev.type}</span>
                    <div className="mt-2 font-display text-xl font-bold">{ev.title}</div>
                    <div className="mt-1 flex flex-wrap gap-4 text-xs text-[var(--ink-soft)]">
                      <span className="flex items-center gap-1"><CalendarDays size={13} /> {ev.date} {ev.time}</span>
                      {ev.location && <span className="flex items-center gap-1"><MapPin size={13} /> {ev.location}</span>}
                      <span className="flex items-center gap-1"><Users size={13} /> {(ev.rsvps || []).length} going</span>
                    </div>
                    {ev.description && <p className="mt-2 text-sm text-[var(--ink-soft)]">{ev.description}</p>}
                  </div>
                  <div className="flex flex-col gap-2">
                    {user ? (
                      <button onClick={() => rsvp(ev.id)} className={going ? 'btn btn-primary btn-sm' : 'btn btn-light btn-sm'}>
                        {going ? <><Check size={13} /> Going</> : 'RSVP'}
                      </button>
                    ) : (
                      <Link to="/login" className="btn btn-light btn-sm">Log in to RSVP</Link>
                    )}
                    {isAdmin && <button onClick={() => { deleteEvent(ev.id); refresh() }} className="btn btn-light btn-sm"><Trash2 size={13} /></button>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>
      <Footer />
    </div>
  )
}
