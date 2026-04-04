import nodemailer from 'nodemailer'

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.hostinger.com',
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

export function buildMagicLink(token: string): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return `${appUrl}/auth/verify?token=${token}`
}

export async function sendMagicLinkEmail(to: string, token: string) {
  const link = buildMagicLink(token)
  const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@stenthiit.fr'

  const transporter = getTransporter()

  await transporter.sendMail({
    from: `Restructuration Cognitive <${fromEmail}>`,
    to,
    subject: 'Votre lien de connexion - Restructuration Cognitive',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 40px 20px;">
        <h2 style="color: #6366f1; margin-bottom: 20px;">Restructuration Cognitive</h2>
        <p>Bonjour,</p>
        <p>Vous avez demandé un lien de connexion sécurisé.</p>
        <p>Cliquez sur le bouton ci-dessous pour vous connecter :</p>
        <a href="${link}" style="display: inline-block; background: #6366f1; color: white; padding: 14px 36px; border-radius: 8px; text-decoration: none; margin: 24px 0; font-weight: 600; font-size: 16px;">
          Se connecter
        </a>
        <p style="color: #6b7280; font-size: 14px;">Ce lien est valable <strong>15 minutes</strong> et ne peut être utilisé qu'<strong>une seule fois</strong>.</p>
        <p style="color: #9ca3af; font-size: 12px; margin-top: 20px;">Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
      </div>
    `,
  })
}
