import type { Metadata } from 'next'
import { prisma } from '@/lib/db'

export const metadata: Metadata = {
  title: 'Audit Logs - HiveMind',
}

async function getLogs() {
  return await prisma.auditLog.findMany({
    include: { agent: true },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })
}

export default async function LogsPage() {
  const logs = await getLogs()

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Audit Logs</h1>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800 border-b border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Agent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {logs.map((log: any) => (
                <tr key={log.id} className="hover:bg-gray-800 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {log.agent ? (
                      <span className="text-blue-400">{log.agent.name}</span>
                    ) : log.userId ? (
                      <span className="text-green-400">User {log.userId}</span>
                    ) : (
                      <span className="text-gray-500">System</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium bg-gray-800 border border-gray-700 rounded">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {log.details && typeof log.details === 'object' ? (
                      <pre className="text-xs overflow-x-auto">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    ) : (
                      log.details?.toString() || '-'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile card view */}
        <div className="md:hidden divide-y divide-gray-800">
          {logs.map((log: any) => (
            <div key={log.id} className="p-4">
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className="px-2 py-1 text-xs font-medium bg-gray-800 border border-gray-700 rounded">
                  {log.action}
                </span>
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  {new Date(log.createdAt).toLocaleDateString()}{' '}
                  {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="text-sm mb-1">
                {log.agent ? (
                  <span className="text-blue-400">{log.agent.name}</span>
                ) : log.userId ? (
                  <span className="text-green-400">User {log.userId}</span>
                ) : (
                  <span className="text-gray-500">System</span>
                )}
              </div>
              {log.details && (
                <div className="text-xs text-gray-400 truncate mt-1">
                  {typeof log.details === 'object'
                    ? JSON.stringify(log.details)
                    : log.details?.toString()}
                </div>
              )}
            </div>
          ))}
        </div>

        {logs.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No logs found
          </div>
        )}
      </div>
    </div>
  )
}
