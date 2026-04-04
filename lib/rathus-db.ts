import pool from './db'

export interface RathusResponse {
  id: number
  owner_email: string
  date: string
  responses: Record<number, number>
  score: number
  notes: string
  created_at: string
}

export async function getAllRathusResponses(ownerEmail: string): Promise<RathusResponse[]> {
  const result = await pool.query(
    `SELECT * FROM rathus_responses WHERE owner_email = $1 ORDER BY date DESC, created_at DESC`,
    [ownerEmail]
  )
  return result.rows
}

export async function getRathusById(id: number, ownerEmail: string): Promise<RathusResponse | null> {
  const result = await pool.query(
    `SELECT * FROM rathus_responses WHERE id = $1 AND owner_email = $2`,
    [id, ownerEmail]
  )
  return result.rows[0] || null
}

export async function createRathusResponse(ownerEmail: string, data: { date?: string; responses: Record<number, number>; score: number; notes?: string }): Promise<RathusResponse> {
  const result = await pool.query(
    `INSERT INTO rathus_responses (owner_email, date, responses, score, notes)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [
      ownerEmail,
      data.date || new Date().toISOString().split('T')[0],
      JSON.stringify(data.responses),
      data.score,
      data.notes || '',
    ]
  )
  return result.rows[0]
}

export async function deleteRathusResponse(id: number, ownerEmail: string): Promise<boolean> {
  const result = await pool.query(
    `DELETE FROM rathus_responses WHERE id = $1 AND owner_email = $2`,
    [id, ownerEmail]
  )
  return (result.rowCount ?? 0) > 0
}

export async function getRathusForAdmin(): Promise<{ email: string; count: number; last_entry: string }[]> {
  const result = await pool.query(
    `SELECT owner_email as email, COUNT(*) as count, MAX(created_at) as last_entry
     FROM rathus_responses GROUP BY owner_email ORDER BY last_entry DESC`
  )
  return result.rows
}

export async function getRathusResponsesByEmail(email: string): Promise<RathusResponse[]> {
  const result = await pool.query(
    `SELECT * FROM rathus_responses WHERE owner_email = $1 ORDER BY date DESC, created_at DESC`,
    [email]
  )
  return result.rows
}
