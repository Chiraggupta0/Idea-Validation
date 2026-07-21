import { Link } from 'react-router-dom'
import { Rocket } from 'lucide-react'

/* Brand logos (lucide dropped these) as inline single-path SVGs. */
function BrandIcon({ path }) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
      <path d={path} />
    </svg>
  )
}
const ICONS = {
  github: 'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12',
  instagram: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069M12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0m0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324M12 16a4 4 0 110-8 4 4 0 010 8m6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881',
  linkedin: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
  youtube: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
  x: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
}

/* Internal links use react-router <Link>; external/mailto use <a>. Every link
   here resolves to a real route, the repo, a platform, or an email. */
const COLS = [
  {
    head: 'Product',
    links: [
      { label: 'Validate an idea', to: '/validate' },
      { label: 'Showcase', to: '/showcase' },
      { label: 'Events', to: '/events' },
      { label: 'Dashboard', to: '/student' },
    ],
  },
  {
    head: 'Resources',
    links: [
      { label: 'Resource library', to: '/resources' },
      { label: 'Grants & schemes', to: '/opportunities' },
      { label: 'Help & guide', to: '/student/help' },
      { label: 'Apply', to: '/apply' },
    ],
  },
  {
    head: 'Company',
    links: [
      { label: 'Home', to: '/' },
      { label: 'Log in', to: '/login' },
      { label: 'Admin', to: '/admin' },
      { label: 'Contact', href: 'mailto:hello@sivp.in' },
    ],
  },
]

// TODO: swap these placeholders for your real handles.
const SOCIALS = [
  { label: 'GitHub', href: 'https://github.com/Chiraggupta0/Idea-Validation', icon: 'github' },
  { label: 'Instagram', href: 'https://instagram.com', icon: 'instagram' },
  { label: 'LinkedIn', href: 'https://linkedin.com', icon: 'linkedin' },
  { label: 'YouTube', href: 'https://youtube.com', icon: 'youtube' },
  { label: 'X', href: 'https://x.com', icon: 'x' },
]

function FooterLink({ link }) {
  const cls = 'text-sm text-slate-400 transition-colors hover:text-white'
  return link.to
    ? <Link to={link.to} className={cls}>{link.label}</Link>
    : <a href={link.href} className={cls}>{link.label}</a>
}

export default function Footer() {
  return (
    <footer className="mt-16 bg-[#0b1220] text-slate-300">
      <div className="mx-auto max-w-6xl px-6 py-14 md:px-10">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--blue)] text-white">
                <Rocket size={18} />
              </span>
              <span className="font-display text-xl font-bold tracking-tight text-white">SIVP</span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
              Validate your startup idea with 10 AI agents before you build — from raw idea to an
              investor-ready report in minutes.
            </p>
            <a href="mailto:hello@sivp.in" className="mt-4 inline-block text-sm font-semibold text-[var(--blue)] hover:underline">
              hello@sivp.in
            </a>
          </div>

          {/* Link columns */}
          {COLS.map((c) => (
            <div key={c.head}>
              <div className="text-sm font-bold text-white">{c.head}</div>
              <ul className="mt-4 space-y-3">
                {c.links.map((link) => (
                  <li key={link.label}><FooterLink link={link} /></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col-reverse items-center justify-between gap-4 px-6 py-5 md:flex-row md:px-10">
          <div className="text-xs text-slate-500">
            © {new Date().getFullYear()} SIVP · All rights reserved · Version 1.0.0
          </div>
          <div className="flex items-center gap-2.5">
            {SOCIALS.map(({ label, href, icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-slate-300 transition-colors hover:bg-[var(--blue)] hover:text-white"
              >
                <BrandIcon path={ICONS[icon]} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
