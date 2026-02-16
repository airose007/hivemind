import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const task = await prisma.task.findUnique({
      where: { id: params.id },
      include: {
        department: true,
        assignedTo: true,
        createdBy: true,
        parentTask: true,
        subtasks: {
          include: {
            assignedTo: true,
          },
        },
        events: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ task })
  } catch (error) {
    console.error('Error fetching task:', error)
    return NextResponse.json(
      { error: 'Failed to fetch task' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const {
      title,
      description,
      status,
      priority,
      assignedToId,
      departmentId,
      result,
      errorMessage,
    } = body

    const updates: any = {
      ...(title && { title }),
      ...(description !== undefined && { description }),
      ...(status && { status }),
      ...(priority && { priority }),
      ...(assignedToId !== undefined && { assignedToId }),
      ...(departmentId !== undefined && { departmentId }),
      ...(result && { result }),
      ...(errorMessage !== undefined && { errorMessage }),
    }

    // Set timestamps based on status
    if (status === 'running' && !updates.startedAt) {
      updates.startedAt = new Date()
    }
    if (['completed', 'failed', 'canceled'].includes(status) && !updates.finishedAt) {
      updates.finishedAt = new Date()
    }

    const task = await prisma.task.update({
      where: { id: params.id },
      data: updates,
      include: {
        department: true,
        assignedTo: true,
        createdBy: true,
      },
    })

    // Create status change event
    if (status) {
      await prisma.taskEvent.create({
        data: {
          taskId: task.id,
          type: status,
          message: `Task ${status}`,
        },
      })
    }

    return NextResponse.json({ task })
  } catch (error: any) {
    console.error('Error updating task:', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    )
  }
}
