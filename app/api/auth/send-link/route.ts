import { NextRequest, NextResponse } from 'next/server'
import { ensureInitialized } from '@/lib/db'
import { getUserByEmail } from '@/lib/users'
import { createMagicToken } from '@/lib/auth'
import { sendMagicLinkEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    await ensureInitialized()
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 })
    }

    // Toujours le même message pour ne pas révéler si le compte existe
    const message = 'Si un compte actif existe pour cette adresse, un lien de connexion vous a été envoyé par email.'

    const user = await getUserByEmail(email.toLowerCase().trim())

    if (!user || user.status !== 'active') {
      return NextResponse.json({ ok: true, message })
    }

    const token = await createMagicToken(user.email)
    await sendMagicLinkEmail(user.email, token)

    return NextResponse.json({ ok: true, message })
  } catch (error) {
    console.error('Send link error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
