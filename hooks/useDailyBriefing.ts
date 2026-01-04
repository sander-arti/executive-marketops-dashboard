/**
 * React Query Hook for Daily Briefing
 *
 * Provides type-safe hook for fetching daily briefings.
 * Handles loading states, error states, and caching via React Query.
 */

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { DailyBriefing } from '../types';

/**
 * Query key factories for consistent cache keys
 */
export const dailyBriefingKeys = {
  all: ['daily-briefing'] as const,
  detail: (date?: string) => [...dailyBriefingKeys.all, date ?? 'today'] as const,
};

/**
 * Hook: Fetch daily briefing by date (defaults to today)
 *
 * Returns null if no briefing exists for the requested date (404).
 *
 * @example
 * // Fetch today's briefing
 * const { data: briefing, isLoading, error } = useDailyBriefing();
 *
 * @example
 * // Fetch briefing for specific date
 * const { data: briefing } = useDailyBriefing('2024-11-01');
 */
export function useDailyBriefing(
  date?: string
): UseQueryResult<DailyBriefing | null, Error> {
  return useQuery({
    queryKey: dailyBriefingKeys.detail(date),
    queryFn: () => api.dailyBriefing.get(date),
    // Cache for 10 minutes (briefings are static once created)
    staleTime: 10 * 60 * 1000,
    // Don't retry on 404 (expected when no briefing exists)
    retry: false,
  });
}
