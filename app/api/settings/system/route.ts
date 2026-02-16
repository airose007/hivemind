import { NextResponse } from 'next/server'
import os from 'os'
import { exec } from 'child_process'
import { promisify } from 'util'
import { requireAuth } from '@/lib/apiAuth'

const execAsync = promisify(exec)

export async function GET() {
  const auth = await requireAuth()
  if (!auth.authenticated) return auth.response
  try {
    const uptime = os.uptime()
    const totalMem = os.totalmem()
    const freeMem = os.freemem()
    const usedMem = totalMem - freeMem
    const cpus = os.cpus()

    let openclawVersion = 'unknown'
    try {
      const { stdout } = await execAsync('openclaw --version')
      openclawVersion = stdout.trim()
    } catch (e) {
      // Ignore
    }

    return NextResponse.json({
      system: {
        hostname: os.hostname(),
        platform: os.platform(),
        arch: os.arch(),
        uptime: uptime,
        uptimeFormatted: formatUptime(uptime),
        memory: {
          total: totalMem,
          used: usedMem,
          free: freeMem,
          usagePercent: Math.round((usedMem / totalMem) * 100),
        },
        cpu: {
          count: cpus.length,
          model: cpus[0]?.model || 'unknown',
        },
        openclawVersion,
      },
    })
  } catch (error) {
    console.error('Error fetching system info:', error)
    return NextResponse.json(
      { error: 'Failed to fetch system info' },
      { status: 500 }
    )
  }
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  const parts = []
  if (days > 0) parts.push(`${days}d`)
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)
  
  return parts.join(' ') || '0m'
}
