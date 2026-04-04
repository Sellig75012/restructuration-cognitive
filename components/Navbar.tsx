'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

interface UserInfo {
  email: string
  name: string
  role: string
  permitted_exercises: string[]
}

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<UserInfo | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(setUser)
      .catch(() => null)
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  const hasExercise = (slug: string): boolean =>
    user?.role === 'admin' || user?.permitted_exercises?.includes(slug) || false

  const links: { href: string; label: string; icon: string; visible: boolean }[] = [
    { href: '/dashboard', label: 'Mes fiches', icon: '📋', visible: hasExercise('restructuration-cognitive') },
    { href: '/fiche', label: 'Nouvelle fiche', icon: '✏️', visible: hasExercise('restructuration-cognitive') },
    { href: '/distorsions', label: 'Distorsions', icon: '🧠', visible: hasExercise('restructuration-cognitive') },
    { href: '/rathus', label: 'Échelle Rathus', icon: '💪', visible: hasExercise('echelle-rathus') },
  ]

  if (user?.role === 'admin') {
    links.push({ href: '/admin', label: 'Administration', icon: '⚙️', visible: true })
  }

  const visibleLinks = links.filter(l => l.visible)

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-primary-600 text-lg">
            <span className="text-2xl">🧠</span>
            <span className="hidden sm:inline">Restructuration Cognitive</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {visibleLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span className="mr-1.5">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <span className="text-sm text-gray-500">{user?.name || user?.email}</span>
            <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-danger-500 transition-colors">
              Déconnexion
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 animate-fade-in">
            {visibleLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`block px-4 py-3 rounded-lg text-sm font-medium ${
                  pathname === link.href
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600'
                }`}
              >
                <span className="mr-2">{link.icon}</span>
                {link.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 rounded-lg text-sm text-danger-500 font-medium"
            >
              Déconnexion
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
