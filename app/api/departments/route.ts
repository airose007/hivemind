import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      include: {
        agents: true,
        tasks: {
          where: {
            status: {
              in: ['queued', 'assigned', 'running'],
            },
          },
        },
        _count: {
          select: {
            agents: true,
            tasks: true,
          },
        },
      },
      orderBy: [
        { isCore: 'desc' },
        { name: 'asc' },
      ],
    })

    return NextResponse.json({ departments })
  } catch (error) {
    console.error('Error fetching departments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch departments' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description, icon, isCore } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    const department = await prisma.department.create({
      data: {
        name,
        description,
        icon,
        isCore: isCore || false,
      },
    })

    return NextResponse.json({ department })
  } catch (error: any) {
    console.error('Error creating department:', error)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Department name already exists' },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create department' },
      { status: 500 }
    )
  }
}
