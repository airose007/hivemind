import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

/**
 * Lightweight health check endpoint for monitoring tools (Uptime Kuma, etc.)
 * No authentication required - returns minimal data.
 * Use /api/health for detailed authenticated health data.
 */
export async function GET() {
  try {
    // Lightweight DB connectivity check
    await prisma.$queryRaw`SELECT 1`

    return NextResponse.json({
      status: 'ok',
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    })
  } catch {
    return NextResponse.json(
      { status: 'error', message: 'Database unreachable' },
      { status: 503 }
    )
  }
}
