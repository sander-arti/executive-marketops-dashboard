/**
 * API Middleware - Auth & CORS
 *
 * Provides reusable middleware functions for Vercel serverless functions:
 * - JWT validation (Supabase Auth)
 * - CORS headers (dev + prod origins)
 * - Error handling
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createSupabaseClient } from './supabase';
import { prisma } from './prisma';

/**
 * CORS headers for API responses
 * Allows localhost (dev) and Vercel domains (prod)
 */
export function corsHeaders(origin?: string): Record<string, string> {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173', // Vite dev server alternative port
    ...(process.env.VITE_SUPABASE_URL ? [process.env.VITE_SUPABASE_URL] : []),
  ];

  // In production, allow Vercel preview/production domains
  if (process.env.VERCEL_URL) {
    allowedOrigins.push(`https://${process.env.VERCEL_URL}`);
  }

  const corsOrigin = origin && allowedOrigins.includes(origin)
    ? origin
    : allowedOrigins[0];

  return {
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400', // 24 hours
  };
}

/**
 * Auth context injected into requests by withAuth middleware
 */
export interface AuthContext {
  userId: string;
  workspaceId: string;
  supabaseUserId: string;
}

/**
 * API handler with auth context
 */
export type AuthenticatedHandler = (
  req: VercelRequest,
  res: VercelResponse,
  auth: AuthContext
) => Promise<void> | void;

/**
 * Auth middleware wrapper
 *
 * Validates Supabase JWT from Authorization header
 * Extracts userId and workspaceId from database
 * Injects auth context into handler
 *
 * Returns 401 if:
 * - No Authorization header
 * - Invalid JWT
 * - User not found in database
 *
 * Usage:
 * ```typescript
 * export default withAuth(async (req, res, auth) => {
 *   // auth.userId, auth.workspaceId available
 * });
 * ```
 */
export function withAuth(handler: AuthenticatedHandler) {
  return async (req: VercelRequest, res: VercelResponse) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      res.status(200).setHeader('Access-Control-Allow-Origin', corsHeaders(req.headers.origin as string)['Access-Control-Allow-Origin']);
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      return res.end();
    }

    // Set CORS headers
    const headers = corsHeaders(req.headers.origin as string);
    Object.entries(headers).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    try {
      // Extract JWT from Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Missing or invalid Authorization header',
        });
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      // Verify JWT with Supabase
      const supabase = createSupabaseClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);

      if (authError || !user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid or expired token',
        });
      }

      // Lookup user in database to get workspace
      const dbUser = await prisma.user.findUnique({
        where: { supabaseId: user.id },
        select: {
          id: true,
          workspaceId: true,
        },
      });

      if (!dbUser) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'User not found in database',
        });
      }

      // Inject auth context and call handler
      const authContext: AuthContext = {
        userId: dbUser.id,
        workspaceId: dbUser.workspaceId,
        supabaseUserId: user.id,
      };

      await handler(req, res, authContext);

    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Authentication failed',
      });
    }
  };
}

/**
 * Error response helper
 * Standardizes error responses across API
 */
export function errorResponse(
  res: VercelResponse,
  statusCode: number,
  error: string,
  message?: string
) {
  return res.status(statusCode).json({
    error,
    message: message ?? error,
  });
}
