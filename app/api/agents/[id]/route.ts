import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const agent = await prisma.agent.findUnique({
      where: { id: params.id },
      include: {
        department: true,
        tasks: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: {
            department: true,
          },
        },
        events: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
        healthChecks: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    })

    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ agent })
  } catch (error) {
    console.error('Error fetching agent:', error)
    return NextResponse.json(
      { error: 'Failed to fetch agent' },
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
      name,
      role,
      departmentId,
      model,
      status,
      healthScore,
      config,
      sessionKey,
      lastActivity,
      currentTaskId,
    } = body

    const agent = await prisma.agent.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(role && { role }),
        ...(departmentId !== undefined && { departmentId }),
        ...(model && { model }),
        ...(status && { status }),
        ...(healthScore !== undefined && { healthScore }),
        ...(config && { config }),
        ...(sessionKey !== undefined && { sessionKey }),
        ...(lastActivity && { lastActivity }),
        ...(currentTaskId !== undefined && { currentTaskId }),
      },
      include: {
        department: true,
      },
    })

    return NextResponse.json({ agent })
  } catch (error: any) {
    console.error('Error updating agent:', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update agent' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.agent.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting agent:', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to delete agent' },
      { status: 500 }
    )
  }
}
