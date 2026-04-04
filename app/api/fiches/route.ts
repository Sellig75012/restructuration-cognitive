import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/get-user'
import { getAllFiches, createFiche, updateFiche, deleteFiche, getFicheById } from '@/lib/fiches'

export async function GET() {
  const auth = await getUserFromRequest()
  if (!auth) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const fiches = await getAllFiches(auth.email)
  return NextResponse.json(fiches)
}

export async function POST(request: NextRequest) {
  const auth = await getUserFromRequest()
  if (!auth) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const data = await request.json()
  const fiche = await createFiche(auth.email, data)
  return NextResponse.json(fiche)
}

export async function PUT(request: NextRequest) {
  const auth = await getUserFromRequest()
  if (!auth) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const data = await request.json()
  if (!data.id) {
    return NextResponse.json({ error: 'ID requis' }, { status: 400 })
  }

  const fiche = await updateFiche(data.id, auth.email, data)
  if (!fiche) {
    return NextResponse.json({ error: 'Fiche introuvable' }, { status: 404 })
  }

  return NextResponse.json(fiche)
}

export async function DELETE(request: NextRequest) {
  const auth = await getUserFromRequest()
  if (!auth) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { id } = await request.json()
  const deleted = await deleteFiche(id, auth.email)
  if (!deleted) {
    return NextResponse.json({ error: 'Fiche introuvable' }, { status: 404 })
  }

  return NextResponse.json({ ok: true })
}
