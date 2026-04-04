import { NextResponse } from 'next/server'
import { DISTORSIONS } from '@/lib/distorsions'

export async function GET() {
  return NextResponse.json(DISTORSIONS)
}
