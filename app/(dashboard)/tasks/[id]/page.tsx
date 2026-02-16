import Link from 'next/link'
import StatusBadge from '@/components/StatusBadge'
import { prisma } from '@/lib/db'

async function getTask(id: string) {
  return await prisma.task.findUnique({
    where: { id },
    include: {
      department: true,
      assignedTo: true,
      createdBy: true,
      parentTask: true,
      subtasks: { include: { assignedTo: true } },
      events: { orderBy: { createdAt: 'desc' } },
    },
  })
}

export default async function TaskDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const task = await getTask(params.id)
  if (!task) return <div className="p-4 sm:p-8">Task not found</div>

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <Link
          href="/tasks"
          className="text-blue-400 hover:text-blue-300 text-sm mb-4 inline-block"
        >
          ← Back to Tasks
        </Link>
        
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">{task.title}</h1>
            {task.description && (
              <p className="text-gray-400 text-sm sm:text-base">{task.description}</p>
            )}
          </div>
          <StatusBadge status={task.status} />
        </div>
      </div>

      {/* Task Info */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6">
          <div className="text-gray-400 text-xs sm:text-sm mb-1">Priority</div>
          <StatusBadge status={task.priority} />
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6">
          <div className="text-gray-400 text-xs sm:text-sm mb-1">Department</div>
          <div className="font-medium text-sm sm:text-base">
            {task.department ? (
              <Link
                href={`/departments/${task.department.id}`}
                className="text-blue-400 hover:text-blue-300"
              >
                {task.department.icon} {task.department.name}
              </Link>
            ) : (
              'None'
            )}
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6">
          <div className="text-gray-400 text-xs sm:text-sm mb-1">Assigned To</div>
          <div className="font-medium text-sm sm:text-base">
            {task.assignedTo ? (
              <Link
                href={`/agents/${task.assignedTo.id}`}
                className="text-blue-400 hover:text-blue-300"
              >
                {task.assignedTo.name}
              </Link>
            ) : (
              'Unassigned'
            )}
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6">
          <div className="text-gray-400 text-xs sm:text-sm mb-1">Created By</div>
          <div className="font-medium text-sm sm:text-base">
            {task.createdBy ? (
              <Link
                href={`/agents/${task.createdBy.id}`}
                className="text-blue-400 hover:text-blue-300"
              >
                {task.createdBy.name}
              </Link>
            ) : (
              'System'
            )}
          </div>
        </div>
      </div>

      {/* Timestamps */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Timeline</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-sm">
          <div>
            <div className="text-gray-400 mb-1">Created</div>
            <div>{new Date(task.createdAt).toLocaleString()}</div>
          </div>
          {task.startedAt && (
            <div>
              <div className="text-gray-400 mb-1">Started</div>
              <div>{new Date(task.startedAt).toLocaleString()}</div>
            </div>
          )}
          {task.finishedAt && (
            <div>
              <div className="text-gray-400 mb-1">Finished</div>
              <div>{new Date(task.finishedAt).toLocaleString()}</div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {/* Event Timeline */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-800">
            <h2 className="text-lg sm:text-xl font-semibold">Event Timeline</h2>
          </div>
          <div className="divide-y divide-gray-800 max-h-96 overflow-y-auto">
            {task.events.length === 0 ? (
              <div className="px-4 sm:px-6 py-8 text-center text-gray-500">
                No events recorded
              </div>
            ) : (
              task.events.map((event: any) => (
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

        {/* Subtasks */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-800">
            <h2 className="text-lg sm:text-xl font-semibold">Subtasks</h2>
          </div>
          <div className="divide-y divide-gray-800">
            {task.subtasks.length === 0 ? (
              <div className="px-4 sm:px-6 py-8 text-center text-gray-500">
                No subtasks
              </div>
            ) : (
              task.subtasks.map((subtask: any) => (
                <Link
                  key={subtask.id}
                  href={`/tasks/${subtask.id}`}
                  className="block px-4 sm:px-6 py-3 sm:py-4 hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate text-sm sm:text-base">{subtask.title}</div>
                      <div className="text-xs sm:text-sm text-gray-400 mt-1">
                        {subtask.assignedTo?.name || 'Unassigned'}
                      </div>
                    </div>
                    <StatusBadge status={subtask.status} />
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Parent Task */}
        {task.parentTask && (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6 lg:col-span-2">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Parent Task</h2>
            <Link
              href={`/tasks/${task.parentTask.id}`}
              className="block p-4 bg-gray-950 rounded hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{task.parentTask.title}</div>
                  {task.parentTask.description && (
                    <div className="text-sm text-gray-400 mt-1 line-clamp-2">
                      {task.parentTask.description}
                    </div>
                  )}
                </div>
                <StatusBadge status={task.parentTask.status} />
              </div>
            </Link>
          </div>
        )}

        {/* Error Message */}
        {task.errorMessage && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 sm:p-6 lg:col-span-2">
            <h2 className="text-lg sm:text-xl font-semibold mb-2 text-red-400">Error</h2>
            <p className="text-red-300 whitespace-pre-wrap text-sm sm:text-base">{task.errorMessage}</p>
          </div>
        )}
      </div>
    </div>
  )
}
