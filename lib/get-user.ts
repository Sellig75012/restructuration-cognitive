import { cookies } from 'next/headers'
import { verifyToken } from './auth'

export async function getUserEmailFromRequest(): Promise<string | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value
  if (!token) return null

  const payload = verifyToken(token)
  return payload?.email ?? null
}

export async function getUserFromRequest(): Promise<{ email: string; role: string } | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value
  if (!token) return null

  return verifyToken(token)
}
