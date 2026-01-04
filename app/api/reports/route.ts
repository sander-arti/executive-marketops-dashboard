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

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../_lib/prisma';
import { withAuth, type AuthContext } from '../_lib/middleware';
import { validateSchema, GetReportsQuerySchema } from '../_lib/types';
import { mapReportToAPI } from '../_lib/mappers';

async function handler(
  req: NextRequest,
  context: AuthContext
): Promise<NextResponse> {
  // Validate query parameters
  const { searchParams } = new URL(req.url);
  const queryParams = {
    track: searchParams.get('track'),
    period: searchParams.get('period'),
    productId: searchParams.get('productId'),
    relatedEntity: searchParams.get('relatedEntity'),
  };

  const validation = validateSchema(GetReportsQuerySchema, queryParams);
  if (validation.success === false) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const { track, period, productId, relatedEntity } = validation.data;

  try {
    // Build Prisma query with workspace isolation
    const where: any = {
      workspaceId: context.workspaceId,
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

    return NextResponse.json(apiReports);
  } catch (error) {
    console.error('Error fetching reports:', error);
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
