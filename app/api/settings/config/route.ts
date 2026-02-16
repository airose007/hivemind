import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { requireAuth } from '@/lib/apiAuth'

const CONFIG_PATH = process.env.OPENCLAW_CONFIG || '/home/openclaw/.openclaw/openclaw.json'

export async function GET() {
  const auth = await requireAuth()
  if (!auth.authenticated) return auth.response
  try {
    const content = await fs.readFile(CONFIG_PATH, 'utf-8')
    return NextResponse.json({ content })
  } catch (error) {
    console.error('Error reading config:', error)
    return NextResponse.json(
      { error: 'Failed to read config file' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const auth = await requireAuth()
  if (!auth.authenticated) return auth.response
  try {
    const { content } = await request.json()

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    // Validate JSON
    try {
      JSON.parse(content)
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid JSON format' },
        { status: 400 }
      )
    }

    await fs.writeFile(CONFIG_PATH, content, 'utf-8')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error writing config:', error)
    return NextResponse.json(
      { error: 'Failed to write config file' },
      { status: 500 }
    )
  }
}
