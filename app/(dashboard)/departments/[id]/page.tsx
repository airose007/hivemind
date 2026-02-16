import Link from 'next/link'
import StatusBadge from '@/components/StatusBadge'
import HealthScore from '@/components/HealthScore'
import { prisma } from '@/lib/db'

async function getDepartment(id: string) {
  return await prisma.department.findUnique({
    where: { id },
    include: {
      agents: { orderBy: { name: 'asc' } },
      tasks: {
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: { assignedTo: true },
      },
      _count: { select: { agents: true, tasks: true } },
    },
  })
}

export default async function DepartmentDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const department = await getDepartment(params.id)
  if (!department) return <div className="p-4 sm:p-8">Department not found</div>

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <Link
          href="/departments"
          className="text-blue-400 hover:text-blue-300 text-sm mb-4 inline-block"
        >
          ← Back to Departments
        </Link>
        
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="text-4xl sm:text-5xl">{department.icon || '🏢'}</span>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold">{department.name}</h1>
              {department.description && (
                <p className="text-gray-400 mt-1 text-sm sm:text-base">{department.description}</p>
              )}
            </div>
          </div>
          <StatusBadge status={department.status} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6">
          <div className="text-gray-400 text-xs sm:text-sm mb-1">Agents</div>
          <div className="text-2xl sm:text-3xl font-bold">{department._count.agents}</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6">
          <div className="text-gray-400 text-xs sm:text-sm mb-1">Total Tasks</div>
          <div className="text-2xl sm:text-3xl font-bold">{department._count.tasks}</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6">
          <div className="text-gray-400 text-xs sm:text-sm mb-1">Active Tasks</div>
          <div className="text-2xl sm:text-3xl font-bold text-blue-400">{department.tasks.length}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {/* Agents */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-800">
            <h2 className="text-lg sm:text-xl font-semibold">Agents</h2>
          </div>
          <div className="divide-y divide-gray-800">
            {department.agents.length === 0 ? (
              <div className="px-4 sm:px-6 py-8 text-center text-gray-500">
                No agents in this department
              </div>
            ) : (
              department.agents.map((agent: any) => (
                <Link
                  key={agent.id}
                  href={`/agents/${agent.id}`}
                  className="block px-4 sm:px-6 py-3 sm:py-4 hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium text-sm sm:text-base">{agent.name}</div>
                      <div className="text-xs sm:text-sm text-gray-400 truncate">
                        {agent.role} • {agent.model}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                      <HealthScore score={agent.healthScore} />
                      <StatusBadge status={agent.status} />
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Tasks */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-800">
            <h2 className="text-lg sm:text-xl font-semibold">Recent Tasks</h2>
          </div>
          <div className="divide-y divide-gray-800">
            {department.tasks.length === 0 ? (
              <div className="px-4 sm:px-6 py-8 text-center text-gray-500">
                No tasks
              </div>
            ) : (
              department.tasks.slice(0, 20).map((task: any) => (
                <Link
                  key={task.id}
                  href={`/tasks/${task.id}`}
                  className="block px-4 sm:px-6 py-3 sm:py-4 hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate text-sm sm:text-base">{task.title}</div>
                      <div className="text-xs sm:text-sm text-gray-400 mt-1">
                        {task.assignedTo?.name || 'Unassigned'}
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
