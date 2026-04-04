'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { DISTORSIONS } from '@/lib/distorsions'

interface Fiche {
  id: number
  date: string
  situation: string
  emotion_initiale: string
  emotion_initiale_pct: number
  pensees_automatiques: string
  distorsions_identifiees: string[]
  questionnement: string
  pensees_adaptees: string
  emotion_finale: string
  emotion_finale_pct: number
  action: string
}

export default function DashboardPage() {
  const [fiches, setFiches] = useState<Fiche[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/fiches')
      .then(r => r.json())
      .then(setFiches)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cette fiche ?')) return
    await fetch('/api/fiches', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setFiches(fiches.filter(f => f.id !== id))
  }

  const getEmotionColor = (pct: number) => {
    if (pct <= 30) return 'bg-green-100 text-green-700'
    if (pct <= 60) return 'bg-yellow-100 text-yellow-700'
    return 'bg-red-100 text-red-700'
  }

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mes fiches de restructuration</h1>
            <p className="text-gray-500 mt-1">{fiches.length} fiche{fiches.length > 1 ? 's' : ''} enregistrée{fiches.length > 1 ? 's' : ''}</p>
          </div>
          <Link href="/fiche" className="btn-primary">
            + Nouvelle fiche
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400">Chargement...</div>
        ) : fiches.length === 0 ? (
          <div className="card text-center py-16">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Aucune fiche pour le moment</h2>
            <p className="text-gray-500 mb-6">Commencez par créer votre première fiche de restructuration cognitive.</p>
            <div className="flex justify-center gap-4">
              <Link href="/fiche" className="btn-primary">Créer une fiche</Link>
              <Link href="/distorsions" className="btn-secondary">Découvrir les distorsions</Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {fiches.map(fiche => (
              <div key={fiche.id} className="card hover:shadow-md transition-shadow animate-fade-in">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm text-gray-400 font-mono">
                        {new Date(fiche.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getEmotionColor(fiche.emotion_initiale_pct)}`}>
                        {fiche.emotion_initiale} {fiche.emotion_initiale_pct}%
                      </span>
                      <span className="text-gray-300">→</span>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getEmotionColor(fiche.emotion_finale_pct)}`}>
                        {fiche.emotion_finale} {fiche.emotion_finale_pct}%
                      </span>
                    </div>

                    <h3 className="font-semibold text-gray-900 mb-1 truncate">{fiche.situation}</h3>

                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">{fiche.pensees_automatiques}</p>

                    {fiche.distorsions_identifiees.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {fiche.distorsions_identifiees.map(d => {
                          const dist = DISTORSIONS.find(dd => dd.nom === d)
                          return (
                            <span
                              key={d}
                              className="text-xs px-2 py-0.5 rounded-full font-medium"
                              style={{
                                backgroundColor: dist ? `${dist.couleur}15` : '#f3f4f6',
                                color: dist?.couleur || '#6b7280',
                              }}
                            >
                              {dist?.icone} {d}
                            </span>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <Link
                      href={`/fiche?id=${fiche.id}`}
                      className="text-primary-500 hover:text-primary-600 text-sm font-medium"
                    >
                      Modifier
                    </Link>
                    <button
                      onClick={() => handleDelete(fiche.id)}
                      className="text-gray-400 hover:text-danger-500 text-sm"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  )
}
