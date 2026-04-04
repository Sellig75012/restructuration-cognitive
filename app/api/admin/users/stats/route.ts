import { NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/get-user'
import { getFichesForAdmin } from '@/lib/fiches'
import { getRathusForAdmin } from '@/lib/rathus-db'
import { getAllUsers } from '@/lib/users'

export async function GET() {
  const auth = await getUserFromRequest()
  if (!auth || auth.role !== 'admin') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  const [users, ficheStats, rathusStats] = await Promise.all([
    getAllUsers(),
    getFichesForAdmin(),
    getRathusForAdmin(),
  ])

  const userStats = users.map(user => {
    const fs = ficheStats.find(st => st.email === user.email)
    const rs = rathusStats.find(st => st.email === user.email)
    return {
      ...user,
      fiches_count: fs ? Number(fs.count) : 0,
      last_fiche: fs?.last_entry || null,
      rathus_count: rs ? Number(rs.count) : 0,
      last_rathus: rs?.last_entry || null,
    }
  })

  return NextResponse.json(userStats)
}
