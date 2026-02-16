import Link from 'next/link'
import StatusBadge from '@/components/StatusBadge'
import HealthScore from '@/components/HealthScore'
import { prisma } from '@/lib/db'

async function getStats() {
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
      where: { status: { in: ['queued', 'assigned', 'running'] } },
    }),
    prisma.task.count({ where: { status: 'completed' } }),
    prisma.task.count({ where: { status: 'failed' } }),
    prisma.task.findMany({
      where: { status: { in: ['queued', 'assigned', 'running'] } },
      include: { department: true, assignedTo: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    prisma.department.findMany({
      include: {
        agents: true,
        tasks: { where: { status: { in: ['queued', 'assigned', 'running'] } } },
        _count: { select: { agents: true, tasks: true } },
      },
      orderBy: [{ isCore: 'desc' }, { name: 'asc' }],
    }),
  ])

  const departmentStats = departments.map((dept) => {
    const activeAgents = dept.agents.filter((a) => a.status !== 'offline')
    const avgHealth =
      activeAgents.length > 0
        ? activeAgents.reduce((sum, a) => sum + a.healthScore, 0) / activeAgents.length
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

  return {
    stats: { totalDepartments, totalAgents, activeTasks, completedTasks, failedTasks },
    recentTasks,
    departmentStats,
  }
}

export default async function DashboardPage() {
  const { stats, recentTasks, departmentStats } = await getStats()

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6">
          <div className="text-gray-400 text-xs sm:text-sm mb-1">Departments</div>
          <div className="text-2xl sm:text-3xl font-bold">{stats.totalDepartments}</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6">
          <div className="text-gray-400 text-xs sm:text-sm mb-1">Agents</div>
          <div className="text-2xl sm:text-3xl font-bold">{stats.totalAgents}</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6">
          <div className="text-gray-400 text-xs sm:text-sm mb-1">Active Tasks</div>
          <div className="text-2xl sm:text-3xl font-bold text-blue-400">{stats.activeTasks}</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6">
          <div className="text-gray-400 text-xs sm:text-sm mb-1">Completed</div>
          <div className="text-2xl sm:text-3xl font-bold text-green-400">{stats.completedTasks}</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6 col-span-2 sm:col-span-1">
          <div className="text-gray-400 text-xs sm:text-sm mb-1">Failed</div>
          <div className="text-2xl sm:text-3xl font-bold text-red-400">{stats.failedTasks}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {/* Recent Tasks */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800">
            <h2 className="text-xl font-semibold">Recent Active Tasks</h2>
          </div>
          <div className="divide-y divide-gray-800">
            {recentTasks.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                No active tasks
              </div>
            ) : (
              recentTasks.slice(0, 10).map((task: any) => (
                <Link
                  key={task.id}
                  href={`/tasks/${task.id}`}
                  className="block px-6 py-4 hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{task.title}</div>
                      <div className="text-sm text-gray-400 flex items-center gap-2 mt-1">
                        {task.department && (
                          <span>{task.department.icon} {task.department.name}</span>
                        )}
                        {task.assignedTo && (
                          <span>• {task.assignedTo.name}</span>
                        )}
                      </div>
                    </div>
                    <StatusBadge status={task.status} />
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Department Health */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800">
            <h2 className="text-xl font-semibold">Department Health</h2>
          </div>
          <div className="divide-y divide-gray-800">
            {departmentStats.map((dept: any) => (
              <Link
                key={dept.id}
                href={`/departments/${dept.id}`}
                className="block px-6 py-4 hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{dept.icon}</span>
                    <div>
                      <div className="font-medium">{dept.name}</div>
                      <div className="text-sm text-gray-400">
                        {dept.agentCount} agents • {dept.activeTaskCount} active tasks
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <HealthScore score={dept.healthScore} />
                    <StatusBadge status={dept.status} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
