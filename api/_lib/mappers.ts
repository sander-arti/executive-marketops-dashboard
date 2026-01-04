/**
 * DB → Frontend Type Mappers
 *
 * Converts Prisma models to frontend types
 * CRITICAL: Preserves Norwegian enum values (no transformation)
 * Maps score columns to frontend scores object structure
 */

import type { Report, Insight, Source, ActionItem as PrismaActionItem, DailyBriefing as PrismaDailyBriefing } from '@prisma/client';
import type {
  Report as APIReport,
  InsightItem,
  Source as APISource,
  ReportSection,
  Track,
  InsightType,
  InsightScores,
  PortfolioStatus,
  ActionItem,
  DailyBriefing,
} from '../../types';

// Type for Prisma Report with nested relations
type PrismaReportWithRelations = Report & {
  insights: Array<{
    insight: Insight & {
      sources: Array<{
        source: Source;
      }>;
    };
  }>;
};

// Type for Prisma Insight with nested sources
type PrismaInsightWithSources = Insight & {
  sources: Array<{
    source: Source;
  }>;
};

/**
 * Maps Prisma Source to frontend Source type
 */
export function mapSourceToAPI(source: Source): APISource {
  return {
    title: source.title,
    url: source.url,
    publisher: source.publisher,
    publishedAt: source.publishedAt.toISOString(),
  };
}

/**
 * Maps Prisma Insight to frontend InsightItem type
 *
 * CRITICAL: Norwegian enums are preserved as-is from DB
 * Converts separate score columns to scores object
 */
export function mapInsightToAPI(
  insight: PrismaInsightWithSources
): InsightItem {
  // Map scores: DB columns → frontend object
  const scores: InsightScores = {
    impact: insight.impactScore,
    risk: insight.riskScore,
    credibility: insight.credibilityScore,
  };

  return {
    id: insight.id,
    title: insight.title,
    type: insight.type as InsightType, // Norwegian enum value (e.g., 'Mulighet')
    track: insight.track as Track, // Norwegian enum value (e.g., 'Produkter')
    relatedProducts: insight.relatedProducts,
    markets: insight.markets,
    scores,
    whyBullets: insight.whyBullets,
    recommendedNextSteps: insight.recommendedNextSteps,
    sources: insight.sources.map(({ source }) => mapSourceToAPI(source)),
    createdAt: insight.createdAt.toISOString(),
    significanceScore: insight.significanceScore,
    fitScore: insight.fitScore ?? undefined,
    status: insight.status ? (insight.status as PortfolioStatus) : undefined,
  };
}

/**
 * Maps Prisma Report to frontend Report type
 *
 * CRITICAL: Norwegian enums preserved
 * Converts ReportInsight[] join table to keyInsights: InsightItem[]
 */
export function mapReportToAPI(
  report: PrismaReportWithRelations
): APIReport {
  return {
    id: report.id,
    title: report.title,
    date: report.date, // Already YYYY-MM string format
    track: report.track as Track, // Norwegian enum (e.g., 'Produkter')
    relatedEntity: report.relatedEntity ?? undefined,
    summary: report.summary,
    score: report.score,
    trend: report.trend as 'up' | 'down' | 'stable',
    keyInsights: report.insights.map(({ insight }) => mapInsightToAPI(insight)),
    aiSummary: report.aiSummary,
    sections: report.sections as unknown as ReportSection[], // JSON → typed array
  };
}

/**
 * Maps Prisma ActionItem to frontend ActionItem type
 */
export function mapActionItemToAPI(item: PrismaActionItem): ActionItem {
  return {
    id: item.id,
    title: item.title,
    description: item.description ?? undefined,
    priority: item.priority as 'HIGH' | 'MEDIUM' | 'LOW',
    completed: item.completed,
    dueDate: item.dueDate?.toISOString(),
    createdAt: item.createdAt.toISOString(),
  };
}

/**
 * Maps Prisma DailyBriefing to frontend DailyBriefing type
 */
export function mapDailyBriefingToAPI(briefing: PrismaDailyBriefing): DailyBriefing {
  return {
    id: briefing.id,
    date: briefing.date.toISOString().split('T')[0], // YYYY-MM-DD
    content: briefing.content as unknown as DailyBriefing['content'],
    totalUpdates: briefing.totalUpdates,
    requiresAttentionCount: briefing.requiresAttentionCount,
  };
}
