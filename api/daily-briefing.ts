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

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth, type AuthContext } from './_lib/middleware';
import { prisma } from './_lib/prisma';
import { mapDailyBriefingToAPI } from './_lib/mappers';

async function handler(
  req: VercelRequest,
  res: VercelResponse,
  authContext: AuthContext
) {
  const { workspaceId } = authContext;

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Query param: date (YYYY-MM-DD, defaults to today)
    const { date: dateParam } = req.query;

    const targetDate = dateParam && typeof dateParam === 'string'
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
      res.status(404).json({ error: 'No briefing for this date' });
      return;
    }

    res.status(200).json(mapDailyBriefingToAPI(briefing));
  } catch (error) {
    console.error('Error fetching daily briefing:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export default withAuth(handler);
