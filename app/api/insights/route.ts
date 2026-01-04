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

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../_lib/prisma';
import { withAuth, type AuthContext } from '../_lib/middleware';
import { validateSchema, GetInsightsQuerySchema } from '../_lib/types';
import { mapInsightToAPI } from '../_lib/mappers';

async function handler(
  req: NextRequest,
  context: AuthContext
): Promise<NextResponse> {
  // Validate query parameters
  const { searchParams } = new URL(req.url);
  const queryParams = {
    track: searchParams.get('track'),
    type: searchParams.get('type'),
    reportId: searchParams.get('reportId'),
    status: searchParams.get('status'),
    limit: searchParams.get('limit'),
  };

  const validation = validateSchema(GetInsightsQuerySchema, queryParams);
  if (validation.success === false) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const { track, type, reportId, status, limit } = validation.data;

  try {
    // Build Prisma query with workspace isolation
    const where: any = {
      workspaceId: context.workspaceId,
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

    return NextResponse.json(apiInsights);
  } catch (error) {
    console.error('Error fetching insights:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Export with auth middleware
export const GET = withAuth(handler);
