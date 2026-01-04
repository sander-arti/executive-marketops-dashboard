/**
 * GET /api/reports - List reports with optional filters
 *
 * Query params:
 * - track: Filter by report track (Produkter, Landskap, Portefølje)
 * - period: Filter by YYYY-MM period
 * - productId: Filter by related product ID
 * - relatedEntity: Filter by product name (alternative to productId)
 *
 * Returns: Report[] (with keyInsights embedded)
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_lib/prisma';
import { withAuth, type AuthContext, corsHeaders } from '../_lib/middleware';
import { validateSchema, GetReportsQuerySchema } from '../_lib/types';
import { mapReportToAPI } from '../_lib/mappers';

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
  const validation = validateSchema(GetReportsQuerySchema, req.query);
  if (validation.success === false) {
    res.status(400).json({ error: validation.error });
    return;
  }

  const { track, period, productId, relatedEntity } = validation.data;

  try {
    // Build Prisma query with workspace isolation
    const where: any = {
      workspaceId: authContext.workspaceId,
    };

    if (track) {
      where.track = track;
    }

    if (period) {
      where.date = period;
    }

    if (productId) {
      where.productId = productId;
    }

    if (relatedEntity) {
      where.relatedEntity = relatedEntity;
    }

    // Query reports with insights and sources
    const reports = await prisma.report.findMany({
      where,
      include: {
        insights: {
          include: {
            insight: {
              include: {
                sources: {
                  include: {
                    source: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    // Map to API format
    const apiReports = reports.map(mapReportToAPI);

    res.status(200).json(apiReports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// Export with auth middleware
export default withAuth(handler);
