import { NextResponse } from 'next/server'
import { initDatabase, seedAdmin } from '@/lib/db'

export async function GET() {
  try {
    await initDatabase()
    await seedAdmin()
    return NextResponse.json({ ok: true, message: 'Base de données initialisée' })
  } catch (error) {
    console.error('Init error:', error)
    return NextResponse.json({ ok: false, error: 'Initialisation impossible (voir les journaux du serveur)' }, { status: 500 })
  }
}
