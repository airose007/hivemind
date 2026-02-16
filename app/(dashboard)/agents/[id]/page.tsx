import Link from 'next/link'
import StatusBadge from '@/components/StatusBadge'
import HealthScore from '@/components/HealthScore'
import { prisma } from '@/lib/db'

async function getAgent(id: string) {
  return await prisma.agent.findUnique({
    where: { id },
    include: {
      department: true,
      tasks: {
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: { department: true },
      },
      events: { orderBy: { createdAt: 'desc' }, take: 50 },
      healthChecks: { orderBy: { createdAt: 'desc' }, take: 10 },
    },
  })
}

export default async function AgentDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const agent = await getAgent(params.id)
  if (!agent) return <div className="p-4 sm:p-8">Agent not found</div>

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <Link
          href="/agents"
          className="text-blue-400 hover:text-blue-300 text-sm mb-4 inline-block"
        >
          ← Back to Agents
        </Link>
        
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold">{agent.name}</h1>
            <div className="text-gray-400 mt-1 text-sm sm:text-base">
              {agent.role} • {agent.model}
              {agent.department && (
                <>
                  {' • '}
                  <Link
                    href={`/departments/${agent.department.id}`}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    {agent.department.icon} {agent.department.name}
                  </Link>
                </>
              )}
            </div>
          </div>
          <StatusBadge status={agent.status} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6">
          <div className="text-gray-400 text-xs sm:text-sm mb-1">Health Score</div>
          <div className="text-2xl sm:text-3xl font-bold">
            <HealthScore score={agent.healthScore} />
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6">
          <div className="text-gray-400 text-xs sm:text-sm mb-1">Total Tasks</div>
          <div className="text-2xl sm:text-3xl font-bold">{agent.tasks.length}</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6">
          <div className="text-gray-400 text-xs sm:text-sm mb-1">Model</div>
          <div className="text-lg sm:text-2xl font-bold truncate">{agent.model}</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6">
          <div className="text-gray-400 text-xs sm:text-sm mb-1">Last Activity</div>
          <div className="text-xs sm:text-sm font-medium">
            {agent.lastActivity
              ? new Date(agent.lastActivity).toLocaleString()
              : 'Never'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {/* Health History */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-800">
            <h2 className="text-lg sm:text-xl font-semibold">Health History</h2>
          </div>
          <div className="p-4 sm:p-6">
            {agent.healthChecks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No health checks recorded
              </div>
            ) : (
              <div className="space-y-3">
                {agent.healthChecks.map((check: any) => (
                  <div
                    key={check.id}
                    className="flex items-center justify-between p-3 bg-gray-950 rounded"
                  >
                    <div className="text-xs sm:text-sm text-gray-400">
                      {new Date(check.createdAt).toLocaleString()}
                    </div>
                    <HealthScore score={check.score} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Events */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-800">
            <h2 className="text-lg sm:text-xl font-semibold">Recent Events</h2>
          </div>
          <div className="divide-y divide-gray-800 max-h-96 overflow-y-auto">
            {agent.events.length === 0 ? (
              <div className="px-4 sm:px-6 py-8 text-center text-gray-500">
                No events recorded
              </div>
            ) : (
              agent.events.map((event: any) => (
                <div key={event.id} className="px-4 sm:px-6 py-3 sm:py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm sm:text-base">{event.message}</div>
                      <div className="text-xs sm:text-sm text-gray-400 mt-1">
                        {new Date(event.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <StatusBadge status={event.type} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden lg:col-span-2">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-800">
            <h2 className="text-lg sm:text-xl font-semibold">Recent Tasks</h2>
          </div>
          <div className="divide-y divide-gray-800">
            {agent.tasks.length === 0 ? (
              <div className="px-4 sm:px-6 py-8 text-center text-gray-500">
                No tasks assigned
              </div>
            ) : (
              agent.tasks.map((task: any) => (
                <Link
                  key={task.id}
                  href={`/tasks/${task.id}`}
                  className="block px-4 sm:px-6 py-3 sm:py-4 hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate text-sm sm:text-base">{task.title}</div>
                      <div className="text-xs sm:text-sm text-gray-400 mt-1">
                        {task.department && (
                          <span>
                            {task.department.icon} {task.department.name}
                          </span>
                        )}
                        {' • '}
                        {new Date(task.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <StatusBadge status={task.status} />
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
