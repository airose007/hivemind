import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/apiAuth'

export async function GET() {
  const auth = await requireAuth()
  if (!auth.authenticated) return auth.response
  try {
    const [agentCount, activeAgents, departments, activeTasks] = await Promise.all([
      prisma.agent.count(),
      prisma.agent.count({ where: { status: { not: 'offline' } } }),
      prisma.department.count(),
      prisma.task.count({
        where: {
          status: {
            in: ['queued', 'assigned', 'running'],
          },
        },
      }),
    ])

    const avgHealthScore = await prisma.agent.aggregate({
      _avg: {
        healthScore: true,
      },
    })

    return NextResponse.json({
      health: {
        status: 'operational',
        agents: {
          total: agentCount,
          active: activeAgents,
          avgHealthScore: avgHealthScore._avg.healthScore || 0,
        },
        departments: departments,
        activeTasks: activeTasks,
      },
    })
  } catch (error) {
    console.error('Error fetching health:', error)
    return NextResponse.json(
      { error: 'Failed to fetch health data' },
      { status: 500 }
    )
  }
}
