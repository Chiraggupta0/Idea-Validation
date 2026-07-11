const COLS = [
  { head: 'Product', items: ['Features', 'AI agents', 'Pricing', 'Dashboard'] },
  { head: 'Company', items: ['About', 'Docs', 'API', 'Contact'] },
  { head: 'Legal', items: ['Privacy', 'Terms', 'Security'] },
  { head: 'Social', items: ['GitHub', 'LinkedIn', 'Twitter'] },
]

export default function Footer() {
  return (
    <footer className="border-t-2 border-[var(--ink)] px-6 py-12 md:px-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 md:flex-row md:justify-between">
        <div>
          <div className="font-display text-2xl font-bold">SIVP</div>
          <p className="eyebrow mt-2 text-[var(--ink-soft)]">// validate before you build</p>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {COLS.map((c) => (
            <div key={c.head}>
              <div className="eyebrow mb-3">{c.head}</div>
              <ul className="space-y-2">
                {c.items.map((i) => (
                  <li key={i} className="text-sm text-[var(--ink-soft)] hover:text-[var(--ink)]">
                    {i}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="mx-auto mt-10 max-w-6xl border-t-2 border-[var(--ink)] pt-4 text-xs text-[var(--muted)]">
        © 2026 SIVP · Startup Idea Validation Platform · Built with 10 AI agents + NEXUS
      </div>
    </footer>
  )
}
