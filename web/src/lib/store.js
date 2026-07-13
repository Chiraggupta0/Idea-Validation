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
