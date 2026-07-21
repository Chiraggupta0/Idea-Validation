import { Download, Info } from 'lucide-react'
import GlassNav from '../components/GlassNav'
import Footer from '../components/Footer'
import FadeUp from '../components/FadeUp'
import ScoreGauge from '../components/report/ScoreGauge'
import { MarketBars, ScoreBreakdown } from '../components/report/Bars'
import RevenueChart from '../components/report/RevenueChart'
import SwotGrid from '../components/report/SwotGrid'
import ReportTabs from '../components/report/ReportTabs'
import { useReport } from '../lib/useReport'
import { exportPDF, exportDOCX, exportPPTX } from '../lib/export'

function Stat({ label, value, sub }) {
  // Sample values are terse ("$3M–$6M"); live pipeline values can be a full
  // sentence. Drop to a smaller wrapping size for long ones so the tile keeps
  // its shape instead of ballooning into a headline.
  const long = typeof value === 'string' && value.length > 16
  const valueClass = long
    ? 'text-sm leading-snug'
    : 'text-2xl tracking-tight sm:text-3xl'
  return (
    <div className="neu-sm flex flex-col p-4">
      <div className="text-xs font-medium text-[var(--muted)]">{label}</div>
      <div className={`mt-1 font-display font-bold ${valueClass}`}>{value}</div>
      {sub && <div className="mt-auto pt-1 text-xs text-[var(--muted)]">{sub}</div>}
    </div>
  )
}

export default function Report() {
  const { report: r, isLive } = useReport()
  const exporters = { PDF: exportPDF, DOCX: exportDOCX, PPTX: exportPPTX }

  return (
    <div className="min-h-screen" style={{ background: 'var(--neu-bg)' }}>
      <GlassNav />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:px-10 md:py-10">
        <ReportTabs />

        {!isLive && (
          <div className="brutal-flat mb-6 flex items-start gap-2 p-3 text-xs" style={{ background: 'var(--yellow)' }}>
            <Info size={15} className="mt-0.5 shrink-0" />
            <span>Showing a <b>sample</b> report. Submit an idea and once the pipeline returns data, your real report appears here.</span>
          </div>
        )}

        {/* Header */}
        <FadeUp>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="eyebrow">// validation report · {r.validatedAt}</div>
              <h1 className="display mt-2 text-3xl sm:text-4xl md:text-5xl">{r.startupName}</h1>
              <p className="mt-1 text-sm text-[var(--ink-soft)]">
                {r.industry} · {r.geographicMarket}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {['PDF', 'DOCX', 'PPTX'].map((x) => (
                <button key={x} className="btn btn-light btn-sm" onClick={() => exporters[x](r)}>
                  <Download size={13} /> {x}
                </button>
              ))}
            </div>
          </div>
        </FadeUp>

        {/* Scores */}
        <section className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-[230px_1fr]">
          <FadeUp>
            <ScoreGauge score={r.investorReadinessScore} category={r.readinessCategory} />
          </FadeUp>
          <FadeUp delay={0.08}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
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
        <section className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
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
        <section className="mt-6">
          <FadeUp>
            <RevenueChart data={r.revenueForecast} text={r.revenueForecastText} />
          </FadeUp>
        </section>

        {/* SWOT */}
        <section className="mt-8">
          <FadeUp>
            <SwotGrid swot={r.swot} />
          </FadeUp>
        </section>

        {/* Executive summary */}
        <section className="mt-8">
          <FadeUp>
            <div className="eyebrow mb-3">// executive summary · ReportForge</div>
            <div className="brutal p-5 sm:p-6">
              <p className="text-sm leading-relaxed text-[var(--ink-soft)]">{r.executiveSummary}</p>
            </div>
          </FadeUp>
        </section>
      </div>

      <Footer />
    </div>
  )
}
