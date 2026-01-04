/**
 * Health Check Endpoint
 *
 * GET /api/health
 *
 * Simple endpoint to verify API is running
 * No auth required
 */

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
}
