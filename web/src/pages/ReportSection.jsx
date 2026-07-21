import { useParams, Link, Navigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import GlassNav from '../components/GlassNav'
import FadeUp from '../components/FadeUp'
import ReportTabs from '../components/report/ReportTabs'
import { MarketBars, ScoreBreakdown } from '../components/report/Bars'
import RevenueChart from '../components/report/RevenueChart'
import SwotGrid from '../components/report/SwotGrid'
import { useReport } from '../lib/useReport'

const VALID = ['market', 'financials', 'swot']

function Metric({ label, value, sub }) {
  // Live pipeline values can be a full sentence; drop long ones to a smaller
  // wrapping size so the card keeps its shape instead of ballooning.
  const long = typeof value === 'string' && value.length > 16
  const valueClass = long
    ? 'text-base leading-snug'
    : 'text-3xl tracking-tight'
  return (
    <div className="neu flex flex-col p-5">
      <div className="text-xs font-medium text-[var(--muted)]">{label}</div>
      <div className={`mt-1 font-display font-bold ${valueClass}`}>{value}</div>
      {sub && <div className="mt-auto pt-1 text-xs text-[var(--muted)]">{sub}</div>}
    </div>
  )
}

export default function ReportSection() {
  const { section } = useParams()
  const { report: r } = useReport()

  if (!VALID.includes(section)) return <Navigate to="/report" replace />

  const titles = {
    market: 'Market analysis',
    financials: 'Financials & investor readiness',
    swot: 'SWOT analysis',
  }
  const agents = { market: 'MarketMind', financials: 'FundIQ', swot: 'SWOTify' }

  return (
    <div className="min-h-screen" style={{ background: 'var(--neu-bg)' }}>
      <GlassNav />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:px-10 md:py-10">
        <ReportTabs />

        <FadeUp>
          <Link to="/report" className="eyebrow mb-3 inline-flex items-center gap-1 text-[var(--ink-soft)] hover:text-[var(--ink)]">
            <ArrowLeft size={13} /> back to {r.startupName}
          </Link>
          <div className="eyebrow">// {section} · {agents[section]}</div>
          <h1 className="display mt-2 text-3xl sm:text-4xl md:text-5xl">{titles[section]}</h1>
        </FadeUp>

        {section === 'market' && (
          <div className="mt-8 space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Metric label="TAM — total addressable" value={r.tam} sub="Whole market" />
              <Metric label="SAM — serviceable" value={r.sam} sub="Reachable segment" />
              <Metric label="SOM — obtainable" value={r.som} sub="Realistic near-term share" />
            </div>
            <FadeUp>
              <MarketBars
                rows={[
                  { label: 'TAM', value: r.tam, pct: r.tamPct },
                  { label: 'SAM', value: r.sam, pct: r.samPct },
                  { label: 'SOM', value: r.som, pct: r.somPct },
                ]}
                note={r.marketNote}
              />
            </FadeUp>
          </div>
        )}

        {section === 'financials' && (
          <div className="mt-8 space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Metric label="Funding needed" value={r.fundingRequirement} sub="Seed round" />
              <Metric label="Valuation" value={r.valuation} sub="Pre-money estimate" />
              <Metric label="Burn rate" value={r.burnRate} sub="Break-even year 3" />
            </div>
            <FadeUp><RevenueChart data={r.revenueForecast} text={r.revenueForecastText} /></FadeUp>
            <FadeUp delay={0.08}><ScoreBreakdown rows={r.scoreBreakdown} /></FadeUp>
          </div>
        )}

        {section === 'swot' && (
          <div className="mt-8">
            <FadeUp><SwotGrid swot={r.swot} /></FadeUp>
          </div>
        )}
      </div>
    </div>
  )
}
