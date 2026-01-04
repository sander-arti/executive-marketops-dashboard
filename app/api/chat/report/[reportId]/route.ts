/**
 * Chat API Endpoint - Report-Scoped
 *
 * POST /api/chat/report/[reportId]
 *
 * Handles AI chat for specific reports with RAG (Retrieval-Augmented Generation).
 * Fetches report data, constructs context, queries OpenAI, and returns answer with sources.
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, type AuthContext } from '../../../_lib/middleware';
import { prisma } from '../../../_lib/prisma';
import {
  openai,
  AI_CONFIG,
  REPORT_CHAT_SYSTEM_PROMPT,
  buildReportContext,
  extractSourceReferences,
} from '../../../_lib/openai';
import { z } from 'zod';

// Request body validation schema
const ChatRequestSchema = z.object({
  message: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(2000, 'Message too long (max 2000 characters)'),
});

/**
 * Main chat handler
 */
async function handler(
  req: NextRequest,
  context: AuthContext
): Promise<NextResponse> {
  try {
    // Extract reportId from route params
    const reportId = context.params?.reportId as string | undefined;

    if (!reportId) {
      return NextResponse.json(
        { error: 'Report ID required as route parameter' },
        { status: 400 }
      );
    }

    // Validate request body
    const body = await req.json();
    const validation = ChatRequestSchema.safeParse(body);

    if (validation.success === false) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { message } = validation.data;

    // Fetch report with full context (insights + sources)
    const report = await prisma.report.findFirst({
      where: {
        id: reportId,
        workspaceId: context.workspaceId, // Workspace isolation
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

    // Build report context for RAG
    const reportWithInsights = {
      ...report,
      keyInsights: report.insights.map(ri => ({
        ...ri.insight,
        sources: ri.insight.sources.map(is => is.source),
      })),
    };

    const reportContext = buildReportContext(reportWithInsights);

    // Collect all available sources
    const allSources = reportWithInsights.keyInsights.flatMap(
      insight => insight.sources
    );

    // Check if OpenAI API key is configured
    if (
      !process.env.OPENAI_API_KEY ||
      process.env.OPENAI_API_KEY === 'placeholder_openai_key'
    ) {
      return NextResponse.json(
        {
          error: 'AI chat not configured',
          message:
            'OpenAI API key missing. Please configure OPENAI_API_KEY environment variable.',
        },
        { status: 503 }
      );
    }

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: AI_CONFIG.model,
      temperature: AI_CONFIG.temperature,
      max_tokens: AI_CONFIG.max_tokens,
      top_p: AI_CONFIG.top_p,
      messages: [
        {
          role: 'system',
          content: REPORT_CHAT_SYSTEM_PROMPT,
        },
        {
          role: 'system',
          content: `Rapport context:\n\n${reportContext}`,
        },
        {
          role: 'user',
          content: message,
        },
      ],
    });

    const answer = completion.choices[0]?.message?.content || 'Ingen svar mottatt.';

    // Extract source references from answer
    const citedSources = extractSourceReferences(answer, allSources);

    // Return response
    return NextResponse.json({
      answer,
      sources: citedSources,
      usage: {
        promptTokens: completion.usage?.prompt_tokens || 0,
        completionTokens: completion.usage?.completion_tokens || 0,
        totalTokens: completion.usage?.total_tokens || 0,
      },
      model: completion.model,
    });
  } catch (error: any) {
    console.error('Chat API error:', error);

    // OpenAI-specific errors
    if (error.response?.status === 401) {
      return NextResponse.json(
        {
          error: 'AI service unavailable',
          message: 'Invalid OpenAI API key. Please check configuration.',
        },
        { status: 503 }
      );
    }

    if (error.response?.status === 429) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: 'Too many requests to AI service. Please try again later.',
        },
        { status: 429 }
      );
    }

    // Generic error
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error.message || 'Failed to process chat request',
      },
      { status: 500 }
    );
  }
}

// Export with auth middleware
export const POST = withAuth(handler);
