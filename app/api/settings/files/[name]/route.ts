import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { requireAuth } from '@/lib/apiAuth'

const WORKSPACE_PATH = process.env.OPENCLAW_WORKSPACE || '/home/openclaw/.openclaw/workspace'

const ALLOWED_FILES = ['SOUL.md', 'AGENTS.md', 'TOOLS.md', 'HEARTBEAT.md']

export async function GET(
  request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const auth = await requireAuth()
  if (!auth.authenticated) return auth.response
  const { name } = await params
  try {
    if (!ALLOWED_FILES.includes(name)) {
      return NextResponse.json(
        { error: 'File not allowed' },
        { status: 403 }
      )
    }

    const filePath = path.join(WORKSPACE_PATH, name)
    
    try {
      const content = await fs.readFile(filePath, 'utf-8')
      return NextResponse.json({ content })
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return NextResponse.json({ content: '' })
      }
      throw error
    }
  } catch (error) {
    console.error('Error reading file:', error)
    return NextResponse.json(
      { error: 'Failed to read file' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const auth = await requireAuth()
  if (!auth.authenticated) return auth.response
  const { name } = await params
  try {
    if (!ALLOWED_FILES.includes(name)) {
      return NextResponse.json(
        { error: 'File not allowed' },
        { status: 403 }
      )
    }

    const { content } = await request.json()

    if (content === undefined) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    const filePath = path.join(WORKSPACE_PATH, name)
    await fs.writeFile(filePath, content, 'utf-8')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error writing file:', error)
    return NextResponse.json(
      { error: 'Failed to write file' },
      { status: 500 }
    )
  }
}
