import { getAnnouncements, getEvents, getEvals, getMeetingsFor, getTasks, getApplications } from './store'

/** Builds a per-user notification feed from live Supabase data. */
export async function getNotifications(user) {
  const n = []
  const push = (id, at, text, link) => n.push({ id, at: new Date(at).getTime(), text, link })

  if (user.role === 'student') {
    const [anns, evals, meetings, tasks, events] = await Promise.all([
      getAnnouncements(), getEvals(user.id), getMeetingsFor(user.id, 'student'), getTasks(user.id), getEvents(),
    ])
    anns.forEach((a) => push('an' + a.id, a.created_at, `Announcement: ${a.title}`, '/student'))
    evals.forEach((e) => push('ev' + e.id, e.created_at, `New evaluation: ${e.score}/10`, '/student'))
    meetings.filter((m) => m.status !== 'requested').forEach((m) => push('mt' + m.id, m.created_at, `Meeting ${m.status}: ${m.topic}`, '/student'))
    tasks.forEach((t) => push('tk' + t.id, t.created_at, `New task: ${t.title}`, '/student'))
    events.forEach((e) => push('e' + e.id, e.created_at, `Event: ${e.title}`, '/events'))
  } else if (user.role === 'mentor') {
    const meetings = await getMeetingsFor(user.id, 'mentor')
    meetings.filter((m) => m.status === 'requested').forEach((m) => push('mt' + m.id, m.created_at, `Meeting request from ${m.student_name}`, '/mentor'))
  } else if (user.role === 'admin') {
    const [apps, events] = await Promise.all([getApplications(), getEvents()])
    apps.filter((a) => a.status === 'Applied').forEach((a) => push('ap' + a.id, a.created_at, `New application: ${a.startup}`, '/admin/dashboard'))
    events.forEach((e) => push('e' + e.id, e.created_at, `Event: ${e.title}`, '/events'))
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

/* Read-state stays local — it's per-device UI state, not shared data. */
export function getLastSeen(userId) {
  return Number(localStorage.getItem(`sivpLastSeen:${userId}`) || 0)
}
export function setLastSeen(userId) {
  localStorage.setItem(`sivpLastSeen:${userId}`, String(Date.now()))
}
