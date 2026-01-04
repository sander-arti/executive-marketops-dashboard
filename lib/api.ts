/**
 * Frontend API Client
 *
 * Centralized API client for making requests to backend serverless functions.
 * Handles authentication headers, error responses, and type-safe interfaces.
 */

import type { Report, InsightItem } from '../types';

// Base URL for API requests
// In development and production, Vercel rewrites handle /api routing
const API_BASE_URL = '/api';

/**
 * Generic fetch wrapper with auth header injection
 */
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // Get auth token from localStorage (will be set by AuthContext in Phase 5)
  const token = localStorage.getItem('supabase_auth_token');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle error responses
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error || `HTTP ${response.status}: ${response.statusText}`;
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Reports API
 */
export const reportsAPI = {
  /**
   * List reports with optional filters
   */
  list: (params?: {
    track?: 'Produkter' | 'Landskap' | 'Portefølje';
    period?: string; // YYYY-MM
    productId?: string;
    relatedEntity?: string;
  }): Promise<Report[]> => {
    const queryParams = new URLSearchParams();
    if (params?.track) queryParams.set('track', params.track);
    if (params?.period) queryParams.set('period', params.period);
    if (params?.productId) queryParams.set('productId', params.productId);
    if (params?.relatedEntity) queryParams.set('relatedEntity', params.relatedEntity);

    const query = queryParams.toString();
    return fetchAPI<Report[]>(`/reports${query ? `?${query}` : ''}`);
  },

  /**
   * Get single report by ID
   */
  get: (id: string): Promise<Report> => {
    return fetchAPI<Report>(`/reports/${id}`);
  },
};

/**
 * Insights API
 */
export const insightsAPI = {
  /**
   * List insights with optional filters
   */
  list: (params?: {
    track?: 'Produkter' | 'Landskap' | 'Portefølje';
    type?: 'Mulighet' | 'Risiko' | 'Trend' | 'Evidens' | 'Partnerkandidat';
    reportId?: string;
    status?: 'NEW' | 'REVIEW' | 'DUE_DILIGENCE' | 'SIGNED' | 'REJECTED';
    limit?: number;
  }): Promise<InsightItem[]> => {
    const queryParams = new URLSearchParams();
    if (params?.track) queryParams.set('track', params.track);
    if (params?.type) queryParams.set('type', params.type);
    if (params?.reportId) queryParams.set('reportId', params.reportId);
    if (params?.status) queryParams.set('status', params.status);
    if (params?.limit) queryParams.set('limit', params.limit.toString());

    const query = queryParams.toString();
    return fetchAPI<InsightItem[]>(`/insights${query ? `?${query}` : ''}`);
  },
};

/**
 * Chat Response from AI
 */
export interface ChatResponse {
  answer: string;
  sources: Array<{
    id: string;
    title: string;
    url?: string;
    type: string;
  }>;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
}

/**
 * Chat API (AI Assistant)
 */
export const chatAPI = {
  /**
   * Send a message to the report-scoped AI assistant
   */
  reportChat: (reportId: string, message: string): Promise<ChatResponse> => {
    return fetchAPI<ChatResponse>(`/chat/report/${reportId}`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  },
};

/**
 * Combined API object (for easier imports)
 */
export const api = {
  reports: reportsAPI,
  insights: insightsAPI,
  chat: chatAPI,
};
