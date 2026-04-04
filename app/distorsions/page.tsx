'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import { DISTORSIONS } from '@/lib/distorsions'

export default function DistorsionsPage() {
  const [selected, setSelected] = useState<number | null>(null)
  const [search, setSearch] = useState('')

  const filtered = DISTORSIONS.filter(d =>
    d.nom.toLowerCase().includes(search.toLowerCase()) ||
    d.description.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Les 14 distorsions cognitives</h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Lors des phases de dépression ou d'anxiété, l'esprit a tendance à déformer les informations.
            Identifiez vos distorsions pour mieux les combattre.
          </p>
        </div>

        <div className="max-w-md mx-auto mb-8">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher une distorsion..."
            className="input-field text-center"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(d => (
            <button
              key={d.id}
              onClick={() => setSelected(selected === d.id ? null : d.id)}
              className={`card text-left transition-all duration-200 hover:shadow-md cursor-pointer ${
                selected === d.id ? 'ring-2 ring-offset-2' : ''
              }`}
              style={{
                borderColor: selected === d.id ? d.couleur : undefined,
                ['--tw-ring-color' as string]: d.couleur,
              }}
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl">{d.icone}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 mb-1" style={{ color: d.couleur }}>
                    {d.id}. {d.nom}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">{d.description}</p>

                  {selected === d.id && (
                    <div className="animate-fade-in mt-3 pt-3 border-t border-gray-100">
                      <p className="text-sm font-medium text-gray-500 mb-1">Exemple :</p>
                      <p className="text-sm italic text-gray-700 bg-gray-50 rounded-lg p-3">
                        &laquo; {d.exemple} &raquo;
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="card mt-8 bg-primary-50 border-primary-100">
          <h2 className="font-semibold text-primary-800 mb-2">Comment utiliser ces informations ?</h2>
          <p className="text-sm text-primary-700">
            Une fois vos distorsions cognitives identifiées, il est nécessaire de reformuler une pensée
            moins biaisée et d'agir en accord avec cette nouvelle pensée. Utilisez le
            <a href="/fiche" className="font-semibold underline ml-1">tableau de restructuration cognitive</a> pour pratiquer cet exercice.
          </p>
        </div>
      </main>
    </>
  )
}
