import type { Metadata } from 'next'
import Link from 'next/link'
import StatusBadge from '@/components/StatusBadge'
import { prisma } from '@/lib/db'

export const metadata: Metadata = {
  title: 'Tasks - HiveMind',
}

async function getTasks() {
  return await prisma.task.findMany({
    include: {
      department: true,
      assignedTo: true,
      events: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })
}

export default async function TasksPage() {
  const tasks = await getTasks()

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Tasks</h1>
        <button className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
          + New Task
        </button>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800 border-b border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Task
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {tasks.map((task: any) => (
                <tr key={task.id} className="hover:bg-gray-800 transition-colors">
                  <td className="px-6 py-4">
                    <Link
                      href={`/tasks/${task.id}`}
                      className="font-medium text-blue-400 hover:text-blue-300 line-clamp-2"
                    >
                      {task.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {task.department ? (
                      <Link
                        href={`/departments/${task.department.id}`}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        {task.department.icon} {task.department.name}
                      </Link>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {task.assignedTo ? (
                      <Link
                        href={`/agents/${task.assignedTo.id}`}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        {task.assignedTo.name}
                      </Link>
                    ) : (
                      <span className="text-gray-500">Unassigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={task.priority} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={task.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {new Date(task.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile card view */}
        <div className="md:hidden divide-y divide-gray-800">
          {tasks.map((task: any) => (
            <Link
              key={task.id}
              href={`/tasks/${task.id}`}
              className="block p-4 hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="font-medium text-blue-400 line-clamp-2 flex-1">{task.title}</div>
                <StatusBadge status={task.status} />
              </div>
              <div className="text-sm text-gray-400 space-y-1">
                <div className="flex items-center justify-between">
                  {task.department ? (
                    <span>{task.department.icon} {task.department.name}</span>
                  ) : <span className="text-gray-500">No department</span>}
                  <StatusBadge status={task.priority} />
                </div>
                <div className="flex items-center justify-between">
                  <span>{task.assignedTo?.name || 'Unassigned'}</span>
                  <span className="text-xs">{new Date(task.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {tasks.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No tasks found
          </div>
        )}
      </div>
    </div>
  )
}
