/**
 * API Input/Output Validation Schemas (Zod)
 *
 * Validates API request query parameters and body payloads
 * Exports TypeScript types alongside schemas for type safety
 */

import { z } from 'zod';

/**
 * GET /api/reports query parameters
 *
 * Filters:
 * - track: Filter by report track (Produkter, Landskap, Portefølje)
 * - period: Filter by YYYY-MM period
 * - productId: Filter by related product ID
 */
export const GetReportsQuerySchema = z.object({
  track: z.enum(['Produkter', 'Landskap', 'Portefølje']).optional(),
  period: z.string().regex(/^\d{4}-\d{2}$/).optional(), // YYYY-MM format
  productId: z.string().optional(),
  relatedEntity: z.string().optional(), // Product name (alternative to productId)
});

export type GetReportsQuery = z.infer<typeof GetReportsQuerySchema>;

/**
 * GET /api/insights query parameters
 *
 * Filters:
 * - track: Filter by insight track
 * - type: Filter by insight type (Mulighet, Risiko, Trend, etc.)
 * - reportId: Filter by associated report
 * - status: Filter by portfolio status (for portfolio insights)
 * - limit: Max results to return (default: 50, max: 100)
 */
export const GetInsightsQuerySchema = z.object({
  track: z.enum(['Produkter', 'Landskap', 'Portefølje']).optional(),
  type: z.enum(['Mulighet', 'Risiko', 'Trend', 'Evidens', 'Partnerkandidat']).optional(),
  reportId: z.string().optional(),
  status: z.enum(['NEW', 'REVIEW', 'DUE_DILIGENCE', 'SIGNED', 'REJECTED']).optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
});

export type GetInsightsQuery = z.infer<typeof GetInsightsQuerySchema>;

/**
 * POST /api/chat/report/:reportId body
 *
 * Message payload for report-scoped AI chat
 */
export const ChatMessageSchema = z.object({
  message: z.string().min(1).max(2000),
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;

/**
 * POST /api/auth/login body
 *
 * Email/password authentication payload
 */
export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

/**
 * Validation helper
 *
 * Validates data against Zod schema, returns typed result or error
 *
 * Usage:
 * ```typescript
 * const result = validateSchema(GetReportsQuerySchema, req.query);
 * if (!result.success) {
 *   return res.status(400).json({ error: result.error });
 * }
 * const validatedQuery = result.data;
 * ```
 */
export function validateSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  // Format Zod errors into readable string
  const errorMessage = result.error.issues
    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    .join(', ');

  return { success: false, error: errorMessage };
}
