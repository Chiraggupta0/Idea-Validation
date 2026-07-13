import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { GraduationCap, UserCog } from 'lucide-react'
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
  const { login, loginWithGoogle } = useAuth()
  const nav = useNavigate()

  function submit(e) {
    e.preventDefault()
    setErr('')
    try {
      const u = login({ email, password, role })
      nav(dest[u.role])
    } catch (e) {
      setErr(e.message)
    }
  }
  function google() {
    setErr('')
    const u = loginWithGoogle(role)
    nav(dest[u.role])
  }

  return (
    <div className="min-h-screen">
      <GlassNav />
      <section className="mx-auto max-w-md px-6 py-16">
        <div className="eyebrow text-[var(--ink-soft)]">// welcome back</div>
        <h1 className="display mt-3 text-4xl">Log in.</h1>

        {/* Role tabs */}
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
            <label className="eyebrow mb-2 block">Email</label>
            <input className={inputCls} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
          </div>
          <div>
            <label className="eyebrow mb-2 block">Password</label>
            <input className={inputCls} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
          </div>
          {err && <p className="brutal-flat p-2 text-xs font-medium" style={{ background: '#FDE2E2', borderColor: '#C0392B' }}>{err}</p>}
          <SkeuoButton type="submit" size="lg" className="w-full">Log in as {role}</SkeuoButton>
        </form>

        <button onClick={google} className="btn btn-light btn-md mt-3 w-full">Continue with Google</button>

        <p className="mt-6 text-center text-sm text-[var(--ink-soft)]">
          New here?{' '}
          <Link to="/signup" className="font-bold text-[var(--blue)]">Create an account</Link>
        </p>
        <p className="mt-2 text-center text-xs text-[var(--muted)]">
          Admin? <Link to="/admin" className="font-semibold underline">Admin portal</Link>
        </p>

        <div className="brutal-flat mt-6 p-3 text-xs text-[var(--ink-soft)]">
          <div className="eyebrow mb-1">// demo accounts</div>
          Student: student@sivp.dev / student123<br />
          Mentor: mentor@sivp.dev / mentor123
        </div>
      </section>
    </div>
  )
}
