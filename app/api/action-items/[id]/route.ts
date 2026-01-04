/**
 * ActionItem Update API Endpoint
 *
 * PATCH /api/action-items/[id] - Update action item
 *
 * Auth required: withAuth middleware
 * Verifies workspace ownership before updating
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, type AuthContext } from '../../_lib/middleware';
import { prisma } from '../../_lib/prisma';
import { mapActionItemToAPI } from '../../_lib/mappers';
import { z } from 'zod';

const updateActionItemSchema = z.object({
  completed: z.boolean().optional(),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).optional(),
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  dueDate: z.string().datetime().optional(),
});

async function handler(
  req: NextRequest,
  context: AuthContext
): Promise<NextResponse> {
  const { workspaceId, params } = context;
  const id = params?.id as string | undefined;

  if (!id) {
    return NextResponse.json({ error: 'Action item ID is required' }, { status: 400 });
  }

  try {
    const body = await req.json();
    const validated = updateActionItemSchema.parse(body);

    // Verify ownership
    const existing = await prisma.actionItem.findFirst({
      where: { id, workspaceId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const updated = await prisma.actionItem.update({
      where: { id },
      data: {
        ...validated,
        dueDate: validated.dueDate ? new Date(validated.dueDate) : undefined,
      },
    });

    return NextResponse.json(mapActionItemToAPI(updated));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          message: error.issues.map(e => e.message).join(', '),
        },
        { status: 400 }
      );
    }

    console.error('Error updating action item:', error);
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
export const PATCH = withAuth(handler);
