import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Vérification de la signature du jeton (HMAC-SHA256) compatible Edge Runtime.
// Les routes API revérifient le jeton avec jsonwebtoken : ceci est une première
// barrière, qui empêche notamment d'atteindre les pages d'administration avec un
// jeton forgé sans signature.
async function verifyJwtEdge(token: string): Promise<{ email?: string; role?: string; exp?: number } | null> {
  const secret = process.env.JWT_SECRET
  if (!secret) return null

  const parts = token.split('.')
  if (parts.length !== 3) return null

  try {
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    )

    const fromBase64Url = (s: string) => {
      const b64 = s.replace(/-/g, '+').replace(/_/g, '/')
      const bin = atob(b64.padEnd(b64.length + ((4 - (b64.length % 4)) % 4), '='))
      const arr = new Uint8Array(bin.length)
      for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i)
      return arr
    }

    const header = JSON.parse(new TextDecoder().decode(fromBase64Url(parts[0])))
    if (header.alg !== 'HS256') return null

    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      fromBase64Url(parts[2]),
      encoder.encode(`${parts[0]}.${parts[1]}`)
    )
    if (!valid) return null

    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(parts[1])))
    if (payload.exp && payload.exp * 1000 < Date.now()) return null
    return payload
  } catch {
    return null
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes
  if (
    pathname === '/' ||
    pathname === '/login' ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/api/auth/') ||
    pathname.startsWith('/api/init') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next()
  }

  const token = request.cookies.get('auth-token')?.value

  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const payload = await verifyJwtEdge(token)
  if (!payload) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Token invalide ou expiré' }, { status: 401 })
    }
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('auth-token')
    return response
  }

  // Admin route protection
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    if (payload.role !== 'admin') {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
      }
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
