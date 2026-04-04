import pool from './db'

export interface Fiche {
  id: number
  owner_email: string
  date: string
  situation: string
  emotion_initiale: string
  emotion_initiale_pct: number
  pensees_automatiques: string
  distorsions_identifiees: string[]
  questionnement: string
  pensees_adaptees: string
  emotion_finale: string
  emotion_finale_pct: number
  action: string
  notes: string
  created_at: string
  updated_at: string
}

export async function getAllFiches(ownerEmail: string): Promise<Fiche[]> {
  const result = await pool.query(
    `SELECT * FROM fiches WHERE owner_email = $1 ORDER BY date DESC, created_at DESC`,
    [ownerEmail]
  )
  return result.rows
}

export async function getFicheById(id: number, ownerEmail: string): Promise<Fiche | null> {
  const result = await pool.query(
    `SELECT * FROM fiches WHERE id = $1 AND owner_email = $2`,
    [id, ownerEmail]
  )
  return result.rows[0] || null
}

export async function createFiche(ownerEmail: string, data: Partial<Fiche>): Promise<Fiche> {
  const result = await pool.query(
    `INSERT INTO fiches (owner_email, date, situation, emotion_initiale, emotion_initiale_pct, pensees_automatiques, distorsions_identifiees, questionnement, pensees_adaptees, emotion_finale, emotion_finale_pct, action, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
    [
      ownerEmail,
      data.date || new Date().toISOString().split('T')[0],
      data.situation || '',
      data.emotion_initiale || '',
      data.emotion_initiale_pct || 0,
      data.pensees_automatiques || '',
      data.distorsions_identifiees || [],
      data.questionnement || '',
      data.pensees_adaptees || '',
      data.emotion_finale || '',
      data.emotion_finale_pct || 0,
      data.action || '',
      data.notes || '',
    ]
  )
  return result.rows[0]
}

export async function updateFiche(id: number, ownerEmail: string, data: Partial<Fiche>): Promise<Fiche | null> {
  const result = await pool.query(
    `UPDATE fiches SET
      date = COALESCE($3, date),
      situation = COALESCE($4, situation),
      emotion_initiale = COALESCE($5, emotion_initiale),
      emotion_initiale_pct = COALESCE($6, emotion_initiale_pct),
      pensees_automatiques = COALESCE($7, pensees_automatiques),
      distorsions_identifiees = COALESCE($8, distorsions_identifiees),
      questionnement = COALESCE($9, questionnement),
      pensees_adaptees = COALESCE($10, pensees_adaptees),
      emotion_finale = COALESCE($11, emotion_finale),
      emotion_finale_pct = COALESCE($12, emotion_finale_pct),
      action = COALESCE($13, action),
      notes = COALESCE($14, notes),
      updated_at = NOW()
    WHERE id = $1 AND owner_email = $2 RETURNING *`,
    [
      id,
      ownerEmail,
      data.date,
      data.situation,
      data.emotion_initiale,
      data.emotion_initiale_pct,
      data.pensees_automatiques,
      data.distorsions_identifiees,
      data.questionnement,
      data.pensees_adaptees,
      data.emotion_finale,
      data.emotion_finale_pct,
      data.action,
      data.notes,
    ]
  )
  return result.rows[0] || null
}

export async function deleteFiche(id: number, ownerEmail: string): Promise<boolean> {
  const result = await pool.query(
    `DELETE FROM fiches WHERE id = $1 AND owner_email = $2`,
    [id, ownerEmail]
  )
  return (result.rowCount ?? 0) > 0
}

export async function getFichesForAdmin(): Promise<{ email: string; count: number; last_entry: string }[]> {
  const result = await pool.query(
    `SELECT owner_email as email, COUNT(*) as count, MAX(created_at) as last_entry
     FROM fiches GROUP BY owner_email ORDER BY last_entry DESC`
  )
  return result.rows
}

export async function getFichesByEmail(email: string): Promise<Fiche[]> {
  const result = await pool.query(
    `SELECT * FROM fiches WHERE owner_email = $1 ORDER BY date DESC, created_at DESC`,
    [email]
  )
  return result.rows
}
