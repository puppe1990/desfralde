import {
  clearSession,
  updateSession,
  useSession,
} from '@tanstack/react-start/server'

type SessionData = {
  userId?: string
}

function getSessionConfig() {
  const password =
    process.env.SESSION_SECRET ?? 'desfralde-dev-session-secret-key-32b'
  if (password.length < 32) {
    throw new Error(
      `SESSION_SECRET must be at least 32 characters (got ${password.length})`,
    )
  }
  return {
    password,
    name: 'desfralde-session',
    maxAge: 60 * 60 * 24 * 30,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
    },
  }
}

export async function readSessionUserId() {
  const session = await useSession<SessionData>(getSessionConfig())
  return session.data.userId ?? null
}

export async function writeSessionUserId(userId: string) {
  await updateSession<SessionData>(getSessionConfig(), { userId })
}

export async function clearSessionUser() {
  await clearSession(getSessionConfig())
}
