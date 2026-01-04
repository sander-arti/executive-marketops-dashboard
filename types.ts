
export enum Track {
  PRODUCT = 'Produkter',
  LANDSCAPE = 'Landskap',
  PORTFOLIO = 'Portefølje',
}

export enum InsightType {
  OPPORTUNITY = 'Mulighet',
  RISK = 'Risiko',
  TREND = 'Trend',
  EVIDENCE = 'Evidens',
  PARTNER = 'Partnerkandidat',
}

export type PortfolioStatus = 'NEW' | 'REVIEW' | 'DUE_DILIGENCE' | 'SIGNED' | 'REJECTED';

export interface Source {
  title: string;
  url: string;
  publisher: string;
  publishedAt: string;
}

export interface InsightScores {
  impact: number;
  risk: number;
  credibility: number;
}

export interface InsightItem {
  id: string;
  title: string;
  type: InsightType;
  track: Track;
  relatedProducts: string[];
  markets: string[];
  scores: InsightScores;
  whyBullets: string[];
  recommendedNextSteps: string[];
  sources: Source[];
  createdAt: string;
  significanceScore: number;
  fitScore?: number;
  status?: PortfolioStatus;
}

// Media Intelligence Types
export interface MediaMention {
    id: string;
    title: string;
    source: string;
    date: string;
    url: string;
    sentiment: 'positive' | 'neutral' | 'negative';
    snippet: string;
}

// Financial Data Types
export interface FinancialMetric {
    productId: string;
    period: string; // YYYY-MM
    revenue: number; // MNOK
    marketShare: number; // Percentage
    targetRevenue: number;
    mediaMentions?: MediaMention[]; // New field for media coverage
}

// New Report Structure
export interface ReportSection {
    title: string;
    content: string; // Markdown-like text
}

export interface Report {
    id: string;
    title: string;
    date: string; // YYYY-MM
    track: Track;
    relatedEntity?: string; // Product name or 'General'
    summary: string;
    score: number; // 0-100 Health/Opportunity score
    trend: 'up' | 'down' | 'stable';
    keyInsights: InsightItem[]; // The raw signals backing this report
    aiSummary: string; // Pre-generated AI summary
    sections: ReportSection[]; // Full deep dive content
}

// UI State Types
export type ViewState = 'home' | 'product' | 'landscape' | 'portfolio' | 'oracle' | 'settings';
