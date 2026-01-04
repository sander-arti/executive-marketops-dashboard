/**
 * React Query Hook for Report-Scoped Chat
 *
 * Provides mutation hook for sending chat messages to AI assistant.
 * Scoped to a specific report for context-aware responses with source citations.
 */

import { useMutation } from '@tanstack/react-query';
import { api, type ChatResponse } from '../lib/api';

/**
 * Hook for report-scoped AI chat
 *
 * @param reportId - ID of the report to chat about
 * @returns Mutation object with `mutate` function and loading/error states
 *
 * @example
 * const chat = useReportChat(reportId);
 *
 * const handleSend = (message: string) => {
 *   chat.mutate(message, {
 *     onSuccess: (response) => {
 *       console.log(response.answer);
 *       console.log(response.sources);
 *     },
 *     onError: (error) => {
 *       console.error('Chat failed:', error);
 *     },
 *   });
 * };
 */
export function useReportChat(reportId: string) {
  return useMutation<ChatResponse, Error, string>({
    mutationFn: (message: string) => api.chat.reportChat(reportId, message),
  });
}
