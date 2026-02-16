import type { Metadata } from 'next'
import Link from 'next/link'
import StatusBadge from '@/components/StatusBadge'
import HealthScore from '@/components/HealthScore'
import { prisma } from '@/lib/db'

export const metadata: Metadata = {
  title: 'Agents - HiveMind',
}

async function getAgents() {
  return await prisma.agent.findMany({
    include: {
      department: true,
      tasks: {
        where: { status: { in: ['queued', 'assigned', 'running'] } },
        take: 1,
      },
      _count: { select: { tasks: true } },
    },
    orderBy: { name: 'asc' },
  })
}

export default async function AgentsPage() {
  const agents = await getAgents()

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Agents</h1>
        <button className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
          + New Agent
        </button>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800 border-b border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Agent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Model
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Health
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Last Activity
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {agents.map((agent: any) => (
                <tr key={agent.id} className="hover:bg-gray-800 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      href={`/agents/${agent.id}`}
                      className="font-medium text-blue-400 hover:text-blue-300"
                    >
                      {agent.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {agent.role}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {agent.department ? (
                      <Link
                        href={`/departments/${agent.department.id}`}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        {agent.department.icon} {agent.department.name}
                      </Link>
                    ) : (
                      <span className="text-gray-500">No department</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {agent.model}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <HealthScore score={agent.healthScore} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={agent.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {agent.lastActivity
                      ? new Date(agent.lastActivity).toLocaleString()
                      : 'Never'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile card view */}
        <div className="md:hidden divide-y divide-gray-800">
          {agents.map((agent: any) => (
            <Link
              key={agent.id}
              href={`/agents/${agent.id}`}
              className="block p-4 hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="font-medium text-blue-400">{agent.name}</div>
                <StatusBadge status={agent.status} />
              </div>
              <div className="text-sm text-gray-400 space-y-1">
                <div>{agent.role}</div>
                {agent.department && (
                  <div>{agent.department.icon} {agent.department.name}</div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">{agent.model}</span>
                  <HealthScore score={agent.healthScore} />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {agents.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No agents found
          </div>
        )}
      </div>
    </div>
  )
}
