import pool from './db'

export interface User {
  id: number
  email: string
  name: string
  role: string
  status: string
  permitted_exercises: string[]
  created_at: string
  updated_at: string
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [email])
  return result.rows[0] || null
}

export async function getAllUsers(): Promise<User[]> {
  const result = await pool.query(`SELECT * FROM users ORDER BY created_at DESC`)
  return result.rows
}

export async function createUser(email: string, name: string, role: string = 'user', permittedExercises: string[] = []): Promise<User> {
  const result = await pool.query(
    `INSERT INTO users (email, name, role, status, permitted_exercises) VALUES ($1, $2, $3, 'active', $4) RETURNING *`,
    [email, name, role, permittedExercises]
  )
  return result.rows[0]
}

export async function updateUser(id: number, data: { name?: string; role?: string; status?: string; permitted_exercises?: string[] }): Promise<User | null> {
  const fields: string[] = []
  const values: (string | number | string[])[] = []
  let i = 1

  if (data.name !== undefined) { fields.push(`name = $${i++}`); values.push(data.name) }
  if (data.role !== undefined) { fields.push(`role = $${i++}`); values.push(data.role) }
  if (data.status !== undefined) { fields.push(`status = $${i++}`); values.push(data.status) }
  if (data.permitted_exercises !== undefined) { fields.push(`permitted_exercises = $${i++}`); values.push(data.permitted_exercises) }
  fields.push(`updated_at = NOW()`)

  if (fields.length === 1) return null

  values.push(id)
  const result = await pool.query(
    `UPDATE users SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`,
    values
  )
  return result.rows[0] || null
}

export async function deleteUser(id: number): Promise<boolean> {
  const result = await pool.query(`DELETE FROM users WHERE id = $1`, [id])
  return (result.rowCount ?? 0) > 0
}
