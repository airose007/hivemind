import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const agents = await prisma.agent.findMany({
      include: {
        healthChecks: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
      orderBy: { healthScore: 'asc' },
    })

    return NextResponse.json({ agents })
  } catch (error) {
    console.error('Error fetching agent health:', error)
    return NextResponse.json(
      { error: 'Failed to fetch agent health data' },
      { status: 500 }
    )
  }
}
