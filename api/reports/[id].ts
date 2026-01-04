/**
 * GET /api/reports/:id - Get single report by ID
 *
 * Returns: Report (with keyInsights embedded)
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_lib/prisma';
import { withAuth, type AuthContext, corsHeaders } from '../_lib/middleware';
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

  // Extract report ID from query (Vercel passes [id] as query param)
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    res.status(400).json({ error: 'Report ID is required' });
    return;
  }

  try {
    // Query report with workspace isolation
    const report = await prisma.report.findFirst({
      where: {
        id,
        workspaceId: authContext.workspaceId,
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
      res.status(404).json({ error: 'Report not found' });
      return;
    }

    // Map to API format
    const apiReport = mapReportToAPI(report);

    res.status(200).json(apiReport);
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// Export with auth middleware
export default withAuth(handler);
