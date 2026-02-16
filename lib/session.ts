import { SessionOptions } from 'iron-session'

export interface SessionData {
  userId: string
  username: string
  role: string
  isLoggedIn: boolean
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_PASSWORD!,
  cookieName: 'hivemind_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 1, // 24 hours
  },
}

export const defaultSession: SessionData = {
  userId: '',
  username: '',
  role: '',
  isLoggedIn: false,
}
