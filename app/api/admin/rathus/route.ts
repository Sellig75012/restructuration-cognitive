import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/get-user'
import { getRathusResponsesByEmail } from '@/lib/rathus-db'

export async function GET(request: NextRequest) {
  const auth = await getUserFromRequest()
  if (!auth || auth.role !== 'admin') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  const email = request.nextUrl.searchParams.get('email')
  if (!email) {
    return NextResponse.json({ error: 'Email requis' }, { status: 400 })
  }

  const responses = await getRathusResponsesByEmail(email)
  return NextResponse.json(responses)
}
