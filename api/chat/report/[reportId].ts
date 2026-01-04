/**
 * Chat API Endpoint - Report-Scoped
 *
 * POST /api/chat/report/:reportId
 *
 * Handles AI chat for specific reports with RAG (Retrieval-Augmented Generation).
 * Fetches report data, constructs context, queries OpenAI, and returns answer with sources.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth, errorResponse, corsHeaders } from '../../_lib/middleware';
import { prisma } from '../../_lib/prisma';
import {
  openai,
  AI_CONFIG,
  REPORT_CHAT_SYSTEM_PROMPT,
  buildReportContext,
  extractSourceReferences,
} from '../../_lib/openai';
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
async function handler(req: VercelRequest, res: VercelResponse, authContext: any): Promise<void> {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).json({ ok: true });
    return;
  }

  // Only accept POST
  if (req.method !== 'POST') {
    errorResponse(res, 405, 'Method not allowed');
    return;
  }

  try {
    // Extract reportId from URL
    const reportId = req.url?.split('/').pop()?.split('?')[0];

    if (!reportId) {
      errorResponse(res, 400, 'Report ID required');
      return;
    }

    // Validate request body
    const validation = ChatRequestSchema.safeParse(req.body);

    if (validation.success === false) {
      res.status(400).json({
        error: 'Invalid request',
        details: validation.error.issues,
      });
      return;
    }

    const { message } = validation.data;

    // Fetch report with full context (insights + sources)
    const report = await prisma.report.findFirst({
      where: {
        id: reportId,
        workspaceId: authContext.workspaceId, // Workspace isolation
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
      errorResponse(res, 404, 'Report not found');
      return;
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
      res.status(503).json({
        error: 'AI chat not configured',
        message:
          'OpenAI API key missing. Please configure OPENAI_API_KEY environment variable.',
      });
      return;
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
    res.setHeader('Content-Type', 'application/json');
    Object.entries(corsHeaders()).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    res.status(200).json({
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
      res.status(503).json({
        error: 'AI service unavailable',
        message: 'Invalid OpenAI API key. Please check configuration.',
      });
      return;
    }

    if (error.response?.status === 429) {
      res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'Too many requests to AI service. Please try again later.',
      });
      return;
    }

    // Generic error
    res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'Failed to process chat request',
    });
  }
}

// Export with auth middleware
export default withAuth(handler);
