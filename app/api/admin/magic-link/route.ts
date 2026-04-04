import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/get-user'
import { getUserByEmail } from '@/lib/users'
import { createMagicToken } from '@/lib/auth'
import { buildMagicLink } from '@/lib/email'

export async function POST(request: NextRequest) {
  const auth = await getUserFromRequest()
  if (!auth || auth.role !== 'admin') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  const { email } = await request.json()
  if (!email) {
    return NextResponse.json({ error: 'Email requis' }, { status: 400 })
  }

  const user = await getUserByEmail(email)
  if (!user) {
    return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })
  }

  if (user.status !== 'active') {
    return NextResponse.json({ error: 'Utilisateur inactif' }, { status: 400 })
  }

  const token = await createMagicToken(user.email)
  const link = buildMagicLink(token)

  return NextResponse.json({ ok: true, link })
}
