import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/get-user'
import { getAllUsers, createUser, updateUser, deleteUser } from '@/lib/users'

export async function GET() {
  const auth = await getUserFromRequest()
  if (!auth || auth.role !== 'admin') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  const users = await getAllUsers()
  return NextResponse.json(users)
}

export async function POST(request: NextRequest) {
  const auth = await getUserFromRequest()
  if (!auth || auth.role !== 'admin') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  const { email, name, role } = await request.json()
  if (!email) {
    return NextResponse.json({ error: 'Email requis' }, { status: 400 })
  }

  try {
    const user = await createUser(email.toLowerCase().trim(), name || '', role || 'user')
    return NextResponse.json(user)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    if (msg.includes('unique') || msg.includes('duplicate')) {
      return NextResponse.json({ error: 'Cet email existe déjà' }, { status: 409 })
    }
    throw error
  }
}

export async function PUT(request: NextRequest) {
  const auth = await getUserFromRequest()
  if (!auth || auth.role !== 'admin') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  const { id, name, role, status } = await request.json()
  if (!id) {
    return NextResponse.json({ error: 'ID requis' }, { status: 400 })
  }

  const user = await updateUser(id, { name, role, status })
  if (!user) {
    return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })
  }

  return NextResponse.json(user)
}

export async function DELETE(request: NextRequest) {
  const auth = await getUserFromRequest()
  if (!auth || auth.role !== 'admin') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  const { id } = await request.json()
  const deleted = await deleteUser(id)
  if (!deleted) {
    return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })
  }

  return NextResponse.json({ ok: true })
}
