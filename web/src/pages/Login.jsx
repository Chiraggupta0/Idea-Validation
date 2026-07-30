import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { GraduationCap, UserCog, Loader2 } from 'lucide-react'
import { useAuth } from '../lib/auth'
import GlassNav from '../components/GlassNav'
import SkeuoButton from '../components/SkeuoButton'

const inputCls =
  'w-full brutal-flat bg-white px-4 py-3 text-sm text-[var(--ink)] outline-none focus:shadow-[3px_3px_0_var(--blue)] placeholder:text-[var(--muted)]'
const dest = { student: '/student', mentor: '/mentor', admin: '/admin/dashboard' }

export default function Login() {
  const [role, setRole] = useState('student')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const { user, login, loginWithProvider } = useAuth()
  const nav = useNavigate()
  const location = useLocation()
  // Where ProtectedRoute sent them from (e.g. /validate) — fall back to the
  // role's dashboard if they arrived here directly.
  const from = location.state?.from?.pathname

  // If already signed in (incl. returning from Microsoft OAuth), continue
  // wherever they were headed, or go to the dashboard.
  useEffect(() => {
    if (user) nav(from || dest[user.role] || '/', { replace: true })
  }, [user, nav, from])

  async function submit(e) {
    e.preventDefault()
    setErr('')
    setBusy(true)
    try {
      const profile = await login({ email, password, role })
      nav(from || dest[profile?.role] || '/')
    } catch (e) {
      setErr(e.message)
    } finally {
      setBusy(false)
    }
  }

  async function oauth(provider) {
    setErr('')
    try {
      await loginWithProvider(provider)
    } catch (e) {
      setErr(e.message)
    }
  }

  return (
    <div className="min-h-screen">
      <GlassNav />
      <section className="mx-auto max-w-md px-6 py-16">
        <div className="eyebrow text-[var(--ink-soft)]">// welcome back</div>
        <h1 className="display mt-3 text-4xl">Log in.</h1>

        <div className="mt-6 grid grid-cols-2 gap-2">
          {[
            { k: 'student', label: 'Student', icon: GraduationCap },
            { k: 'mentor', label: 'Mentor', icon: UserCog },
          ].map((r) => (
            <button
              key={r.k}
              onClick={() => setRole(r.k)}
              className={`brutal-flat flex items-center justify-center gap-2 py-2.5 text-sm font-bold uppercase ${role === r.k ? 'text-white' : 'text-[var(--ink)]'}`}
              style={role === r.k ? { background: 'var(--blue)' } : { background: '#fff' }}
            >
              <r.icon size={15} /> {r.label}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="mt-5 space-y-4">
          <div>
            <label className="eyebrow mb-2 block">Email</label>
            <input className={inputCls} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@college.edu" />
          </div>
          <div>
            <label className="eyebrow mb-2 block">Password</label>
            <input className={inputCls} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
          </div>
          {err && <p className="brutal-flat p-2 text-xs font-medium" style={{ background: '#FDE2E2', borderColor: '#C0392B' }}>{err}</p>}
          <SkeuoButton type="submit" size="lg" className="w-full">
            {busy ? <><Loader2 size={16} className="animate-spin" /> Logging in…</> : `Log in as ${role}`}
          </SkeuoButton>
        </form>

        <div className="my-4 flex items-center gap-3">
          <span className="h-px flex-1 bg-[var(--neu-dark)]" />
          <span className="eyebrow text-[var(--muted)]">or</span>
          <span className="h-px flex-1 bg-[var(--neu-dark)]" />
        </div>

        {/* Microsoft login hidden for now — re-enable by uncommenting this button */}
        {/* <button onClick={() => oauth('azure')} className="btn btn-light btn-md w-full">Continue with Microsoft</button> */}
        <button onClick={() => oauth('google')} className="btn btn-light btn-md w-full">Continue with Google</button>

        <p className="mt-6 text-center text-sm text-[var(--ink-soft)]">
          New here? <Link to="/signup" state={location.state} className="font-bold text-[var(--blue)]">Create an account</Link>
        </p>
        <p className="mt-2 text-center text-xs text-[var(--muted)]">
          Admin? <Link to="/admin" className="font-semibold underline">Admin portal</Link>
        </p>
      </section>
    </div>
  )
}
