import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/apiAuth'
import { createDepartmentSchema, formatZodError } from '@/lib/validations'

export async function GET() {
  const auth = await requireAuth()
  if (!auth.authenticated) return auth.response
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
  const auth = await requireAuth()
  if (!auth.authenticated) return auth.response
  try {
    const body = await request.json()
    const parsed = createDepartmentSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodError(parsed.error) },
        { status: 400 }
      )
    }

    const { name, description, icon } = parsed.data

    const department = await prisma.department.create({
      data: {
        name,
        description,
        icon,
        isCore: body.isCore || false,
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
