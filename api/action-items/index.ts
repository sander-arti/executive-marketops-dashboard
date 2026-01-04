/**
 * ActionItems API Endpoint
 *
 * GET /api/action-items - List action items with optional filters
 * POST /api/action-items - Create new action item
 *
 * Auth required: withAuth middleware
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth, type AuthContext } from '../_lib/middleware.js';
import { prisma } from '../_lib/prisma.js';
import { mapActionItemToAPI } from '../_lib/mappers.js';
import { z } from 'zod';

const createActionItemSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).default('MEDIUM'),
  dueDate: z.string().datetime().optional(),
});

async function handler(
  req: VercelRequest,
  res: VercelResponse,
  authContext: AuthContext
) {
  const { workspaceId } = authContext;

  if (req.method === 'GET') {
    // Query params: completed (boolean), priority (string)
    const { completed, priority } = req.query;

    try {
      const items = await prisma.actionItem.findMany({
        where: {
          workspaceId,
          ...(completed !== undefined && { completed: completed === 'true' }),
          ...(priority && { priority: priority as string }),
        },
        orderBy: [
          { completed: 'asc' }, // Incomplete first
          { priority: 'desc' }, // HIGH → MEDIUM → LOW
          { createdAt: 'desc' },
        ],
      });

      res.status(200).json(items.map(mapActionItemToAPI));
      return;
    } catch (error) {
      console.error('Error fetching action items:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
      return;
    }
  }

  if (req.method === 'POST') {
    try {
      const validated = createActionItemSchema.parse(req.body);

      const item = await prisma.actionItem.create({
        data: {
          ...validated,
          dueDate: validated.dueDate ? new Date(validated.dueDate) : undefined,
          workspaceId,
        },
      });

      res.status(201).json(mapActionItemToAPI(item));
      return;
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation error',
          message: error.issues.map(e => e.message).join(', '),
        });
        return;
      }

      console.error('Error creating action item:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
      return;
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}

export default withAuth(handler);
