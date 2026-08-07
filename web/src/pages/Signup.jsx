import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Loader2, Info } from 'lucide-react'
import { useAuth } from '../lib/auth'
import GlassNav from '../components/GlassNav'
import SkeuoButton from '../components/SkeuoButton'

const inputCls =
  'w-full brutal-flat bg-white px-4 py-3 text-sm text-[var(--ink)] outline-none focus:shadow-[3px_3px_0_var(--blue)] placeholder:text-[var(--muted)]'
const dest = { student: '/student', mentor: '/mentor', admin: '/admin/dashboard' }

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '', startup: '' })
  const [err, setErr] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const { user, signup, loginWithProvider } = useAuth()
  const nav = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname

  useEffect(() => {
    if (user) nav(from || dest[user.role] || '/', { replace: true })
  }, [user, nav, from])

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }))

  async function submit(e) {
    e.preventDefault()
    setErr('')
    setMsg('')
    setBusy(true)
    try {
      await signup(form)
      // onAuthStateChange will load the profile and the effect above redirects.
      // Role/institution are assigned server-side from an invite or email domain.
    } catch (e) {
      // Email-confirmation flow returns a friendly message rather than a session.
      if (e.message.toLowerCase().includes('confirm')) setMsg(e.message)
      else setErr(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen">
      <GlassNav />
      <section className="mx-auto max-w-md px-6 py-16">
        <div className="eyebrow text-[var(--ink-soft)]">// join sivp</div>
        <h1 className="display mt-3 text-4xl">Create account.</h1>

        <div className="brutal-flat mt-6 flex items-start gap-2 p-3 text-xs" style={{ background: 'var(--yellow)' }}>
          <Info size={15} className="mt-0.5 shrink-0" />
          <span>
            SIVP is for member institutions. Sign up with your university email — mentors and
            admins join by invitation from their incubator.
          </span>
        </div>

        <form onSubmit={submit} className="mt-5 space-y-4">
          <div>
            <label className="eyebrow mb-2 block">Full name</label>
            <input className={inputCls} value={form.name} onChange={(e) => set('name', e.target.value)} required placeholder="Your name" />
          </div>
          <div>
            <label className="eyebrow mb-2 block">Email</label>
            <input className={inputCls} type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required placeholder="you@college.edu" />
          </div>
          <div>
            <label className="eyebrow mb-2 block">Password</label>
            <input className={inputCls} type="password" value={form.password} onChange={(e) => set('password', e.target.value)} required minLength={6} placeholder="At least 6 characters" />
          </div>
          <div>
            <label className="eyebrow mb-2 block">Startup name (optional)</label>
            <input className={inputCls} value={form.startup} onChange={(e) => set('startup', e.target.value)} placeholder="PawPair" />
          </div>
          {err && <p className="brutal-flat p-2 text-xs font-medium" style={{ background: '#FDE2E2', borderColor: '#C0392B' }}>{err}</p>}
          {msg && <p className="brutal-flat p-2 text-xs font-medium" style={{ background: 'var(--yellow)' }}>{msg}</p>}
          <SkeuoButton type="submit" size="lg" className="w-full">
            {busy ? <><Loader2 size={16} className="animate-spin" /> Creating…</> : 'Create account'}
          </SkeuoButton>
        </form>

        <div className="my-4 flex items-center gap-3">
          <span className="h-px flex-1 bg-[var(--neu-dark)]" />
          <span className="eyebrow text-[var(--muted)]">or</span>
          <span className="h-px flex-1 bg-[var(--neu-dark)]" />
        </div>

        {/* Microsoft hidden for now — re-enable by uncommenting this button */}
        {/* <button onClick={() => loginWithProvider('azure')} className="btn btn-light btn-md w-full">Continue with Microsoft</button> */}
        <button onClick={() => loginWithProvider('google')} className="btn btn-light btn-md w-full">Continue with Google</button>

        <p className="mt-6 text-center text-sm text-[var(--ink-soft)]">
          Already have an account? <Link to="/login" state={location.state} className="font-bold text-[var(--blue)]">Log in</Link>
        </p>
      </section>
    </div>
  )
}
