export interface ScoreMetric {
  label: string
  weight: number
  value: number
}

export interface Swot {
  strengths: string[]
  weaknesses: string[]
  opportunities: string[]
  threats: string[]
}

export interface RevenuePoint {
  year: string
  revenue: number
}

export interface SivpReport {
  startupName: string
  industry: string
  geographicMarket: string
  validatedAt: string
  investorReadinessScore: number
  readinessCategory: string
  validationScore: number
  pmfScore: number
  successProbability: number
  fundingRequirement: string
  valuation: string
  burnRate: string
  tam: string
  sam: string
  som: string
  tamPct: number
  samPct: number
  somPct: number
  marketNote: string
  scoreBreakdown: ScoreMetric[]
  swot: Swot
  revenueForecast: RevenuePoint[]
  executiveSummary: string
}

/** The 7-field idea submission (Module 2) */
export interface IdeaInput {
  startupName: string
  industry: string
  problemStatement: string
  solution: string
  targetAudience: string
  geographicMarket: string
  description: string
}
