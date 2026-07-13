import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, LogOut } from 'lucide-react'
import SkeuoButton from './SkeuoButton'
import { useAuth } from '../lib/auth'

const LINKS = [
  { label: 'Showcase', to: '/showcase' },
  { label: 'Events', to: '/events' },
  { label: 'Resources', to: '/resources' },
]

const DASH = { student: '/student', mentor: '/mentor', admin: '/admin/dashboard' }

export default function GlassNav() {
  const [open, setOpen] = useState(false)
  const [hidden, setHidden] = useState(false)
  const lastY = useRef(0)
  const { user, logout } = useAuth()
  const nav = useNavigate()

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY
      if (y > lastY.current && y > 120) {
        setHidden(true)
        setOpen(false)
      } else {
        setHidden(false)
      }
      lastY.current = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function doLogout() {
    logout()
    nav('/')
  }

  return (
    <div
      className="sticky top-3 z-50 mx-auto w-full max-w-6xl px-3 transition-transform duration-300 sm:top-4 sm:px-4"
      style={{ transform: hidden ? 'translateY(-140%)' : 'translateY(0)' }}
    >
      <nav className="glass flex items-center justify-between rounded-2xl px-4 py-2.5 sm:px-5 sm:py-3">
        <Link to="/" className="font-display text-lg font-bold tracking-tight text-[var(--ink)]">SIVP</Link>

        <div className="hidden items-center gap-6 md:flex">
          {LINKS.map((l) => (
            <Link key={l.label} to={l.to} className="text-xs font-medium uppercase tracking-wide text-[var(--ink-soft)] hover:text-[var(--ink)]">
              {l.label}
            </Link>
          ))}
          {user && (
            <Link to={DASH[user.role]} className="text-xs font-medium uppercase tracking-wide text-[var(--ink-soft)] hover:text-[var(--ink)]">
              Dashboard
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <>
              <span className="hidden text-xs font-semibold text-[var(--ink)] sm:inline">{user.name.split(' ')[0]}</span>
              <button onClick={doLogout} className="btn btn-light btn-sm hidden sm:inline-flex"><LogOut size={13} /> Log out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="hidden text-xs font-semibold text-[var(--ink)] sm:inline">Log in</Link>
              <SkeuoButton to="/apply" size="sm" className="hidden sm:inline-flex">Apply</SkeuoButton>
            </>
          )}
          <button aria-label="Menu" onClick={() => setOpen((v) => !v)} className="glass flex h-9 w-10 items-center justify-center rounded-lg md:hidden">
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="glass mt-2 flex flex-col gap-1 rounded-2xl p-3 md:hidden">
          {LINKS.map((l) => (
            <Link key={l.label} to={l.to} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium uppercase tracking-wide text-[var(--ink)] hover:bg-white/40">
              {l.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link to={DASH[user.role]} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium uppercase tracking-wide text-[var(--ink)] hover:bg-white/40">Dashboard</Link>
              <button onClick={() => { setOpen(false); doLogout() }} className="btn btn-light btn-sm mt-1"><LogOut size={13} /> Log out</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium uppercase tracking-wide text-[var(--ink)] hover:bg-white/40">Log in</Link>
              <SkeuoButton to="/apply" size="sm" className="mt-1">Apply</SkeuoButton>
            </>
          )}
        </div>
      )}
    </div>
  )
}
