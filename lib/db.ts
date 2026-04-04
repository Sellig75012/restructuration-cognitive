import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export default pool

export async function initDatabase() {
  const client = await pool.connect()
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT DEFAULT '',
        role TEXT NOT NULL DEFAULT 'user',
        status TEXT NOT NULL DEFAULT 'pending',
        permitted_exercises TEXT[] DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- Migration: add permitted_exercises if missing
      DO $$ BEGIN
        ALTER TABLE users ADD COLUMN IF NOT EXISTS permitted_exercises TEXT[] DEFAULT '{}';
      EXCEPTION WHEN duplicate_column THEN NULL;
      END $$;

      CREATE TABLE IF NOT EXISTS magic_tokens (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL,
        token TEXT UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_magic_tokens_token ON magic_tokens(token);

      CREATE TABLE IF NOT EXISTS fiches (
        id SERIAL PRIMARY KEY,
        owner_email TEXT NOT NULL,
        date DATE NOT NULL DEFAULT CURRENT_DATE,
        situation TEXT NOT NULL DEFAULT '',
        emotion_initiale TEXT NOT NULL DEFAULT '',
        emotion_initiale_pct INTEGER NOT NULL DEFAULT 0,
        pensees_automatiques TEXT NOT NULL DEFAULT '',
        distorsions_identifiees TEXT[] DEFAULT '{}',
        questionnement TEXT NOT NULL DEFAULT '',
        pensees_adaptees TEXT NOT NULL DEFAULT '',
        emotion_finale TEXT NOT NULL DEFAULT '',
        emotion_finale_pct INTEGER NOT NULL DEFAULT 0,
        action TEXT NOT NULL DEFAULT '',
        notes TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_fiches_owner ON fiches(owner_email);

      CREATE TABLE IF NOT EXISTS rathus_responses (
        id SERIAL PRIMARY KEY,
        owner_email TEXT NOT NULL,
        date DATE NOT NULL DEFAULT CURRENT_DATE,
        responses JSONB NOT NULL DEFAULT '{}',
        score INTEGER NOT NULL DEFAULT 0,
        notes TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_rathus_owner ON rathus_responses(owner_email);
    `)
  } finally {
    client.release()
  }
}

export async function seedAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@stenthiit.fr'
  await pool.query(
    `INSERT INTO users (email, name, role, status, permitted_exercises)
     VALUES ($1, 'Administrateur', 'admin', 'active', $2)
     ON CONFLICT (email) DO NOTHING`,
    [adminEmail, ['restructuration-cognitive']]
  )
}
