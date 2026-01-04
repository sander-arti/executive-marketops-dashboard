/**
 * Daily Briefing API Endpoint
 *
 * GET /api/daily-briefing - Get daily briefing by date (defaults to today)
 *
 * Query params:
 * - date: YYYY-MM-DD (optional, defaults to today)
 *
 * Auth required: withAuth middleware
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, type AuthContext } from '../_lib/middleware';
import { prisma } from '../_lib/prisma';
import { mapDailyBriefingToAPI } from '../_lib/mappers';

async function handler(
  req: NextRequest,
  context: AuthContext
): Promise<NextResponse> {
  const { workspaceId } = context;

  try {
    // Query param: date (YYYY-MM-DD, defaults to today)
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('date');

    const targetDate = dateParam
      ? new Date(dateParam)
      : new Date(); // Today

    // Normalize to start of day
    targetDate.setHours(0, 0, 0, 0);

    const briefing = await prisma.dailyBriefing.findUnique({
      where: {
        workspaceId_date: {
          workspaceId,
          date: targetDate,
        },
      },
    });

    if (!briefing) {
      return NextResponse.json({ error: 'No briefing for this date' }, { status: 404 });
    }

    return NextResponse.json(mapDailyBriefingToAPI(briefing));
  } catch (error) {
    console.error('Error fetching daily briefing:', error);
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
