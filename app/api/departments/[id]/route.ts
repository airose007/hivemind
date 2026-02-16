import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/apiAuth'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth()
  if (!auth.authenticated) return auth.response
  const { id } = await params
  try {
    const department = await prisma.department.findUnique({
      where: { id },
      include: {
        agents: {
          orderBy: { name: 'asc' },
        },
        tasks: {
          orderBy: { createdAt: 'desc' },
          take: 50,
          include: {
            assignedTo: true,
          },
        },
        _count: {
          select: {
            agents: true,
            tasks: true,
          },
        },
      },
    })

    if (!department) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ department })
  } catch (error) {
    console.error('Error fetching department:', error)
    return NextResponse.json(
      { error: 'Failed to fetch department' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth()
  if (!auth.authenticated) return auth.response
  const { id } = await params
  try {
    const body = await request.json()
    const { name, description, icon, status } = body

    const department = await prisma.department.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(icon !== undefined && { icon }),
        ...(status && { status }),
      },
    })

    return NextResponse.json({ department })
  } catch (error: any) {
    console.error('Error updating department:', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update department' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth()
  if (!auth.authenticated) return auth.response
  const { id } = await params
  try {
    await prisma.department.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting department:', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to delete department' },
      { status: 500 }
    )
  }
}
