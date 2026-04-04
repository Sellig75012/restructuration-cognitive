import { NextRequest, NextResponse } from 'next/server'
import { getUserByEmail } from '@/lib/users'
import { createMagicToken } from '@/lib/auth'
import { sendMagicLink } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 })
    }

    const user = await getUserByEmail(email.toLowerCase().trim())

    if (!user) {
      // Don't reveal if user exists
      return NextResponse.json({ ok: true, message: 'Si ce compte existe, un lien de connexion a été envoyé.' })
    }

    if (user.status !== 'active') {
      return NextResponse.json({ ok: true, message: 'Si ce compte existe, un lien de connexion a été envoyé.' })
    }

    const token = await createMagicToken(user.email)
    await sendMagicLink(user.email, token)

    return NextResponse.json({ ok: true, message: 'Si ce compte existe, un lien de connexion a été envoyé.' })
  } catch (error) {
    console.error('Send link error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
