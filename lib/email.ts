// Magic link interne - pas d'envoi d'email
// L'admin génère le lien et le transmet manuellement à l'utilisateur

export function buildMagicLink(token: string): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return `${appUrl}/auth/verify?token=${token}`
}
