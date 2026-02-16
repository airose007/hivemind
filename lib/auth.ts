import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { SessionData, defaultSession, sessionOptions } from './session'

export async function getSession() {
  const session = await getIronSession<SessionData>(cookies(), sessionOptions)
  
  if (!session.isLoggedIn) {
    session.userId = defaultSession.userId
    session.username = defaultSession.username
    session.role = defaultSession.role
    session.isLoggedIn = defaultSession.isLoggedIn
  }

  return session
}
