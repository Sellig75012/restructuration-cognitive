import { NextRequest, NextResponse } from 'next/server'
import { ensureInitialized } from '@/lib/db'
import { getUserByEmail } from '@/lib/users'
import { createMagicToken } from '@/lib/auth'
import { buildMagicLink } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    await ensureInitialized()
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 })
    }

    const user = await getUserByEmail(email.toLowerCase().trim())

    if (!user || user.status !== 'active') {
      // Don't reveal if user exists - show generic message
      return NextResponse.json({ ok: true, message: 'Si ce compte existe, un lien de connexion a été généré. Contactez votre administrateur.' })
    }

    const token = await createMagicToken(user.email)
    const link = buildMagicLink(token)

    // Return the link directly (internal magic link)
    return NextResponse.json({ ok: true, link, message: 'Lien de connexion généré.' })
  } catch (error) {
    console.error('Send link error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
