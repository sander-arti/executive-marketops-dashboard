/**
 * API Middleware - Auth & CORS (Next.js Route Handlers version)
 *
 * Provides reusable middleware functions for Next.js API routes:
 * - JWT validation (Supabase Auth)
 * - CORS headers (dev + prod origins)
 * - Error handling
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from './supabase';
import { prisma } from './prisma';

/**
 * CORS headers for API responses
 * Allows localhost (dev) and Vercel domains (prod)
 */
export function corsHeaders(origin?: string): Record<string, string> {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3007',
    'http://localhost:5173', // Vite dev server alternative port
    ...(process.env.NEXT_PUBLIC_SUPABASE_URL ? [process.env.NEXT_PUBLIC_SUPABASE_URL] : []),
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
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
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
  params?: Record<string, string | string[]>;
}

/**
 * Route context type from Next.js (for dynamic routes)
 * In Next.js 15, params is always a Promise (even if empty object for non-dynamic routes)
 */
export interface RouteContext {
  params: Promise<Record<string, string | string[]>>;
}

/**
 * API handler with auth context
 * Now uses Next.js types instead of Vercel types
 */
export type AuthenticatedHandler = (
  req: NextRequest,
  context: AuthContext
) => Promise<NextResponse>;

/**
 * Auth middleware wrapper (Next.js version)
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
 * export const GET = withAuth(async (req, context) => {
 *   // context.userId, context.workspaceId available
 *   // context.params for dynamic routes (e.g., [id])
 * });
 * ```
 */
export function withAuth(handler: AuthenticatedHandler) {
  return async (
    req: NextRequest,
    routeContext: RouteContext
  ): Promise<NextResponse> => {
    const origin = req.headers.get('origin') || '';
    const headers = corsHeaders(origin);

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers,
      });
    }

    try {
      // Extract JWT from Authorization header
      const authHeader = req.headers.get('authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
          {
            error: 'Unauthorized',
            message: 'Missing or invalid Authorization header',
          },
          { status: 401, headers }
        );
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      // Verify JWT with Supabase by creating a client with the user's token
      const supabaseUrl = process.env.SUPABASE_URL!;
      const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

      const { createClient } = await import('@supabase/supabase-js');
      const supabaseWithToken = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });

      const { data: { user }, error: authError } = await supabaseWithToken.auth.getUser();

      if (authError || !user) {
        return NextResponse.json(
          {
            error: 'Unauthorized',
            message: 'Invalid or expired token',
          },
          { status: 401, headers }
        );
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
        return NextResponse.json(
          {
            error: 'Unauthorized',
            message: 'User not found in database',
          },
          { status: 401, headers }
        );
      }

      // Inject auth context and call handler
      // Await params (Next.js 15 always passes params as Promise)
      const params = await routeContext.params;

      const authContext: AuthContext = {
        userId: dbUser.id,
        workspaceId: dbUser.workspaceId,
        supabaseUserId: user.id,
        params,
      };

      const response = await handler(req, authContext);

      // Add CORS headers to response
      Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      return response;

    } catch (error) {
      console.error('Auth middleware error:', error);
      return NextResponse.json(
        {
          error: 'Internal Server Error',
          message: 'Authentication failed',
        },
        { status: 500, headers }
      );
    }
  };
}

/**
 * Error response helper for Next.js
 * Standardizes error responses across API
 */
export function errorResponse(
  statusCode: number,
  error: string,
  message?: string
) {
  return NextResponse.json(
    {
      error,
      message: message ?? error,
    },
    { status: statusCode }
  );
}
