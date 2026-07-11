import { Download } from 'lucide-react'
import GlassNav from '../components/GlassNav'
import Footer from '../components/Footer'
import FadeUp from '../components/FadeUp'
import ScoreGauge from '../components/report/ScoreGauge'
import { MarketBars, ScoreBreakdown } from '../components/report/Bars'
import RevenueChart from '../components/report/RevenueChart'
import SwotGrid from '../components/report/SwotGrid'
import { SAMPLE_REPORT as r } from '../lib/sampleReport'

const TABS = ['Overview', 'Market', 'Financials', 'SWOT']

function Stat({ label, value, sub }) {
  return (
    <div className="neu-sm p-4">
      <div className="text-xs font-medium text-[var(--muted)]">{label}</div>
      <div className="mt-1 font-display text-3xl font-bold tracking-tight">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-[var(--muted)]">{sub}</div>}
    </div>
  )
}

export default function Report() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--neu-bg)' }}>
      <GlassNav />

      <div className="mx-auto max-w-6xl px-6 py-10 md:px-10">
        {/* Floating glass tab bar */}
        <div className="glass mb-8 flex w-fit gap-1.5 rounded-xl p-1.5">
          {TABS.map((t, i) => (
            <a
              key={t}
              href={`#${t.toLowerCase()}`}
              className={`rounded-lg px-4 py-2 text-xs font-semibold ${
                i === 0 ? 'bg-[var(--ink)] text-white' : 'text-[var(--ink-soft)]'
              }`}
            >
              {t}
            </a>
          ))}
        </div>

        {/* Header */}
        <FadeUp>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="eyebrow">// validation report · {r.validatedAt}</div>
              <h1 className="display mt-2 text-4xl md:text-5xl">{r.startupName}</h1>
              <p className="mt-1 text-sm text-[var(--ink-soft)]">
                {r.industry} · {r.geographicMarket}
              </p>
            </div>
            <div className="flex gap-2">
              {['PDF', 'DOCX', 'PPTX'].map((x) => (
                <button key={x} className="btn btn-light btn-sm">
                  <Download size={13} /> {x}
                </button>
              ))}
            </div>
          </div>
        </FadeUp>

        {/* Scores */}
        <section id="overview" className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-[230px_1fr]">
          <FadeUp>
            <ScoreGauge score={r.investorReadinessScore} category={r.readinessCategory} />
          </FadeUp>
          <FadeUp delay={0.08}>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Stat label="Validation" value={String(r.validationScore)} sub="Worth pursuing" />
              <Stat label="PMF" value={String(r.pmfScore)} sub="Strong demand" />
              <Stat label="Success" value={`${r.successProbability}%`} sub="Moderate risk" />
              <Stat label="Funding" value={r.fundingRequirement} sub="Seed · 18–24 mo" />
              <Stat label="Valuation" value={r.valuation} sub="Pre-money" />
              <Stat label="Burn" value={r.burnRate} sub="Break-even Y3" />
            </div>
          </FadeUp>
        </section>

        {/* Market + breakdown */}
        <section id="market" className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
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
          <FadeUp delay={0.08}>
            <ScoreBreakdown rows={r.scoreBreakdown} />
          </FadeUp>
        </section>

        {/* Financials */}
        <section id="financials" className="mt-6">
          <FadeUp>
            <RevenueChart data={r.revenueForecast} />
          </FadeUp>
        </section>

        {/* SWOT */}
        <section id="swot" className="mt-8">
          <FadeUp>
            <SwotGrid swot={r.swot} />
          </FadeUp>
        </section>

        {/* Executive summary */}
        <section className="mt-8">
          <FadeUp>
            <div className="eyebrow mb-3">// executive summary · ReportForge</div>
            <div className="brutal p-6">
              <p className="text-sm leading-relaxed text-[var(--ink-soft)]">{r.executiveSummary}</p>
            </div>
          </FadeUp>
        </section>
      </div>

      <Footer />
    </div>
  )
}
