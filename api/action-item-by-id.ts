/**
 * ActionItem Update API Endpoint
 *
 * PATCH /api/action-item-by-id?id=<actionItemId> - Update action item
 *
 * Auth required: withAuth middleware
 * Verifies workspace ownership before updating
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth, type AuthContext } from './_lib/middleware';
import { prisma } from './_lib/prisma';
import { mapActionItemToAPI } from './_lib/mappers';
import { z } from 'zod';

const updateActionItemSchema = z.object({
  completed: z.boolean().optional(),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).optional(),
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  dueDate: z.string().datetime().optional(),
});

async function handler(
  req: VercelRequest,
  res: VercelResponse,
  authContext: AuthContext
) {
  const { workspaceId } = authContext;

  // Extract ID from query (Vercel passes [id] as query param)
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    res.status(400).json({ error: 'Action item ID is required' });
    return;
  }

  if (req.method === 'PATCH') {
    try {
      const validated = updateActionItemSchema.parse(req.body);

      // Verify ownership
      const existing = await prisma.actionItem.findFirst({
        where: { id, workspaceId },
      });

      if (!existing) {
        res.status(404).json({ error: 'Not found' });
        return;
      }

      const updated = await prisma.actionItem.update({
        where: { id },
        data: {
          ...validated,
          dueDate: validated.dueDate ? new Date(validated.dueDate) : undefined,
        },
      });

      res.status(200).json(mapActionItemToAPI(updated));
      return;
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation error',
          message: error.issues.map(e => e.message).join(', '),
        });
        return;
      }

      console.error('Error updating action item:', error);
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
