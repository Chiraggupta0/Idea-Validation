import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ShieldCheck, Loader2 } from 'lucide-react'
import { useAuth } from '../lib/auth'
import GlassNav from '../components/GlassNav'
import SkeuoButton from '../components/SkeuoButton'

const inputCls =
  'w-full brutal-flat bg-white px-4 py-3 text-sm text-[var(--ink)] outline-none focus:shadow-[3px_3px_0_var(--blue)] placeholder:text-[var(--muted)]'

export default function AdminAuth() {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [err, setErr] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const { user, login, signup } = useAuth()
  const nav = useNavigate()

  useEffect(() => {
    if (user?.role === 'admin') nav('/admin/dashboard', { replace: true })
  }, [user, nav])

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }))

  async function submit(e) {
    e.preventDefault()
    setErr('')
    setMsg('')
    setBusy(true)
    try {
      if (mode === 'login') {
        await login({ email: form.email, password: form.password, role: 'admin' })
      } else {
        await signup({ ...form, role: 'admin' })
      }
      nav('/admin/dashboard')
    } catch (e) {
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
        <div className="brutal-flat mb-6 inline-flex items-center gap-2 px-3 py-1.5" style={{ background: 'var(--ink)', color: '#fff' }}>
          <ShieldCheck size={15} /> <span className="eyebrow" style={{ color: '#fff' }}>admin portal</span>
        </div>
        <h1 className="display text-4xl">{mode === 'login' ? 'Admin log in.' : 'Admin sign up.'}</h1>

        <div className="mt-6 grid grid-cols-2 gap-2">
          {['login', 'signup'].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`brutal-flat py-2.5 text-sm font-bold uppercase ${mode === m ? 'text-white' : 'text-[var(--ink)]'}`}
              style={mode === m ? { background: 'var(--ink)' } : { background: '#fff' }}
            >
              {m}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="mt-5 space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="eyebrow mb-2 block">Name</label>
              <input className={inputCls} value={form.name} onChange={(e) => set('name', e.target.value)} required placeholder="Admin name" />
            </div>
          )}
          <div>
            <label className="eyebrow mb-2 block">Email</label>
            <input className={inputCls} type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required placeholder="admin@college.edu" />
          </div>
          <div>
            <label className="eyebrow mb-2 block">Password</label>
            <input className={inputCls} type="password" value={form.password} onChange={(e) => set('password', e.target.value)} required minLength={6} placeholder="••••••••" />
          </div>
          {err && <p className="brutal-flat p-2 text-xs font-medium" style={{ background: '#FDE2E2', borderColor: '#C0392B' }}>{err}</p>}
          {msg && <p className="brutal-flat p-2 text-xs font-medium" style={{ background: 'var(--yellow)' }}>{msg}</p>}
          <SkeuoButton type="submit" size="lg" className="w-full">
            {busy ? <><Loader2 size={16} className="animate-spin" /> Working…</> : mode === 'login' ? 'Enter dashboard' : 'Create admin'}
          </SkeuoButton>
        </form>

        <p className="mt-6 text-center text-xs text-[var(--muted)]">
          Not an admin? <Link to="/login" className="font-semibold underline">Student / mentor login</Link>
        </p>

        {mode === 'login' && (
          <div className="brutal-flat mt-6 p-3">
            <div className="eyebrow mb-2">// demo admin</div>
            <button
              type="button"
              onClick={() => setForm({ ...form, email: 'admin@sivp.dev', password: 'admin123' })}
              className="btn btn-light btn-sm"
            >
              Fill demo admin
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
