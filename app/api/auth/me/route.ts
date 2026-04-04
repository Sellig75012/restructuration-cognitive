import { NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/get-user'
import { getUserByEmail } from '@/lib/users'

export async function GET() {
  const auth = await getUserFromRequest()
  if (!auth) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const user = await getUserByEmail(auth.email)
  if (!user) {
    return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })
  }

  return NextResponse.json({
    email: user.email,
    name: user.name,
    role: user.role,
  })
}
