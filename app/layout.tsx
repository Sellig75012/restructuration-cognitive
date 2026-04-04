import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Restructuration Cognitive',
  description: 'Outil de restructuration cognitive - Identifiez vos distorsions cognitives et restructurez vos pensées',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  )
}
