/**
 * ActionItems API Endpoint
 *
 * GET /api/action-items - List action items with optional filters
 * POST /api/action-items - Create new action item
 *
 * Auth required: withAuth middleware
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, type AuthContext } from '../_lib/middleware';
import { prisma } from '../_lib/prisma';
import { mapActionItemToAPI } from '../_lib/mappers';
import { z } from 'zod';

const createActionItemSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).default('MEDIUM'),
  dueDate: z.string().datetime().optional(),
});

async function getHandler(
  req: NextRequest,
  context: AuthContext
): Promise<NextResponse> {
  const { workspaceId } = context;
  const { searchParams } = new URL(req.url);

  const completed = searchParams.get('completed');
  const priority = searchParams.get('priority');

  try {
    const items = await prisma.actionItem.findMany({
      where: {
        workspaceId,
        ...(completed !== null && { completed: completed === 'true' }),
        ...(priority && { priority: priority as string }),
      },
      orderBy: [
        { completed: 'asc' }, // Incomplete first
        { priority: 'desc' }, // HIGH → MEDIUM → LOW
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json(items.map(mapActionItemToAPI));
  } catch (error) {
    console.error('Error fetching action items:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

async function postHandler(
  req: NextRequest,
  context: AuthContext
): Promise<NextResponse> {
  const { workspaceId } = context;

  try {
    const body = await req.json();
    const validated = createActionItemSchema.parse(body);

    const item = await prisma.actionItem.create({
      data: {
        ...validated,
        dueDate: validated.dueDate ? new Date(validated.dueDate) : undefined,
        workspaceId,
      },
    });

    return NextResponse.json(mapActionItemToAPI(item), { status: 201 });
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

    console.error('Error creating action item:', error);
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
export const GET = withAuth(getHandler);
export const POST = withAuth(postHandler);
