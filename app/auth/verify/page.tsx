'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'

function VerifyContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      setStatus('error')
      setError('Token manquant')
      return
    }

    fetch(`/api/auth/verify?token=${token}`)
      .then(async res => {
        if (res.ok) {
          setStatus('success')
          setTimeout(() => router.push('/dashboard'), 1500)
        } else {
          const data = await res.json()
          setStatus('error')
          setError(data.error || 'Lien invalide')
        }
      })
      .catch(() => {
        setStatus('error')
        setError('Erreur de connexion')
      })
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card max-w-md w-full text-center">
        {status === 'loading' && (
          <div className="py-8">
            <div className="text-4xl mb-4 animate-pulse">🔄</div>
            <p className="text-gray-500">Vérification en cours...</p>
          </div>
        )}
        {status === 'success' && (
          <div className="py-8 animate-fade-in">
            <div className="text-4xl mb-4">✅</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Connecté !</h2>
            <p className="text-gray-500">Redirection vers votre tableau de bord...</p>
          </div>
        )}
        {status === 'error' && (
          <div className="py-8 animate-fade-in">
            <div className="text-4xl mb-4">❌</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur</h2>
            <p className="text-gray-500 mb-4">{error}</p>
            <a href="/login" className="btn-primary inline-block">Retour à la connexion</a>
          </div>
        )}
      </div>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p>Chargement...</p></div>}>
      <VerifyContent />
    </Suspense>
  )
}
