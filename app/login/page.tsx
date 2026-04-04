'use client'

import { useState } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/send-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (res.ok) {
        setSent(true)
      } else {
        const data = await res.json()
        setError(data.error || 'Erreur lors de l\'envoi')
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
          {sent ? (
            <div className="text-center py-4 animate-fade-in">
              <div className="text-4xl mb-4">📧</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Vérifiez votre boîte mail</h2>
              <p className="text-gray-500 mb-4">
                Si un compte actif existe pour <strong>{email}</strong>, un lien de connexion vous a été envoyé.
              </p>
              <p className="text-sm text-gray-400 mb-1">Le lien expire dans 15 minutes et ne peut être utilisé qu'une seule fois.</p>
              <p className="text-sm text-gray-400">Pensez à vérifier vos spams.</p>
              <button
                type="button"
                onClick={() => { setSent(false); setEmail('') }}
                className="mt-6 text-primary-500 hover:text-primary-600 text-sm font-medium"
              >
                Utiliser une autre adresse
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Connexion</h2>

              {error && (
                <div className="bg-danger-50 text-danger-600 px-4 py-3 rounded-xl mb-4 text-sm">
                  {error}
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
                {loading ? 'Envoi en cours...' : 'Recevoir mon lien de connexion'}
              </button>

              <p className="text-xs text-gray-400 text-center mt-4">
                Un lien sécurisé à usage unique vous sera envoyé par email.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
