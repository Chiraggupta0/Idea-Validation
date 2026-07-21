/**
 * Maps the raw NEXUS pipeline response (one key per agent) onto the flat shape
 * the report pages render — the same shape as SAMPLE_REPORT.
 *
 * Raw shape: { idea, visionAI, marketMind, rivalScope, buildIQ, swotify,
 *              growthIQ, fundIQ, mentorAI, incubaTrack, reportForge }
 */

/** n8n sometimes passes an unresolved expression through as literal text. */
function clean(v) {
  if (typeof v !== 'string') return v ?? ''
  const t = v.trim()
  if (/^\{\{.*\}\}$/.test(t)) return ''
  if (t === 'undefined' || t === 'null') return ''
  return t
}

/**
 * Drops redundant lead-in words ("Estimate:", "Approximately", …) so figure
 * values stay compact in the metric tiles. The label + sub already say these
 * are estimates, so removing the prefix loses no meaning.
 */
function tighten(text) {
  if (typeof text !== 'string') return text
  return text.replace(/^\s*(estimated|estimate:|approximately|around|roughly|about)\s*/i, '').trim()
}

/**
 * Keeps figures in Indian Rupees only. Agents often append a USD conversion
 * like "(~ $1.25 billion USD)" and a redundant "(INR)" tag — strip both so the
 * app shows a single ₹ figure.
 */
function inr(text) {
  if (typeof text !== 'string') return text
  return text
    .replace(/\s*\([^)]*\$[^)]*\)/g, '') // drop any parenthetical containing "$"
    .replace(/\s*\(INR\)/gi, '')
    .replace(/\s+([.,])/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

/** clean → strip USD → drop lead-in words, for all money fields. */
function money(v) {
  return tighten(inr(clean(v)))
}

/** Reads a key tolerantly — NEXUS has emitted `"startupName "` with a trailing space. */
function loose(obj, key) {
  if (!obj) return ''
  if (obj[key] !== undefined) return clean(obj[key])
  const hit = Object.keys(obj).find((k) => k.trim() === key)
  return hit ? clean(obj[hit]) : ''
}

/** "$10 billion USD" -> 10000 (millions). Returns null when nothing parseable. */
function toMillions(text) {
  if (typeof text !== 'string') return null
  const m = text.replace(/,/g, '').match(/([\d.]+)\s*(billion|bn|million|mn|m|k|thousand|crore|lakh)?/i)
  if (!m) return null
  const n = parseFloat(m[1])
  if (Number.isNaN(n)) return null
  switch ((m[2] || '').toLowerCase()) {
    case 'billion':
    case 'bn':
      return n * 1000
    case 'crore':
      return n * 10 // ~₹10M per crore, rough
    case 'lakh':
      return n * 0.1
    case 'k':
    case 'thousand':
      return n / 1000
    default:
      return n // million / mn / m / bare
  }
}

const SCORE_ROWS = [
  { key: 'marketPotential', label: 'Market potential', weight: 25 },
  { key: 'competitionLevel', label: 'Competition', weight: 20 },
  { key: 'revenuePotential', label: 'Revenue potential', weight: 20 },
  { key: 'scalability', label: 'Scalability', weight: 20 },
  { key: 'innovationScore', label: 'Innovation', weight: 15 },
]

function categoryFor(score) {
  if (score <= 40) return 'Weak · 0–40'
  if (score <= 60) return 'Moderate · 41–60'
  if (score <= 80) return 'Good · 61–80'
  return 'Investor ready · 81–100'
}

export function normalizeReport(raw) {
  if (!raw || typeof raw !== 'object') return null

  const idea = raw.idea || {}
  const vision = raw.visionAI || {}
  const market = raw.marketMind || {}
  const swot = raw.swotify || {}
  const fund = raw.fundIQ || {}
  const forge = raw.reportForge || {}

  // Market sizing: values stay as the model wrote them; bar widths are derived
  // from the parsed magnitudes, scaled against TAM.
  const tamM = toMillions(market.tam)
  const samM = toMillions(market.sam)
  const somM = toMillions(market.som)
  const pct = (v) => (tamM && v ? Math.max(1, Math.round((v / tamM) * 100)) : 0)

  const readiness = Number(fund.investorReadinessScore) || 0
  const breakdown = fund.scoreBreakdown || {}

  const marketNote = [market.growthRate && `Growth ${market.growthRate}`, market.marketSaturation && `${market.marketSaturation} saturation`, market.marketEntryDifficulty && `${market.marketEntryDifficulty} entry difficulty`]
    .filter(Boolean)
    .join(' · ')

  return {
    __live: true,

    startupName: loose(idea, 'startupName') || 'Your startup',
    industry: loose(idea, 'industry') || clean(vision.industry),
    geographicMarket: loose(idea, 'geographicMarket') || clean(market.geographicPotential),
    validatedAt: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),

    investorReadinessScore: readiness,
    readinessCategory: clean(fund.readinessCategory) || categoryFor(readiness),
    validationScore: Number(vision.validationScore) || 0,
    pmfScore: Number(vision.pmfScore) || 0,
    successProbability: Number(fund.successProbability) || 0,

    fundingRequirement: money(fund.fundingRequirement) || '—',
    valuation: money(fund.valuation) || '—',
    burnRate: money(fund.burnRate) || '—',

    tam: money(market.tam) || '—',
    sam: money(market.sam) || '—',
    som: money(market.som) || '—',
    tamPct: tamM ? 100 : 0,
    samPct: pct(samM),
    somPct: pct(somM),
    marketNote: inr(marketNote || clean(market.industryOverview)),

    scoreBreakdown: SCORE_ROWS.map((r) => ({
      label: r.label,
      weight: r.weight,
      value: Number(breakdown[r.key]) || 0,
    })),

    swot: {
      strengths: swot.strengths || [],
      weaknesses: swot.weaknesses || [],
      opportunities: swot.opportunities || [],
      threats: swot.threats || [],
    },

    // FundIQ returns prose, not a numeric series — the chart is skipped and the
    // text shown instead rather than inventing a five-year curve.
    revenueForecast: [],
    revenueForecastText: inr(clean(fund.revenueForecast)),

    executiveSummary: inr(clean(forge.executiveSummary) || clean(vision.verdict)),
  }
}
