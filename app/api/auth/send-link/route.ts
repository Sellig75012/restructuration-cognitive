import { NextRequest, NextResponse } from 'next/server'
import { ensureInitialized } from '@/lib/db'
import { getUserByEmail } from '@/lib/users'
import { createMagicToken } from '@/lib/auth'
import { sendMagicLinkEmail } from '@/lib/email'
import { checkRateLimit, clientIp } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    // Limite d'envoi : par adresse IP et par adresse email, pour éviter
    // l'inondation de la boîte d'un utilisateur et l'abus du serveur SMTP.
    const ip = clientIp(request.headers)
    const parIp = checkRateLimit(`send-link:ip:${ip}`, 5, 15 * 60 * 1000)
    if (!parIp.allowed) {
      return NextResponse.json(
        { error: 'Trop de demandes. Réessayez dans quelques minutes.' },
        { status: 429, headers: { 'Retry-After': String(parIp.retryAfterSec) } }
      )
    }

    await ensureInitialized()
    const body = await request.json()
    const email = typeof body?.email === 'string' ? body.email.toLowerCase().trim() : ''

    if (!email || email.length > 255 || !email.includes('@')) {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 })
    }

    // Toujours le même message pour ne pas révéler si le compte existe
    const message = 'Si un compte actif existe pour cette adresse, un lien de connexion vous a été envoyé par email.'

    const parEmail = checkRateLimit(`send-link:email:${email}`, 3, 15 * 60 * 1000)
    if (!parEmail.allowed) {
      return NextResponse.json({ ok: true, message })
    }

    const user = await getUserByEmail(email)

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
