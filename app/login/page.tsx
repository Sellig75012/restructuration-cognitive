'use client'

import { useState } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const res = await fetch('/api/auth/send-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (res.ok && data.link) {
        // Magic link interne : redirige directement
        window.location.href = data.link
        return
      }

      if (res.ok) {
        setMessage(data.message || 'Contactez votre administrateur pour obtenir un lien de connexion.')
      } else {
        setError(data.error || 'Erreur lors de la connexion')
      }
    } catch {
      setError('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🧠</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Restructuration Cognitive</h1>
          <p className="text-gray-500">Identifiez vos distorsions cognitives et restructurez vos pensées</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit}>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Connexion</h2>

            {error && (
              <div className="bg-danger-50 text-danger-600 px-4 py-3 rounded-xl mb-4 text-sm">
                {error}
              </div>
            )}

            {message && (
              <div className="bg-primary-50 text-primary-700 px-4 py-3 rounded-xl mb-4 text-sm">
                {message}
              </div>
            )}

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adresse email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="votre@email.fr"
              className="input-field mb-4"
              required
              autoFocus
            />

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading ? 'Connexion en cours...' : 'Se connecter'}
            </button>

            <p className="text-xs text-gray-400 text-center mt-4">
              Votre compte doit être créé par un administrateur.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
