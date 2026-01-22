import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'dev-secret-change-in-production'
const COOKIE_NAME = 'admin_token'

export interface AdminSession {
  id: string
  email: string
  is_admin: boolean
}

export async function getAdminSession(): Promise<AdminSession | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value

    if (!token) {
      return null
    }

    const decoded = jwt.verify(token, JWT_SECRET) as AdminSession
    return decoded
  } catch {
    return null
  }
}

export async function isAdmin(): Promise<boolean> {
  const session = await getAdminSession()
  return session?.is_admin === true
}

export function createToken(admin: AdminSession): string {
  return jwt.sign(
    { id: admin.id, email: admin.email, is_admin: admin.is_admin },
    JWT_SECRET,
    { expiresIn: '24h' }
  )
}

export function getAuthCookieOptions(isProduction: boolean) {
  return {
    name: COOKIE_NAME,
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict' as const,
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  }
}

export const AUTH_COOKIE_NAME = COOKIE_NAME
