/**
 * React Query Hooks for Action Items
 *
 * Provides type-safe hooks for CRUD operations on action items.
 * Handles loading states, error states, caching, and optimistic updates via React Query.
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from '@tanstack/react-query';
import { api } from '../lib/api';
import type { ActionItem } from '../types';

/**
 * Query key factories for consistent cache keys
 */
export const actionItemKeys = {
  all: ['action-items'] as const,
  lists: () => [...actionItemKeys.all, 'list'] as const,
  list: (filters: ActionItemsFilters = {}) => [...actionItemKeys.lists(), filters] as const,
};

/**
 * Filter types
 */
export interface ActionItemsFilters {
  completed?: boolean;
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
}

/**
 * Hook: Fetch list of action items with filters
 *
 * @example
 * const { data: actionItems, isLoading, error } = useActionItems({
 *   completed: false,
 *   priority: 'HIGH'
 * });
 */
export function useActionItems(
  filters: ActionItemsFilters = {}
): UseQueryResult<ActionItem[], Error> {
  return useQuery({
    queryKey: actionItemKeys.list(filters),
    queryFn: () => api.actionItems.list(filters),
    // Cache for 2 minutes (action items change more frequently than reports)
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook: Create new action item
 *
 * @example
 * const createActionItem = useCreateActionItem();
 * createActionItem.mutate({
 *   title: 'Review Q4 budget',
 *   priority: 'HIGH',
 *   dueDate: '2024-12-01T00:00:00Z'
 * });
 */
export function useCreateActionItem(): UseMutationResult<
  ActionItem,
  Error,
  {
    title: string;
    description?: string;
    priority?: 'HIGH' | 'MEDIUM' | 'LOW';
    dueDate?: string;
  }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.actionItems.create(data),
    onSuccess: () => {
      // Invalidate all action items queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: actionItemKeys.all });
    },
  });
}

/**
 * Hook: Update existing action item
 *
 * @example
 * const updateActionItem = useUpdateActionItem();
 * updateActionItem.mutate({
 *   id: 'action-123',
 *   data: { completed: true }
 * });
 */
export function useUpdateActionItem(): UseMutationResult<
  ActionItem,
  Error,
  {
    id: string;
    data: {
      completed?: boolean;
      priority?: 'HIGH' | 'MEDIUM' | 'LOW';
      title?: string;
      description?: string;
      dueDate?: string;
    };
  }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => api.actionItems.update(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: actionItemKeys.all });

      // Snapshot previous value for rollback
      const previousActionItems = queryClient.getQueriesData({ queryKey: actionItemKeys.all });

      // Optimistically update cached data
      queryClient.setQueriesData<ActionItem[]>({ queryKey: actionItemKeys.lists() }, (old) => {
        if (!old) return old;
        return old.map((item) =>
          item.id === id ? { ...item, ...data } : item
        );
      });

      return { previousActionItems };
    },
    onError: (_error, _variables, context) => {
      // Rollback on error
      if (context?.previousActionItems) {
        context.previousActionItems.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: actionItemKeys.all });
    },
  });
}
