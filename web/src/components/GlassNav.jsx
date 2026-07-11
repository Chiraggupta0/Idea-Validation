import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import SkeuoButton from './SkeuoButton'

const LINKS = [
  { label: 'Product', href: '#product' },
  { label: 'Agents', href: '#agents' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Docs', href: '#docs' },
]

export default function GlassNav() {
  const [open, setOpen] = useState(false)
  return (
    <div className="sticky top-4 z-50 mx-auto w-full max-w-6xl px-4">
      <nav className="glass flex items-center justify-between rounded-2xl px-5 py-3">
        <Link to="/" className="font-display text-lg font-bold tracking-tight text-[var(--ink)]">
          SIVP
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-xs font-medium uppercase tracking-wide text-[var(--ink-soft)] hover:text-[var(--ink)]"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link to="/validate" className="hidden text-xs font-semibold text-[var(--ink)] sm:inline">
            Log in
          </Link>
          <SkeuoButton to="/validate" size="sm" className="hidden sm:inline-flex">
            Get started
          </SkeuoButton>
          <button
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
            className="glass flex h-9 w-10 items-center justify-center rounded-lg md:hidden"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="glass mt-2 flex flex-col gap-1 rounded-2xl p-3 md:hidden">
          {LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium uppercase tracking-wide text-[var(--ink)] hover:bg-white/40"
            >
              {l.label}
            </a>
          ))}
          <SkeuoButton to="/validate" size="sm" className="mt-1">
            Get started
          </SkeuoButton>
        </div>
      )}
    </div>
  )
}
