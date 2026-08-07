import { useState } from 'react'
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom'
import {
  LayoutDashboard, Users, FileText, Landmark, Mail, Briefcase,
  BarChart3, ClipboardCheck, Settings, HelpCircle, LogOut, Menu, X, Rocket,
} from 'lucide-react'
import { useAuth } from '../../lib/auth'

const NAV = [
  { to: '/student', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/student/team', label: 'My Startup', icon: Rocket },
  { to: '/student/community', label: 'Community', icon: Users },
  { to: '/student/documents', label: 'Documents', icon: FileText },
  { to: '/student/schemes', label: 'Schemes & Grants', icon: Landmark },
  { to: '/student/contact', label: 'Contact', icon: Mail },
  { to: '/student/portfolio', label: 'Portfolio', icon: Briefcase },
  { to: '/student/leaderboard', label: 'Leaderboard', icon: BarChart3 },
  { to: '/student/evaluation', label: 'Evaluation', icon: ClipboardCheck },
  { to: '/student/settings', label: 'Settings', icon: Settings },
  { to: '/student/help', label: 'Help', icon: HelpCircle },
]

function NavItems({ onNavigate }) {
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-[var(--blue)] text-white'
                : 'text-[var(--ink-soft)] hover:bg-black/5 hover:text-[var(--ink)]'
            }`
          }
        >
          <Icon size={18} className="shrink-0" />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}

export default function DashLayout() {
  const { user, logout } = useAuth()
  const nav = useNavigate()
  const [open, setOpen] = useState(false)

  function doLogout() {
    logout()
    nav('/')
  }

  const initials = (user?.name || 'U').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()

  const SidebarInner = (
    <div className="flex h-full flex-col">
      <Link to="/" className="mb-6 flex items-center gap-2 px-2 font-display text-xl font-bold tracking-tight text-[var(--ink)]">
        SIVP
      </Link>
      <NavItems onNavigate={() => setOpen(false)} />
      <div className="mt-auto border-t border-black/10 pt-3">
        <div className="flex items-center gap-3 px-2 py-2">
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt="" className="h-9 w-9 rounded-full object-cover" />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--blue)] text-xs font-bold text-white">{initials}</div>
          )}
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-[var(--ink)]">{user?.name}</div>
            <div className="truncate text-xs text-[var(--muted)]">{user?.startup || 'Student'}</div>
          </div>
        </div>
        <button onClick={doLogout} className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--ink-soft)] hover:bg-black/5">
          <LogOut size={18} /> Log out
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen" style={{ background: 'var(--neu-bg, #f2eee3)' }}>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-black/10 bg-white px-4 py-3 md:hidden">
        <Link to="/" className="font-display text-lg font-bold">SIVP</Link>
        <button aria-label="Menu" onClick={() => setOpen(true)} className="rounded-lg border border-black/10 p-2"><Menu size={18} /></button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 bg-white p-4 shadow-xl">
            <button aria-label="Close" onClick={() => setOpen(false)} className="mb-2 ml-auto flex rounded-lg p-1.5 hover:bg-black/5"><X size={18} /></button>
            {SidebarInner}
          </aside>
        </div>
      )}

      <div className="mx-auto flex max-w-7xl">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-black/10 bg-white p-4 md:block">
          {SidebarInner}
        </aside>

        {/* Content */}
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 md:px-8 md:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
