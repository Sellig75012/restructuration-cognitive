import { NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/get-user'
import { getUserByEmail } from '@/lib/users'
import { EXERCISES } from '@/lib/exercises'

export async function GET() {
  const auth = await getUserFromRequest()
  if (!auth) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  // Admin sees all exercises
  if (auth.role === 'admin') {
    return NextResponse.json(EXERCISES)
  }

  // User sees only permitted exercises
  const user = await getUserByEmail(auth.email)
  if (!user) {
    return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })
  }

  const permitted = EXERCISES.filter(ex => user.permitted_exercises.includes(ex.slug))
  return NextResponse.json(permitted)
}
