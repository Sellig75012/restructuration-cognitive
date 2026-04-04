import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/get-user'
import { getUserByEmail } from '@/lib/users'
import { getAllRathusResponses, createRathusResponse, deleteRathusResponse } from '@/lib/rathus-db'

const EXERCISE_SLUG = 'echelle-rathus'

async function checkAccess(email: string, role: string): Promise<boolean> {
  if (role === 'admin') return true
  const user = await getUserByEmail(email)
  return user?.permitted_exercises?.includes(EXERCISE_SLUG) ?? false
}

export async function GET() {
  const auth = await getUserFromRequest()
  if (!auth) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  if (!await checkAccess(auth.email, auth.role)) return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })

  const responses = await getAllRathusResponses(auth.email)
  return NextResponse.json(responses)
}

export async function POST(request: NextRequest) {
  const auth = await getUserFromRequest()
  if (!auth) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  if (!await checkAccess(auth.email, auth.role)) return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })

  const data = await request.json()
  const response = await createRathusResponse(auth.email, data)
  return NextResponse.json(response)
}

export async function DELETE(request: NextRequest) {
  const auth = await getUserFromRequest()
  if (!auth) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { id } = await request.json()
  const deleted = await deleteRathusResponse(id, auth.email)
  if (!deleted) return NextResponse.json({ error: 'Réponse introuvable' }, { status: 404 })

  return NextResponse.json({ ok: true })
}
