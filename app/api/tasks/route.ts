import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const departmentId = searchParams.get('departmentId')
    const priority = searchParams.get('priority')
    const limit = searchParams.get('limit')

    const where: any = {}
    if (status) where.status = status
    if (departmentId) where.departmentId = departmentId
    if (priority) where.priority = priority

    const tasks = await prisma.task.findMany({
      where,
      include: {
        department: true,
        assignedTo: true,
        createdBy: true,
        events: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit ? parseInt(limit) : 100,
    })

    return NextResponse.json({ tasks })
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      title,
      description,
      departmentId,
      assignedToId,
      createdById,
      priority,
      payload,
      parentTaskId,
    } = body

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        departmentId,
        assignedToId,
        createdById,
        priority: priority || 'normal',
        payload: payload || {},
        parentTaskId,
      },
      include: {
        department: true,
        assignedTo: true,
        createdBy: true,
      },
    })

    // Create initial event
    await prisma.taskEvent.create({
      data: {
        taskId: task.id,
        type: 'created',
        message: 'Task created',
      },
    })

    return NextResponse.json({ task })
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    )
  }
}
