/**
 * GET /api/reports/[id] - Get single report by ID
 *
 * Returns: Report (with keyInsights embedded)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../_lib/prisma';
import { withAuth, type AuthContext } from '../../_lib/middleware';
import { mapReportToAPI } from '../../_lib/mappers';

async function handler(
  req: NextRequest,
  context: AuthContext
): Promise<NextResponse> {
  // Extract report ID from route params
  const id = context.params?.id as string | undefined;

  if (!id) {
    return NextResponse.json({ error: 'Report ID is required' }, { status: 400 });
  }

  try {
    // Query report with workspace isolation
    const report = await prisma.report.findFirst({
      where: {
        id,
        workspaceId: context.workspaceId,
      },
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
    });

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Map to API format
    const apiReport = mapReportToAPI(report);

    return NextResponse.json(apiReport);
  } catch (error) {
    console.error('Error fetching report:', error);
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
