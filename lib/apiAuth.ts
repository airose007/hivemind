import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { SessionData, sessionOptions } from './session'
import { NextResponse } from 'next/server'

export async function requireAuth() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions)
  if (!session.isLoggedIn) {
    return { authenticated: false as const, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  return { authenticated: true as const, session }
}
