import { supabase } from './supabase'

/* All functions are async and hit Supabase (Postgres). Row Level Security
   enforces who can read/write what — see supabase/schema.sql. */

export const STAGES = ['Idea', 'Validation', 'MVP', 'Launch', 'Growth', 'Fundraising']
export const SECTORS = [
  'AI / ML', 'Fintech', 'Healthtech', 'Edtech', 'Agritech', 'E-commerce',
  'SaaS', 'Cleantech', 'Foodtech', 'Logistics', 'Social Impact / SDG', 'Deeptech', 'Other',
]
export const ACHIEVEMENT_TYPES = ['Funding', 'Patent', 'Hackathon', 'Press', 'Award', 'Partnership', 'Other']
/** A startup with no mentor contact in this many days is flagged as going quiet. */
export const STALE_DAYS = 30
export const APP_STAGES = ['Applied', 'Shortlisted', 'Interview', 'Admitted', 'Rejected']
export const EVENT_TYPES = ['Workshop', 'Demo Day', 'Pitch Night', 'Guest Talk', 'Deadline']

/* ---------- institutions (tenants) ---------- */
export async function getInstitutions() {
  const { data } = await supabase.from('institutions').select('*').order('name')
  return data ?? []
}
export async function getMyInstitution(institutionId) {
  if (!institutionId) return null
  const { data } = await supabase.from('institutions').select('*').eq('id', institutionId).maybeSingle()
  return data ?? null
}
export async function updateInstitution(id, patch) {
  const { error } = await supabase.from('institutions').update(patch).eq('id', id)
  if (error) throw new Error(error.message)
}

/* ---------- invitations ----------
   Mentors and admins can only join by invitation; students may also self-sign-up
   if their email domain is registered to the institution. The DB trigger reads
   these rows at signup — role is never taken from the client. */
export async function getInvitations() {
  const { data } = await supabase.from('invitations').select('*').order('created_at', { ascending: false })
  return data ?? []
}
export async function addInvitation({ institutionId, email, role, invitedBy, byName }) {
  const { error } = await supabase.from('invitations').insert({
    institution_id: institutionId, email: email.trim().toLowerCase(), role,
    invited_by: invitedBy || null, by_name: byName,
  })
  if (error) throw new Error(error.message)
}
export async function deleteInvitation(id) {
  await supabase.from('invitations').delete().eq('id', id)
}

/* ---------- profiles ---------- */
export async function getUsers() {
  const { data } = await supabase.from('profiles').select('*').order('created_at')
  return data ?? []
}
export async function getUser(id) {
  if (!id) return null
  const { data } = await supabase.from('profiles').select('*').eq('id', id).single()
  return data ?? null
}
export async function getMentors() {
  const { data } = await supabase.from('profiles').select('*').eq('role', 'mentor')
  return data ?? []
}
export async function getStudentsForMentor(mentorId) {
  const { data } = await supabase.from('profiles').select('*').eq('role', 'student').eq('mentor_id', mentorId)
  return data ?? []
}
export async function assignMentor(studentId, mentorId) {
  await supabase.from('profiles').update({ mentor_id: mentorId || null }).eq('id', studentId)
}
export async function setUserRole(id, role) {
  await supabase.from('profiles').update({ role }).eq('id', id)
}
export async function updateUser(id, patch) {
  await supabase.from('profiles').update(patch).eq('id', id)
}
export async function deleteUser(id) {
  await supabase.from('profiles').delete().eq('id', id)
}

/* ---------- public showcase (safe columns, no emails) ---------- */
export async function getShowcase() {
  const { data } = await supabase.from('showcase').select('*')
  return data ?? []
}

/* ---------- applications ---------- */
export async function getApplications() {
  const { data } = await supabase.from('applications').select('*').order('created_at', { ascending: false })
  return data ?? []
}
/** Applications are submitted anonymously, so the institution being applied to
 *  must be passed explicitly — there is no session to derive it from. */
export async function addApplication(a) {
  const { error } = await supabase.from('applications').insert({
    name: a.name, email: a.email, startup: a.startup, stage: a.stage,
    pitch: a.pitch, team_size: a.teamSize, why: a.why,
    institution_id: a.institutionId,
  })
  if (error) throw new Error(error.message)
}
export async function updateApplication(id, patch) {
  await supabase.from('applications').update(patch).eq('id', id)
}

/* ---------- progress ---------- */
const DEFAULT_PROGRESS = { stage: 'Idea', percent: 10, note: '', updated_at: null }
export async function getProgress(studentId) {
  const { data } = await supabase.from('progress').select('*').eq('student_id', studentId).maybeSingle()
  return data ?? { ...DEFAULT_PROGRESS, student_id: studentId }
}
/** Progress for many students at once (dashboards) -> { [studentId]: progress } */
export async function getProgressMap(studentIds) {
  if (!studentIds?.length) return {}
  const { data } = await supabase.from('progress').select('*').in('student_id', studentIds)
  const map = {}
  studentIds.forEach((id) => { map[id] = { ...DEFAULT_PROGRESS, student_id: id } })
  ;(data ?? []).forEach((p) => { map[p.student_id] = p })
  return map
}
export async function saveProgress(studentId, d) {
  const row = { student_id: studentId, stage: d.stage, percent: d.percent, note: d.note, updated_at: new Date().toISOString() }
  const { error } = await supabase.from('progress').upsert(row, { onConflict: 'student_id' })
  if (error) throw new Error(error.message)
  return row
}

/* ---------- meetings ---------- */
export async function getMeetingsFor(userId, role) {
  const col = role === 'mentor' ? 'mentor_id' : 'student_id'
  const { data } = await supabase.from('meetings').select('*').eq(col, userId).order('created_at', { ascending: false })
  return data ?? []
}
export async function getMeetings() {
  const { data } = await supabase.from('meetings').select('*').order('created_at', { ascending: false })
  return data ?? []
}
export async function addMeeting(m) {
  const { error } = await supabase.from('meetings').insert({
    student_id: m.studentId, mentor_id: m.mentorId || null,
    student_name: m.studentName, date: m.date || null, time: m.time, topic: m.topic,
  })
  if (error) throw new Error(error.message)
}
export async function updateMeeting(id, patch) {
  await supabase.from('meetings').update(patch).eq('id', id)
}

/* ---------- evaluations ---------- */
export async function getEvals(studentId) {
  const { data } = await supabase.from('evaluations').select('*').eq('student_id', studentId).order('created_at', { ascending: false })
  return data ?? []
}
export async function addEval(studentId, ev) {
  const { error } = await supabase.from('evaluations').insert({
    student_id: studentId, mentor_id: ev.mentorId || null, by_name: ev.by, score: ev.score, feedback: ev.feedback,
  })
  if (error) throw new Error(error.message)
}

/* ---------- tasks ---------- */
export async function getTasks(studentId) {
  const { data } = await supabase.from('tasks').select('*').eq('student_id', studentId).order('created_at')
  return data ?? []
}
export async function addTask(t) {
  const { error } = await supabase.from('tasks').insert({ student_id: t.studentId, mentor_id: t.mentorId || null, title: t.title })
  if (error) throw new Error(error.message)
}
export async function toggleTask(id, done) {
  await supabase.from('tasks').update({ done }).eq('id', id)
}
export async function deleteTask(id) {
  await supabase.from('tasks').delete().eq('id', id)
}

/* ---------- messages ---------- */
export async function getThread(studentId) {
  const { data } = await supabase.from('messages').select('*').eq('student_id', studentId).order('created_at')
  return data ?? []
}
export async function sendMessage(m) {
  const { error } = await supabase.from('messages').insert({
    student_id: m.studentId, sender_id: m.senderId, from_role: m.from, name: m.name, text: m.text,
  })
  if (error) throw new Error(error.message)
}

/* ---------- resources ---------- */
export async function getResources(studentId) {
  const { data } = await supabase.from('resources').select('*').eq('student_id', studentId).order('created_at')
  return data ?? []
}
export async function addResource(r) {
  const { error } = await supabase.from('resources').insert({ student_id: r.studentId, title: r.title, url: r.url, note: r.note })
  if (error) throw new Error(error.message)
}
export async function deleteResource(id) {
  await supabase.from('resources').delete().eq('id', id)
}

/* ---------- announcements ---------- */
export async function getAnnouncements() {
  const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false })
  return data ?? []
}
export async function addAnnouncement(a) {
  const { error } = await supabase.from('announcements').insert({ title: a.title, body: a.body })
  if (error) throw new Error(error.message)
}
export async function deleteAnnouncement(id) {
  await supabase.from('announcements').delete().eq('id', id)
}

/* ---------- events + rsvps ---------- */
export async function getEvents() {
  const { data } = await supabase.from('events').select('*, event_rsvps(user_id)').order('date')
  return (data ?? []).map((e) => ({ ...e, rsvps: (e.event_rsvps ?? []).map((r) => r.user_id) }))
}
export async function addEvent(e) {
  const { error } = await supabase.from('events').insert({
    title: e.title, date: e.date || null, time: e.time, type: e.type, location: e.location, description: e.description,
  })
  if (error) throw new Error(error.message)
}
export async function deleteEvent(id) {
  await supabase.from('events').delete().eq('id', id)
}
export async function toggleRsvp(eventId, userId, going) {
  if (going) await supabase.from('event_rsvps').delete().eq('event_id', eventId).eq('user_id', userId)
  else await supabase.from('event_rsvps').insert({ event_id: eventId, user_id: userId })
}

/* ---------- cohorts ---------- */
export async function getCohorts() {
  const { data } = await supabase.from('cohorts').select('*').order('created_at')
  return data ?? []
}
export async function addCohort(c) {
  const { error } = await supabase.from('cohorts').insert({ name: c.name })
  if (error) throw new Error(error.message)
}
export async function deleteCohort(id) {
  await supabase.from('cohorts').delete().eq('id', id)
}
export async function setStudentCohort(studentId, cohortId) {
  await supabase.from('profiles').update({ cohort_id: cohortId || null }).eq('id', studentId)
}
export async function getCohortFor(cohortId) {
  if (!cohortId) return null
  const { data } = await supabase.from('cohorts').select('*').eq('id', cohortId).maybeSingle()
  return data ?? null
}

/* ---------- reports ---------- */
export async function saveReport(studentId, startupName, data) {
  await supabase.from('reports').insert({ student_id: studentId, startup_name: startupName, data })
}
export async function getReports(studentId) {
  const { data } = await supabase.from('reports').select('*').eq('student_id', studentId).order('created_at', { ascending: false })
  return data ?? []
}

/* ---------- community chat (whole incubation centre) ---------- */
export async function getCommunityMessages(limit = 200) {
  const { data } = await supabase
    .from('community_messages')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(limit)
  return data ?? []
}
export async function sendCommunityMessage({ senderId, name, role, text }) {
  const { error } = await supabase.from('community_messages').insert({ sender_id: senderId, name, role, text })
  if (error) throw new Error(error.message)
}
/** Live updates — returns the channel; caller unsubscribes on unmount. */
export function subscribeCommunity(onInsert) {
  return supabase
    .channel('community')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'community_messages' }, (payload) => onInsert(payload.new))
    .subscribe()
}

/* ---------- document requests ---------- */
export async function getDocRequests(studentId) {
  const { data } = await supabase.from('document_requests').select('*').eq('student_id', studentId).order('created_at', { ascending: false })
  return data ?? []
}
export async function addDocRequest(r) {
  const { error } = await supabase.from('document_requests').insert({
    student_id: r.studentId, requested_by: r.requestedBy || null, by_name: r.byName, title: r.title, note: r.note,
  })
  if (error) throw new Error(error.message)
}

/* ---------- documents (files in Storage 'documents' bucket) ---------- */
export async function getDocuments(studentId) {
  const { data } = await supabase.from('documents').select('*').eq('student_id', studentId).order('created_at', { ascending: false })
  return data ?? []
}
export async function uploadDocument({ studentId, file, title, requestId }) {
  const path = `${studentId}/${Date.now()}-${file.name}`
  const up = await supabase.storage.from('documents').upload(path, file, { upsert: false })
  if (up.error) throw new Error(up.error.message)
  const { error } = await supabase.from('documents').insert({
    student_id: studentId, uploaded_by: studentId, request_id: requestId || null,
    title: title || file.name, file_path: path, file_name: file.name, size: file.size,
  })
  if (error) throw new Error(error.message)
  if (requestId) await supabase.from('document_requests').update({ status: 'fulfilled' }).eq('id', requestId)
}
/** Private bucket -> short-lived signed URL for download/preview. */
export async function getDocumentUrl(path) {
  const { data, error } = await supabase.storage.from('documents').createSignedUrl(path, 120)
  if (error) throw new Error(error.message)
  return data.signedUrl
}
export async function deleteDocument(doc) {
  await supabase.storage.from('documents').remove([doc.file_path])
  await supabase.from('documents').delete().eq('id', doc.id)
}

/* ---------- teams (a startup and its founders) ---------- */
export async function getMyTeam(profileId) {
  const { data: membership } = await supabase
    .from('team_members').select('team_id, role').eq('profile_id', profileId).maybeSingle()
  if (!membership) return null
  const { data: team } = await supabase
    .from('teams').select('*').eq('id', membership.team_id).maybeSingle()
  if (!team) return null
  return { ...team, myRole: membership.role, members: await getTeamMembers(team.id) }
}
export async function getTeamMembers(teamId) {
  const { data } = await supabase
    .from('team_members')
    .select('role, joined_at, profiles(id, name, email, phone, avatar_url)')
    .eq('team_id', teamId)
  return (data ?? []).map((r) => ({ ...r.profiles, role: r.role, joined_at: r.joined_at }))
}
export async function createTeam({ name, tagline, sector, stage, profileId }) {
  const { data, error } = await supabase
    .from('teams').insert({ name, tagline, sector, stage: stage || 'Idea' }).select().single()
  if (error) throw new Error(error.message)
  const { error: memberErr } = await supabase
    .from('team_members').insert({ team_id: data.id, profile_id: profileId, role: 'founder' })
  if (memberErr) throw new Error(memberErr.message)
  return data
}
export async function updateTeam(id, patch) {
  const { error } = await supabase.from('teams').update(patch).eq('id', id)
  if (error) throw new Error(error.message)
}
/** Join by team name — co-founders don't have the team's UUID to hand. */
export async function joinTeamByName(name, profileId) {
  const { data: team } = await supabase
    .from('teams').select('id').ilike('name', name.trim()).maybeSingle()
  if (!team) throw new Error(`No startup named "${name}" in your institution.`)
  const { error } = await supabase
    .from('team_members').insert({ team_id: team.id, profile_id: profileId, role: 'co-founder' })
  if (error) throw new Error(error.message)
  return team.id
}
export async function leaveTeam(profileId) {
  await supabase.from('team_members').delete().eq('profile_id', profileId)
}

/* ---------- achievements ---------- */
export async function getAchievements(teamId) {
  const { data } = await supabase
    .from('achievements').select('*').eq('team_id', teamId)
    .order('happened_on', { ascending: false, nullsFirst: false })
  return data ?? []
}
export async function addAchievement(a) {
  const { error } = await supabase.from('achievements').insert({
    team_id: a.teamId, type: a.type, title: a.title, description: a.description,
    amount: a.amount || null, happened_on: a.happenedOn || null, created_by: a.createdBy,
  })
  if (error) throw new Error(error.message)
}
export async function deleteAchievement(id) {
  await supabase.from('achievements').delete().eq('id', id)
}

/* ---------- engagement (which startups are going quiet) ---------- */
export async function getEngagement() {
  const { data } = await supabase.from('team_engagement').select('*')
  return (data ?? []).map((r) => ({
    ...r,
    stale: r.days_since_meeting == null || r.days_since_meeting > STALE_DAYS,
  }))
}

/* ---------- leaderboard (all startups, ranked) ---------- */
/** Ranks startups (not individuals) by funding raised, then by progress. */
export async function getLeaderboard() {
  const [{ data: teams }, { data: members }, { data: prog }] = await Promise.all([
    supabase.from('teams').select('*'),
    supabase.from('team_members').select('team_id, profile_id, role, profiles(name)'),
    supabase.from('progress').select('student_id, percent'),
  ])
  const percentOf = {}
  ;(prog ?? []).forEach((p) => { percentOf[p.student_id] = p.percent })

  const byTeam = {}
  ;(members ?? []).forEach((m) => {
    ;(byTeam[m.team_id] ||= []).push({
      name: m.profiles?.name,
      role: m.role,
      percent: percentOf[m.profile_id] ?? 0,
    })
  })

  return (teams ?? [])
    .map((t) => {
      const crew = byTeam[t.id] ?? []
      return {
        id: t.id,
        startup: t.name,
        tagline: t.tagline,
        sector: t.sector,
        stage: t.stage,
        funding: t.funding_raised ?? 0,
        founders: crew.map((c) => c.name).filter(Boolean),
        // Team progress = the furthest any founder has recorded.
        percent: crew.length ? Math.max(...crew.map((c) => c.percent)) : 0,
      }
    })
    .sort((a, b) => b.funding - a.funding || b.percent - a.percent)
}

/* ---------- settings: avatar + password ---------- */
export async function uploadAvatar(userId, file) {
  const path = `${userId}/avatar-${Date.now()}-${file.name}`
  const up = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
  if (up.error) throw new Error(up.error.message)
  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  return data.publicUrl
}
export async function changePassword(newPassword) {
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw new Error(error.message)
}
