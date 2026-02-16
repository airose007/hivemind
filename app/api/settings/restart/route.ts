import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { requireAuth } from '@/lib/apiAuth'

export async function POST() {
  const auth = await requireAuth()
  if (!auth.authenticated) return auth.response
  try {
    // Restart OpenClaw gateway (non-blocking)
    exec('openclaw gateway restart', (error) => {
      if (error) {
        console.error('Error restarting OpenClaw:', error)
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Restart command sent',
    })
  } catch (error) {
    console.error('Error sending restart command:', error)
    return NextResponse.json(
      { error: 'Failed to restart OpenClaw' },
      { status: 500 }
    )
  }
}
