import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, Send } from 'lucide-react'
import { addApplication, getInstitutions, STAGES } from '../lib/store'
import GlassNav from '../components/GlassNav'
import SkeuoButton from '../components/SkeuoButton'

const inputCls = 'w-full brutal-flat bg-white px-4 py-3 text-sm outline-none focus:shadow-[3px_3px_0_var(--blue)] placeholder:text-[var(--muted)]'

export default function Apply() {
  const [form, setForm] = useState({ name: '', email: '', startup: '', stage: 'Idea', pitch: '', teamSize: '', why: '', institutionId: '' })
  const [institutions, setInstitutions] = useState([])
  const [done, setDone] = useState(false)
  const [err, setErr] = useState('')
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }))

  // Applications go to a specific incubator, so the applicant picks one.
  useEffect(() => {
    getInstitutions().then((list) => {
      setInstitutions(list)
      if (list.length === 1) set('institutionId', list[0].id)
    })
  }, [])

  async function submit(e) {
    e.preventDefault()
    setErr('')
    try {
      await addApplication(form)
      setDone(true)
    } catch (e) {
      setErr(e.message)
    }
  }

  if (done) {
    return (
      <div className="min-h-screen">
        <GlassNav />
        <section className="mx-auto max-w-md px-6 py-24 text-center">
          <CheckCircle2 size={44} className="mx-auto text-[var(--blue)]" />
          <h1 className="display mt-5 text-3xl">Application received.</h1>
          <p className="mt-3 text-sm text-[var(--ink-soft)]">
            Thanks, {form.name.split(' ')[0]}. The incubator team will review your application and reach out at {form.email}.
          </p>
          <SkeuoButton to="/" size="lg" className="mt-8">Back home</SkeuoButton>
        </section>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <GlassNav />
      <section className="mx-auto max-w-2xl px-6 py-14">
        <div className="eyebrow text-[var(--ink-soft)]">// join the incubator</div>
        <h1 className="display mt-3 text-4xl">Apply to SIVP.</h1>
        <p className="mt-3 text-sm text-[var(--ink-soft)]">
          Tell us about you and your startup. Selected founders get mentorship, resources, and access to funding.
        </p>

        <form onSubmit={submit} className="mt-8 space-y-5">
          <div>
            <label className="eyebrow mb-2 block">Incubator you're applying to</label>
            <select className={inputCls} value={form.institutionId} onChange={(e) => set('institutionId', e.target.value)} required>
              <option value="">Select an institution…</option>
              {institutions.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div><label className="eyebrow mb-2 block">Full name</label><input className={inputCls} value={form.name} onChange={(e) => set('name', e.target.value)} required placeholder="Your name" /></div>
            <div><label className="eyebrow mb-2 block">Email</label><input className={inputCls} type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required placeholder="you@college.edu" /></div>
            <div><label className="eyebrow mb-2 block">Startup name</label><input className={inputCls} value={form.startup} onChange={(e) => set('startup', e.target.value)} required placeholder="PawPair" /></div>
            <div>
              <label className="eyebrow mb-2 block">Current stage</label>
              <select className={inputCls} value={form.stage} onChange={(e) => set('stage', e.target.value)}>{STAGES.map((s) => <option key={s}>{s}</option>)}</select>
            </div>
            <div><label className="eyebrow mb-2 block">Team size</label><input className={inputCls} type="number" min="1" value={form.teamSize} onChange={(e) => set('teamSize', e.target.value)} placeholder="2" /></div>
          </div>
          <div><label className="eyebrow mb-2 block">One-line pitch</label><input className={inputCls} value={form.pitch} onChange={(e) => set('pitch', e.target.value)} required placeholder="On-demand verified pet-sitting marketplace." /></div>
          <div><label className="eyebrow mb-2 block">Why do you want to join?</label><textarea className={inputCls} rows={3} value={form.why} onChange={(e) => set('why', e.target.value)} required placeholder="What do you need most from an incubator?" /></div>
          {err && <p className="brutal-flat p-2 text-xs font-medium" style={{ background: '#FDE2E2', borderColor: '#C0392B' }}>{err}</p>}
          <SkeuoButton type="submit" size="lg" className="w-full">Submit application <Send size={16} /></SkeuoButton>
        </form>

        <p className="mt-6 text-center text-xs text-[var(--muted)]">Already admitted? <Link to="/login" className="underline">Log in</Link></p>
      </section>
    </div>
  )
}
