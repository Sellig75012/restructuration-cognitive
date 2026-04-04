import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/get-user'
import { getFichesByEmail } from '@/lib/fiches'

export async function GET(request: NextRequest) {
  const auth = await getUserFromRequest()
  if (!auth || auth.role !== 'admin') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  const email = request.nextUrl.searchParams.get('email')
  if (!email) {
    return NextResponse.json({ error: 'Email requis' }, { status: 400 })
  }

  const fiches = await getFichesByEmail(email)
  return NextResponse.json(fiches)
}
