import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/apiAuth'
import { createAgentSchema, formatZodError } from '@/lib/validations'

export async function GET() {
  const auth = await requireAuth()
  if (!auth.authenticated) return auth.response
  try {
    const agents = await prisma.agent.findMany({
      include: {
        department: true,
        tasks: {
          where: {
            status: {
              in: ['queued', 'assigned', 'running'],
            },
          },
          take: 1,
        },
        _count: {
          select: {
            tasks: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ agents })
  } catch (error) {
    console.error('Error fetching agents:', error)
    return NextResponse.json(
      { error: 'Failed to fetch agents' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const auth = await requireAuth()
  if (!auth.authenticated) return auth.response
  try {
    const body = await request.json()
    const parsed = createAgentSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodError(parsed.error) },
        { status: 400 }
      )
    }

    const { name, role, departmentId, model, config } = parsed.data

    const agent = await prisma.agent.create({
      data: {
        name,
        role,
        departmentId,
        model,
        config,
      },
      include: {
        department: true,
      },
    })

    return NextResponse.json({ agent })
  } catch (error: any) {
    console.error('Error creating agent:', error)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Agent name already exists' },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create agent' },
      { status: 500 }
    )
  }
}
