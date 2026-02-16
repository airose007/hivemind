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
