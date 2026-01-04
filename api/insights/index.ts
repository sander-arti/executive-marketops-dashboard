/**
 * GET /api/insights - List insights with optional filters
 *
 * Query params:
 * - track: Filter by insight track (Produkter, Landskap, Portefølje)
 * - type: Filter by insight type (Mulighet, Risiko, Trend, Evidens, Partnerkandidat)
 * - reportId: Filter by associated report
 * - status: Filter by portfolio status (NEW, REVIEW, DUE_DILIGENCE, SIGNED, REJECTED)
 * - limit: Max results (default: 50, max: 100)
 *
 * Returns: InsightItem[] (with sources embedded)
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_lib/prisma.js';
import { withAuth, type AuthContext, corsHeaders } from '../_lib/middleware.js';
import { validateSchema, GetInsightsQuerySchema } from '../_lib/types.js';
import { mapInsightToAPI } from '../_lib/mappers.js';

async function handler(
  req: VercelRequest,
  res: VercelResponse,
  authContext: AuthContext
) {
  // Set CORS headers
  const origin = req.headers.origin || '';
  const headers = corsHeaders(origin);
  Object.entries(headers).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  // Only allow GET
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Validate query parameters
  const validation = validateSchema(GetInsightsQuerySchema, req.query);
  if (validation.success === false) {
    res.status(400).json({ error: validation.error });
    return;
  }

  const { track, type, reportId, status, limit } = validation.data;

  try {
    // Build Prisma query with workspace isolation
    const where: any = {
      workspaceId: authContext.workspaceId,
    };

    if (track) {
      where.track = track;
    }

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    // Filter by reportId via join table
    if (reportId) {
      where.reports = {
        some: {
          reportId,
        },
      };
    }

    // Query insights with sources
    const insights = await prisma.insight.findMany({
      where,
      include: {
        sources: {
          include: {
            source: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    // Map to API format
    const apiInsights = insights.map(mapInsightToAPI);

    res.status(200).json(apiInsights);
  } catch (error) {
    console.error('Error fetching insights:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// Export with auth middleware
export default withAuth(handler);
