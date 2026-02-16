import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const task = await prisma.task.update({
      where: { id: params.id },
      data: {
        status: 'queued',
        errorMessage: null,
        startedAt: null,
        finishedAt: null,
      },
    })

    await prisma.taskEvent.create({
      data: {
        taskId: task.id,
        type: 'queued',
        message: 'Task retry requested',
      },
    })

    return NextResponse.json({ task })
  } catch (error: any) {
    console.error('Error retrying task:', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to retry task' },
      { status: 500 }
    )
  }
}
