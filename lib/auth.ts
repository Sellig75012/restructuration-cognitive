import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import pool from './db'

const JWT_SECRET = process.env.JWT_SECRET || 'restructuration-cognitive-secret-change-me'

export function signToken(payload: { email: string; role: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): { email: string; role: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { email: string; role: string }
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
  const result = await pool.query(
    `SELECT email, expires_at, used FROM magic_tokens WHERE token = $1`,
    [token]
  )

  if (result.rows.length === 0) return null

  const row = result.rows[0]
  if (row.used === 1) return null
  if (new Date(row.expires_at) < new Date()) return null

  await pool.query(`UPDATE magic_tokens SET used = 1 WHERE token = $1`, [token])

  return row.email
}
