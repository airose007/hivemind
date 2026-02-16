import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const [
      totalDepartments,
      totalAgents,
      activeTasks,
      completedTasks,
      failedTasks,
      recentTasks,
      departments,
    ] = await Promise.all([
      prisma.department.count(),
      prisma.agent.count(),
      prisma.task.count({
        where: {
          status: {
            in: ['queued', 'assigned', 'running'],
          },
        },
      }),
      prisma.task.count({
        where: { status: 'completed' },
      }),
      prisma.task.count({
        where: { status: 'failed' },
      }),
      prisma.task.findMany({
        where: {
          status: {
            in: ['queued', 'assigned', 'running'],
          },
        },
        include: {
          department: true,
          assignedTo: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.department.findMany({
        include: {
          agents: true,
          tasks: {
            where: {
              status: {
                in: ['queued', 'assigned', 'running'],
              },
            },
          },
          _count: {
            select: {
              agents: true,
              tasks: true,
            },
          },
        },
        orderBy: [
          { isCore: 'desc' },
          { name: 'asc' },
        ],
      }),
    ])

    // Calculate department health scores
    const departmentStats = departments.map((dept) => {
      const activeAgents = dept.agents.filter((a) => a.status !== 'offline')
      const avgHealth =
        activeAgents.length > 0
          ? activeAgents.reduce((sum, a) => sum + a.healthScore, 0) /
            activeAgents.length
          : 100
      return {
        id: dept.id,
        name: dept.name,
        icon: dept.icon,
        status: dept.status,
        agentCount: dept._count.agents,
        activeTaskCount: dept.tasks.length,
        healthScore: Math.round(avgHealth),
      }
    })

    return NextResponse.json({
      stats: {
        totalDepartments,
        totalAgents,
        activeTasks,
        completedTasks,
        failedTasks,
      },
      recentTasks,
      departmentStats,
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
