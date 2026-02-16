import type { Metadata } from 'next'
import Link from 'next/link'
import StatusBadge from '@/components/StatusBadge'
import { prisma } from '@/lib/db'

export const metadata: Metadata = {
  title: 'Departments - HiveMind',
}

async function getDepartments() {
  return await prisma.department.findMany({
    include: {
      tasks: { where: { status: { in: ['queued', 'assigned', 'running'] } } },
      _count: { select: { agents: true, tasks: true } },
    },
    orderBy: [{ isCore: 'desc' }, { name: 'asc' }],
  })
}

export default async function DepartmentsPage() {
  const departments = await getDepartments()

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Departments</h1>
        <button className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
          + New Department
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {departments.map((dept: any) => (
          <Link
            key={dept.id}
            href={`/departments/${dept.id}`}
            className="block bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6 hover:border-gray-700 transition-colors"
          >
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl sm:text-4xl">{dept.icon || '🏢'}</span>
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold">{dept.name}</h3>
                  {dept.isCore && (
                    <span className="text-xs text-blue-400">Core Department</span>
                  )}
                </div>
              </div>
              <StatusBadge status={dept.status} />
            </div>

            {dept.description && (
              <p className="text-gray-400 text-sm mb-3 sm:mb-4 line-clamp-2">
                {dept.description}
              </p>
            )}

            <div className="flex items-center gap-4 text-sm text-gray-400">
              <div>
                <span className="font-semibold text-white">{dept._count.agents}</span> agents
              </div>
              <div>
                <span className="font-semibold text-white">{dept.tasks.length}</span> active tasks
              </div>
            </div>
          </Link>
        ))}
      </div>

      {departments.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No departments found
        </div>
      )}
    </div>
  )
}
