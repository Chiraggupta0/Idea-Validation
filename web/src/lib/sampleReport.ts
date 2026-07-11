import type { SivpReport } from './types'

/** Real output from the PawPair pipeline run (n8n / NEXUS). Used until the
 *  Spring Boot bridge is wired in. */
export const SAMPLE_REPORT: SivpReport = {
  startupName: 'PawPair',
  industry: 'Pet care · on-demand marketplace',
  geographicMarket: 'India (metro cities)',
  validatedAt: '8 Jul 2026',
  investorReadinessScore: 69,
  readinessCategory: 'Good · 61–80',
  validationScore: 80,
  pmfScore: 75,
  successProbability: 60,
  fundingRequirement: '$750K – $1.2M',
  valuation: '$3M – $6M',
  burnRate: '$25–35K / mo',
  tam: '$50M',
  sam: '$18M',
  som: '$2.5M',
  tamPct: 100,
  samPct: 36,
  somPct: 6,
  marketNote: 'Indian metro pet care · 15–20% CAGR · low saturation for tech-enabled services',
  scoreBreakdown: [
    { label: 'Market potential', weight: 25, value: 78 },
    { label: 'Competition', weight: 20, value: 55 },
    { label: 'Revenue potential', weight: 20, value: 80 },
    { label: 'Scalability', weight: 20, value: 85 },
    { label: 'Innovation', weight: 15, value: 62 },
  ],
  swot: {
    strengths: [
      'Verified sitters, insurance, live updates',
      'Addresses a high-severity problem',
      'Scalable commission-based marketplace',
    ],
    weaknesses: [
      'Sitter vetting and quality at scale',
      'High customer acquisition cost',
      'Missing legal and risk expertise',
    ],
    opportunities: [
      '15–20% CAGR growing market',
      'Tier-2 city expansion',
      'Vet and pet-store partnerships',
    ],
    threats: [
      'Petbacker and informal networks',
      'Building trust at scale',
      'Gig-economy regulation uncertainty',
    ],
  },
  revenueForecast: [
    { year: 'Y1', revenue: 75 },
    { year: 'Y2', revenue: 320 },
    { year: 'Y3', revenue: 750 },
    { year: 'Y4', revenue: 1450 },
    { year: 'Y5', revenue: 2600 },
  ],
  executiveSummary:
    'PawPair targets urban Indian pet owners who need trustworthy, last-minute pet care. Its differentiation — rigorously verified sitters, comprehensive insurance, and live updates on a scalable marketplace — fits a rapidly growing, largely unorganized market. Strong demand and clear positioning support high growth potential; the main risks are sitter quality at scale and acquisition cost.',
}
