import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const agentId = searchParams.get('agentId')
    const action = searchParams.get('action')
    const limit = searchParams.get('limit')

    const where: any = {}
    if (agentId) where.agentId = agentId
    if (action) where.action = action

    const logs = await prisma.auditLog.findMany({
      where,
      include: {
        agent: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit ? parseInt(limit) : 100,
    })

    return NextResponse.json({ logs })
  } catch (error) {
    console.error('Error fetching logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch logs' },
      { status: 500 }
    )
  }
}
