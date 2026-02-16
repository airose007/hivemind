import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getIronSession } from 'iron-session'
import { SessionData, sessionOptions } from './lib/session'

export async function proxy(request: NextRequest) {
  const response = NextResponse.next()
  const session = await getIronSession<SessionData>(
    request,
    response,
    sessionOptions
  )

  // Allow access to login page, auth API routes, and health ping
  if (
    request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/api/auth') ||
    request.nextUrl.pathname === '/api/ping'
  ) {
    return response
  }

  // Redirect to login if not authenticated
  if (!session.isLoggedIn) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest\\.json|sw\\.js|robots\\.txt|icons/).*)'],
}
