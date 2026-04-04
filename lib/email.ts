import { Resend } from 'resend'

let resend: Resend | null = null
function getResend() {
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY)
  return resend
}

export async function sendMagicLink(email: string, token: string) {
  const fromEmail = process.env.FROM_EMAIL || 'Restructuration Cognitive <noreply@stenthiit.fr>'
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const link = `${appUrl}/auth/verify?token=${token}`

  await getResend().emails.send({
    from: fromEmail,
    to: email,
    subject: 'Votre lien de connexion - Restructuration Cognitive',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 40px 20px;">
        <h2 style="color: #6366f1; margin-bottom: 20px;">Restructuration Cognitive</h2>
        <p>Bonjour,</p>
        <p>Cliquez sur le bouton ci-dessous pour vous connecter :</p>
        <a href="${link}" style="display: inline-block; background: #6366f1; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; margin: 20px 0; font-weight: 600;">
          Se connecter
        </a>
        <p style="color: #6b7280; font-size: 14px;">Ce lien expire dans 15 minutes.</p>
        <p style="color: #9ca3af; font-size: 12px;">Si vous n'avez pas demandé ce lien, ignorez cet email.</p>
      </div>
    `,
  })
}
