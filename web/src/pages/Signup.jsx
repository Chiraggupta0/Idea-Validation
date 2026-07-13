import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { GraduationCap, UserCog } from 'lucide-react'
import { useAuth } from '../lib/auth'
import GlassNav from '../components/GlassNav'
import SkeuoButton from '../components/SkeuoButton'

const inputCls =
  'w-full brutal-flat bg-white px-4 py-3 text-sm text-[var(--ink)] outline-none focus:shadow-[3px_3px_0_var(--blue)] placeholder:text-[var(--muted)]'
const dest = { student: '/student', mentor: '/mentor' }

export default function Signup() {
  const [role, setRole] = useState('student')
  const [form, setForm] = useState({ name: '', email: '', password: '', startup: '' })
  const [err, setErr] = useState('')
  const { signup, loginWithGoogle } = useAuth()
  const nav = useNavigate()

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }))

  function submit(e) {
    e.preventDefault()
    setErr('')
    try {
      const u = signup({ ...form, role })
      nav(dest[u.role])
    } catch (e) {
      setErr(e.message)
    }
  }

  return (
    <div className="min-h-screen">
      <GlassNav />
      <section className="mx-auto max-w-md px-6 py-16">
        <div className="eyebrow text-[var(--ink-soft)]">// join sivp</div>
        <h1 className="display mt-3 text-4xl">Create account.</h1>

        <div className="mt-6 grid grid-cols-2 gap-2">
          {[
            { k: 'student', label: 'Student', icon: GraduationCap },
            { k: 'mentor', label: 'Mentor', icon: UserCog },
          ].map((r) => (
            <button
              key={r.k}
              onClick={() => setRole(r.k)}
              className={`brutal-flat flex items-center justify-center gap-2 py-2.5 text-sm font-bold uppercase ${
                role === r.k ? 'text-white' : 'text-[var(--ink)]'
              }`}
              style={role === r.k ? { background: 'var(--blue)' } : { background: '#fff' }}
            >
              <r.icon size={15} /> {r.label}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="mt-5 space-y-4">
          <div>
            <label className="eyebrow mb-2 block">Full name</label>
            <input className={inputCls} value={form.name} onChange={(e) => set('name', e.target.value)} required placeholder="Your name" />
          </div>
          <div>
            <label className="eyebrow mb-2 block">Email</label>
            <input className={inputCls} type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required placeholder="you@example.com" />
          </div>
          <div>
            <label className="eyebrow mb-2 block">Password</label>
            <input className={inputCls} type="password" value={form.password} onChange={(e) => set('password', e.target.value)} required placeholder="Choose a password" />
          </div>
          {role === 'student' && (
            <div>
              <label className="eyebrow mb-2 block">Startup name (optional)</label>
              <input className={inputCls} value={form.startup} onChange={(e) => set('startup', e.target.value)} placeholder="PawPair" />
            </div>
          )}
          {err && <p className="brutal-flat p-2 text-xs font-medium" style={{ background: '#FDE2E2', borderColor: '#C0392B' }}>{err}</p>}
          <SkeuoButton type="submit" size="lg" className="w-full">Sign up as {role}</SkeuoButton>
        </form>

        <button onClick={() => nav(dest[loginWithGoogle(role).role])} className="btn btn-light btn-md mt-3 w-full">
          Continue with Google
        </button>

        <p className="mt-6 text-center text-sm text-[var(--ink-soft)]">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-[var(--blue)]">Log in</Link>
        </p>
      </section>
    </div>
  )
}
