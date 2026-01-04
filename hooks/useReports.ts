/**
 * React Query Hooks for Reports and Insights
 *
 * Provides type-safe hooks for fetching reports and insights from the backend.
 * Handles loading states, error states, and caching automatically via React Query.
 */

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Report, InsightItem } from '../types';

/**
 * Query key factories for consistent cache keys
 */
export const reportKeys = {
  all: ['reports'] as const,
  lists: () => [...reportKeys.all, 'list'] as const,
  list: (filters: ReportsFilters = {}) => [...reportKeys.lists(), filters] as const,
  details: () => [...reportKeys.all, 'detail'] as const,
  detail: (id: string) => [...reportKeys.details(), id] as const,
};

export const insightKeys = {
  all: ['insights'] as const,
  lists: () => [...insightKeys.all, 'list'] as const,
  list: (filters: InsightsFilters = {}) => [...insightKeys.lists(), filters] as const,
};

/**
 * Filter types
 */
export interface ReportsFilters {
  track?: 'Produkter' | 'Landskap' | 'Portefølje';
  period?: string; // YYYY-MM
  productId?: string;
  relatedEntity?: string;
}

export interface InsightsFilters {
  track?: 'Produkter' | 'Landskap' | 'Portefølje';
  type?: 'Mulighet' | 'Risiko' | 'Trend' | 'Evidens' | 'Partnerkandidat';
  reportId?: string;
  status?: 'NEW' | 'REVIEW' | 'DUE_DILIGENCE' | 'SIGNED' | 'REJECTED';
  limit?: number;
}

/**
 * Hook: Fetch list of reports with filters
 *
 * @example
 * const { data: reports, isLoading, error } = useReports({
 *   track: 'Produkter',
 *   period: '2024-10',
 *   relatedEntity: 'Proponent'
 * });
 */
export function useReports(
  filters: ReportsFilters = {}
): UseQueryResult<Report[], Error> {
  return useQuery({
    queryKey: reportKeys.list(filters),
    queryFn: () => api.reports.list(filters),
    // Cache for 5 minutes
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook: Fetch single report by ID
 *
 * @example
 * const { data: report, isLoading, error } = useReport(reportId);
 */
export function useReport(
  id: string | undefined
): UseQueryResult<Report, Error> {
  return useQuery({
    queryKey: reportKeys.detail(id!),
    queryFn: () => api.reports.get(id!),
    enabled: !!id, // Only run query if id is defined
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook: Fetch list of insights with filters
 *
 * @example
 * const { data: insights, isLoading, error } = useInsights({
 *   track: 'Produkter',
 *   type: 'Mulighet',
 *   limit: 10
 * });
 */
export function useInsights(
  filters: InsightsFilters = {}
): UseQueryResult<InsightItem[], Error> {
  return useQuery({
    queryKey: insightKeys.list(filters),
    queryFn: () => api.insights.list(filters),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook: Fetch insights for a specific report
 *
 * @example
 * const { data: reportInsights, isLoading } = useReportInsights(reportId);
 */
export function useReportInsights(
  reportId: string | undefined,
  limit: number = 50
): UseQueryResult<InsightItem[], Error> {
  return useInsights({
    reportId,
    limit,
  });
}
