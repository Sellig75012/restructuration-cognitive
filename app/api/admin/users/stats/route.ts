import { NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/get-user'
import { getFichesForAdmin } from '@/lib/fiches'
import { getAllUsers } from '@/lib/users'

export async function GET() {
  const auth = await getUserFromRequest()
  if (!auth || auth.role !== 'admin') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  const [users, stats] = await Promise.all([
    getAllUsers(),
    getFichesForAdmin(),
  ])

  const userStats = users.map(user => {
    const s = stats.find(st => st.email === user.email)
    return {
      ...user,
      fiches_count: s ? Number(s.count) : 0,
      last_entry: s?.last_entry || null,
    }
  })

  return NextResponse.json(userStats)
}
