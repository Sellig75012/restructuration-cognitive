import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
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

  // Decode JWT to check role (without full verification - that's done in API routes)
  try {
    const parts = token.split('.')
    if (parts.length !== 3) throw new Error('Invalid token')

    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString())

    // Check expiration
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Token expiré' }, { status: 401 })
      }
      return NextResponse.redirect(new URL('/login', request.url))
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
  } catch {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
