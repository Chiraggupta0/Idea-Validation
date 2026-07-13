import { Link, useLocation } from 'react-router-dom'

const TABS = [
  { label: 'Overview', to: '/report' },
  { label: 'Market', to: '/report/market' },
  { label: 'Financials', to: '/report/financials' },
  { label: 'SWOT', to: '/report/swot' },
]

export default function ReportTabs() {
  const { pathname } = useLocation()
  return (
    <div className="glass mb-8 flex w-fit max-w-full gap-1.5 overflow-x-auto rounded-xl p-1.5">
      {TABS.map((t) => {
        const active = pathname === t.to
        return (
          <Link
            key={t.label}
            to={t.to}
            className={`whitespace-nowrap rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
              active ? 'bg-[var(--ink)] text-white' : 'text-[var(--ink-soft)] hover:text-[var(--ink)]'
            }`}
          >
            {t.label}
          </Link>
        )
      })}
    </div>
  )
}
