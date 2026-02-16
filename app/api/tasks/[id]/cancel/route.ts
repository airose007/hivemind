import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/apiAuth'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth()
  if (!auth.authenticated) return auth.response
  const { id } = await params
  try {
    const task = await prisma.task.update({
      where: { id },
      data: {
        status: 'canceled',
        finishedAt: new Date(),
      },
    })

    await prisma.taskEvent.create({
      data: {
        taskId: task.id,
        type: 'canceled',
        message: 'Task canceled',
      },
    })

    return NextResponse.json({ task })
  } catch (error: any) {
    console.error('Error canceling task:', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to cancel task' },
      { status: 500 }
    )
  }
}
