import { loadUsers } from './auth'

const MEETINGS = 'sivpMeetings'
const PROGRESS = 'sivpProgress'
const EVALS = 'sivpEvals'

function load(key, def) {
  const r = localStorage.getItem(key)
  return r ? JSON.parse(r) : def
}
function save(key, val) {
  localStorage.setItem(key, JSON.stringify(val))
}

/* ---------- users ---------- */
export function getUsers() {
  return loadUsers()
}
export function getUser(id) {
  return loadUsers().find((u) => u.id === id)
}
export function getStudentsForMentor(mentorId) {
  return loadUsers().filter((u) => u.role === 'student' && u.mentorId === mentorId)
}
export function getMentors() {
  return loadUsers().filter((u) => u.role === 'mentor')
}
export function assignMentor(studentId, mentorId) {
  const users = loadUsers().map((u) => (u.id === studentId ? { ...u, mentorId } : u))
  localStorage.setItem('sivpUsers', JSON.stringify(users))
  return users
}

/* ---------- meetings ---------- */
export function getMeetings() {
  return load(MEETINGS, [])
}
export function getMeetingsFor(userId, role) {
  const key = role === 'mentor' ? 'mentorId' : 'studentId'
  return getMeetings().filter((m) => m[key] === userId)
}
export function addMeeting(m) {
  const all = getMeetings()
  all.push({ id: Date.now(), status: 'requested', ...m })
  save(MEETINGS, all)
  return all
}
export function updateMeeting(id, patch) {
  const all = getMeetings().map((m) => (m.id === id ? { ...m, ...patch } : m))
  save(MEETINGS, all)
  return all
}

/* ---------- progress ---------- */
const DEFAULT_PROGRESS = { stage: 'Idea', percent: 10, note: '', updatedAt: null }
export function getProgress(studentId) {
  return load(PROGRESS, {})[studentId] || DEFAULT_PROGRESS
}
export function saveProgress(studentId, data) {
  const all = load(PROGRESS, {})
  all[studentId] = { ...data, updatedAt: new Date().toISOString() }
  save(PROGRESS, all)
  return all[studentId]
}

/* ---------- evaluations ---------- */
export function getEvals(studentId) {
  return load(EVALS, {})[studentId] || []
}
export function addEval(studentId, ev) {
  const all = load(EVALS, {})
  all[studentId] = [{ id: Date.now(), date: new Date().toISOString(), ...ev }, ...(all[studentId] || [])]
  save(EVALS, all)
  return all[studentId]
}

export const STAGES = ['Idea', 'Validation', 'MVP', 'Launch', 'Growth', 'Fundraising']

/* ---------- tasks / action items ---------- */
const TASKS = 'sivpTasks'
export function getTasks(studentId) {
  return load(TASKS, []).filter((t) => t.studentId === studentId)
}
export function addTask(t) {
  const a = load(TASKS, [])
  a.push({ id: Date.now(), done: false, createdAt: new Date().toISOString(), ...t })
  save(TASKS, a)
}
export function toggleTask(id) {
  save(TASKS, load(TASKS, []).map((t) => (t.id === id ? { ...t, done: !t.done } : t)))
}
export function deleteTask(id) {
  save(TASKS, load(TASKS, []).filter((t) => t.id !== id))
}

/* ---------- messages (student <-> mentor thread) ---------- */
const MESSAGES = 'sivpMessages'
export function getThread(studentId) {
  return load(MESSAGES, []).filter((m) => m.studentId === studentId).sort((a, b) => a.at - b.at)
}
export function sendMessage(m) {
  const a = load(MESSAGES, [])
  a.push({ id: Date.now(), at: Date.now(), ...m })
  save(MESSAGES, a)
}

/* ---------- shared resources ---------- */
const RESOURCES = 'sivpResources'
export function getResources(studentId) {
  return load(RESOURCES, []).filter((r) => r.studentId === studentId)
}
export function addResource(r) {
  const a = load(RESOURCES, [])
  a.push({ id: Date.now(), ...r })
  save(RESOURCES, a)
}
export function deleteResource(id) {
  save(RESOURCES, load(RESOURCES, []).filter((r) => r.id !== id))
}

/* ---------- announcements (admin broadcast) ---------- */
const ANN = 'sivpAnnouncements'
export function getAnnouncements() {
  return load(ANN, []).sort((a, b) => b.at - a.at)
}
export function addAnnouncement(a2) {
  const a = load(ANN, [])
  a.push({ id: Date.now(), at: Date.now(), ...a2 })
  save(ANN, a)
}
export function deleteAnnouncement(id) {
  save(ANN, load(ANN, []).filter((x) => x.id !== id))
}

/* ---------- applications (intake portal) ---------- */
const APPS = 'sivpApplications'
export const APP_STAGES = ['Applied', 'Shortlisted', 'Interview', 'Admitted', 'Rejected']
export function getApplications() {
  return load(APPS, []).sort((a, b) => b.at - a.at)
}
export function addApplication(a) {
  const all = load(APPS, [])
  all.push({ id: Date.now(), at: Date.now(), status: 'Applied', ...a })
  save(APPS, all)
}
export function updateApplication(id, patch) {
  save(APPS, load(APPS, []).map((x) => (x.id === id ? { ...x, ...patch } : x)))
}
/** Admit an applicant → create a student account (default password: welcome123). */
export function admitApplicant(app) {
  const users = loadUsers()
  if (!users.find((u) => u.email === app.email)) {
    const mentor = users.find((u) => u.role === 'mentor')
    users.push({ id: 's' + Date.now(), name: app.name, email: app.email, password: 'welcome123', role: 'student', startup: app.startup, tagline: app.pitch, mentorId: mentor ? mentor.id : undefined })
    localStorage.setItem('sivpUsers', JSON.stringify(users))
  }
  updateApplication(app.id, { status: 'Admitted' })
}

/* ---------- events & workshops ---------- */
const EVENTS = 'sivpEvents'
export function getEvents() {
  return load(EVENTS, []).sort((a, b) => (a.date < b.date ? -1 : 1))
}
export function addEvent(e) {
  const all = load(EVENTS, [])
  all.push({ id: Date.now(), rsvps: [], ...e })
  save(EVENTS, all)
}
export function deleteEvent(id) {
  save(EVENTS, load(EVENTS, []).filter((e) => e.id !== id))
}
export function toggleRsvp(id, userId) {
  save(EVENTS, load(EVENTS, []).map((e) => {
    if (e.id !== id) return e
    const has = (e.rsvps || []).includes(userId)
    return { ...e, rsvps: has ? e.rsvps.filter((u) => u !== userId) : [...(e.rsvps || []), userId] }
  }))
}
export const EVENT_TYPES = ['Workshop', 'Demo Day', 'Pitch Night', 'Guest Talk', 'Deadline']

/* ---------- admin user management ---------- */
export function deleteUser(id) {
  const u = loadUsers().filter((x) => x.id !== id)
  localStorage.setItem('sivpUsers', JSON.stringify(u))
  return u
}
export function setUserRole(id, role) {
  const u = loadUsers().map((x) => (x.id === id ? { ...x, role } : x))
  localStorage.setItem('sivpUsers', JSON.stringify(u))
  return u
}
