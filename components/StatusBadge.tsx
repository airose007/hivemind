export default function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: 'bg-green-500/20 text-green-400 border-green-500/30',
    idle: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    working: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    running: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    completed: 'bg-green-500/20 text-green-400 border-green-500/30',
    paused: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    queued: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    assigned: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    error: 'bg-red-500/20 text-red-400 border-red-500/30',
    failed: 'bg-red-500/20 text-red-400 border-red-500/30',
    offline: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    dissolved: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    canceled: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  }

  const color = colors[status.toLowerCase()] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${color}`}>
      {status}
    </span>
  )
}
