import { getAnnouncements, getEvents, getEvals, getMeetingsFor, getTasks, getApplications } from './store'

/** Derives a per-user notification feed from existing data (no separate storage). */
export function getNotifications(user) {
  const n = []
  const push = (id, at, text, link) => n.push({ id, at, text, link })

  if (user.role === 'student') {
    getAnnouncements().forEach((a) => push('an' + a.id, a.at, `Announcement: ${a.title}`, '/student'))
    getEvals(user.id).forEach((e) => push('ev' + e.id, new Date(e.date).getTime(), `New evaluation: ${e.score}/10`, '/student'))
    getMeetingsFor(user.id, 'student').filter((m) => m.status !== 'requested').forEach((m) => push('mt' + m.id, m.id, `Meeting ${m.status}: ${m.topic}`, '/student'))
    getTasks(user.id).forEach((t) => push('tk' + t.id, new Date(t.createdAt).getTime(), `New task: ${t.title}`, '/student'))
    getEvents().forEach((e) => push('e' + e.id, e.at || e.id, `Event: ${e.title}`, '/events'))
  } else if (user.role === 'mentor') {
    getMeetingsFor(user.id, 'mentor').filter((m) => m.status === 'requested').forEach((m) => push('mt' + m.id, m.id, `Meeting request from ${m.studentName}`, '/mentor'))
  } else if (user.role === 'admin') {
    getApplications().filter((a) => a.status === 'Applied').forEach((a) => push('ap' + a.id, a.at, `New application: ${a.startup}`, '/admin/dashboard'))
    getEvents().forEach((e) => push('e' + e.id, e.at || e.id, `Event: ${e.title}`, '/events'))
  }
  return n.sort((a, b) => b.at - a.at).slice(0, 20)
}

export function timeAgo(at) {
  const s = Math.floor((Date.now() - at) / 1000)
  if (s < 60) return 'just now'
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}
