import { NextRequest, NextResponse } from 'next/server'
import { verifyMagicToken, signToken } from '@/lib/auth'
import { getUserByEmail } from '@/lib/users'

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')

  if (!token) {
    return NextResponse.json({ error: 'Token manquant' }, { status: 400 })
  }

  const email = await verifyMagicToken(token)
  if (!email) {
    return NextResponse.json({ error: 'Lien invalide ou expiré' }, { status: 400 })
  }

  const user = await getUserByEmail(email)
  if (!user || user.status !== 'active') {
    return NextResponse.json({ error: 'Compte inactif' }, { status: 403 })
  }

  const jwt = signToken({ email: user.email, role: user.role })

  const response = NextResponse.json({ ok: true, role: user.role })
  response.cookies.set('auth-token', jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  })

  return response
}
