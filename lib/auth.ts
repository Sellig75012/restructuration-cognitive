import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import pool from './db'

// Le secret n'a pas de valeur de repli : un secret par défaut connu de tous
// permettrait de forger un jeton administrateur. L'erreur est levée à l'usage
// (pas au chargement du module) pour ne pas casser le build.
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret || secret === 'restructuration-cognitive-secret-change-me' || secret === 'change-me-to-a-secure-random-string') {
    throw new Error('JWT_SECRET manquant ou laissé à sa valeur d\'exemple : générer un secret aléatoire (openssl rand -base64 32)')
  }
  return secret
}

export function signToken(payload: { email: string; role: string }): string {
  return jwt.sign(payload, getJwtSecret(), { algorithm: 'HS256', expiresIn: '7d' })
}

export function verifyToken(token: string): { email: string; role: string } | null {
  try {
    return jwt.verify(token, getJwtSecret(), { algorithms: ['HS256'] }) as { email: string; role: string }
  } catch {
    return null
  }
}

export async function createMagicToken(email: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 min

  await pool.query(
    `INSERT INTO magic_tokens (email, token, expires_at) VALUES ($1, $2, $3)`,
    [email, token, expiresAt]
  )

  return token
}

export async function verifyMagicToken(token: string): Promise<string | null> {
  // Marquage atomique : deux requêtes concurrentes avec le même lien ne peuvent
  // pas toutes deux obtenir une session.
  const result = await pool.query(
    `UPDATE magic_tokens SET used = 1
     WHERE token = $1 AND used = 0 AND expires_at > NOW()
     RETURNING email`,
    [token]
  )

  if (result.rows.length === 0) return null
  return result.rows[0].email
}
