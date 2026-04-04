'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import { RATHUS_ITEMS, RATHUS_SCALE, calculateRathusScore, interpretRathusScore } from '@/lib/rathus'

interface RathusEntry {
  id: number
  date: string
  score: number
  responses: Record<number, number>
  notes: string
  created_at: string
}

export default function RathusPage() {
  const [view, setView] = useState<'list' | 'form' | 'result'>('list')
  const [entries, setEntries] = useState<RathusEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [responses, setResponses] = useState<Record<number, number>>({})
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [lastScore, setLastScore] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(0)

  const ITEMS_PER_PAGE = 10
  const totalPages = Math.ceil(RATHUS_ITEMS.length / ITEMS_PER_PAGE)

  useEffect(() => {
    fetch('/api/rathus')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setEntries(data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const startNew = () => {
    setResponses({})
    setNotes('')
    setCurrentPage(0)
    setView('form')
  }

  const setResponse = (itemId: number, value: number) => {
    setResponses(prev => ({ ...prev, [itemId]: value }))
  }

  const answeredCount = Object.keys(responses).length
  const allAnswered = answeredCount === RATHUS_ITEMS.length

  const handleSubmit = async () => {
    if (!allAnswered) return
    setSaving(true)
    const score = calculateRathusScore(responses)

    const res = await fetch('/api/rathus', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ responses, score, notes }),
    })

    if (res.ok) {
      setLastScore(score)
      setView('result')
      // Reload entries
      const updated = await fetch('/api/rathus').then(r => r.json())
      if (Array.isArray(updated)) setEntries(updated)
    }
    setSaving(false)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cette passation ?')) return
    await fetch('/api/rathus', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setEntries(entries.filter(e => e.id !== id))
  }

  const handleGeneratePDF = async (entry: RathusEntry) => {
    const { default: jsPDF } = await import('jspdf')
    const { default: autoTable } = await import('jspdf-autotable')

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const interp = interpretRathusScore(entry.score)

    // Title
    doc.setFontSize(16)
    doc.setTextColor(59, 130, 246)
    doc.text("Echelle d'affirmation de soi de Rathus", 105, 20, { align: 'center' })

    doc.setFontSize(10)
    doc.setTextColor(107, 114, 128)
    doc.text(`Date : ${new Date(entry.date).toLocaleDateString('fr-FR')}`, 105, 28, { align: 'center' })

    // Score
    doc.setFontSize(14)
    doc.setTextColor(31, 41, 55)
    doc.text(`Score total : ${entry.score} / [-90 ; +90]`, 105, 40, { align: 'center' })

    doc.setFontSize(11)
    doc.setTextColor(75, 85, 99)
    doc.text(`Interpretation : ${interp.niveau}`, 105, 48, { align: 'center' })

    // Items table
    const tableData = RATHUS_ITEMS.map(item => {
      const raw = entry.responses[item.id] ?? 0
      return [
        `${item.id}${item.inverse ? '*' : ''}`,
        item.texte,
        String(raw),
      ]
    })

    autoTable(doc, {
      startY: 55,
      head: [['N', 'Affirmation', 'Score']],
      body: tableData,
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: [59, 130, 246] },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 155 },
        2: { cellWidth: 15, halign: 'center' },
      },
    })

    // Interpretation
    const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY || 250
    if (finalY + 30 < 280) {
      doc.setFontSize(10)
      doc.setTextColor(75, 85, 99)
      const lines = doc.splitTextToSize(interp.description, 170)
      doc.text(lines, 20, finalY + 10)
    }

    // Footer
    doc.setFontSize(8)
    doc.setTextColor(156, 163, 175)
    doc.text('Document genere sur stenthiit.fr - Echelle de Rathus', 105, 285, { align: 'center' })

    doc.save(`rathus-${entry.date}.pdf`)
  }

  const getScoreColor = (score: number) => {
    const interp = interpretRathusScore(score)
    return interp.couleur
  }

  const pageItems = RATHUS_ITEMS.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE)

  // Result view
  if (view === 'result' && lastScore !== null) {
    const interp = interpretRathusScore(lastScore)
    return (
      <>
        <Navbar />
        <main className="max-w-2xl mx-auto px-4 py-8">
          <div className="card text-center animate-fade-in">
            <div className="text-6xl mb-4">💪</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Résultat</h1>

            <div className="my-6">
              <div className="text-5xl font-bold mb-2" style={{ color: interp.couleur }}>
                {lastScore}
              </div>
              <p className="text-sm text-gray-500">Score sur une échelle de -90 à +90</p>
            </div>

            {/* Visual gauge */}
            <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden mb-2 mx-8">
              <div
                className="absolute top-0 bottom-0 left-0 rounded-full transition-all duration-500"
                style={{
                  width: `${((lastScore + 90) / 180) * 100}%`,
                  backgroundColor: interp.couleur,
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400 mx-8 mb-6">
              <span>-90 (passif)</span>
              <span>0</span>
              <span>+90 (affirmé)</span>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
              <h3 className="font-semibold mb-1" style={{ color: interp.couleur }}>{interp.niveau}</h3>
              <p className="text-sm text-gray-600">{interp.description}</p>
            </div>

            <div className="flex justify-center gap-3">
              <button type="button" onClick={() => setView('list')} className="btn-secondary">
                Voir l'historique
              </button>
              <button type="button" onClick={startNew} className="btn-primary">
                Refaire le test
              </button>
            </div>
          </div>
        </main>
      </>
    )
  }

  // Form view
  if (view === 'form') {
    return (
      <>
        <Navbar />
        <main className="max-w-3xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Échelle de Rathus</h1>
              <p className="text-gray-500">Indiquez à quel degré chaque affirmation est caractéristique de votre comportement</p>
            </div>
            <button type="button" onClick={() => setView('list')} className="btn-secondary text-sm">
              Annuler
            </button>
          </div>

          {/* Progress */}
          <div className="card mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">{answeredCount} / {RATHUS_ITEMS.length} questions</span>
              <span className="text-sm text-gray-400">Page {currentPage + 1} / {totalPages}</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-500 rounded-full transition-all duration-300"
                style={{ width: `${(answeredCount / RATHUS_ITEMS.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Scale legend */}
          <div className="card mb-4 bg-blue-50 border-blue-100">
            <div className="grid grid-cols-6 gap-1 text-center">
              {RATHUS_SCALE.map(s => (
                <div key={s.value} className="text-xs">
                  <span className="font-bold text-blue-700">{s.value > 0 ? `+${s.value}` : s.value}</span>
                  <p className="text-blue-600 leading-tight mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-4">
            {pageItems.map(item => (
              <div key={item.id} className={`card animate-fade-in ${responses[item.id] !== undefined ? 'border-primary-200' : ''}`}>
                <div className="flex gap-3 mb-3">
                  <span className="text-sm font-bold text-primary-500 shrink-0">
                    {item.id}{item.inverse ? '*' : ''}.
                  </span>
                  <p className="text-sm text-gray-800">{item.texte}</p>
                </div>
                <div className="grid grid-cols-6 gap-1.5">
                  {RATHUS_SCALE.map(s => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setResponse(item.id, s.value)}
                      className={`py-2 px-1 rounded-lg text-sm font-semibold transition-all border ${
                        responses[item.id] === s.value
                          ? 'bg-primary-500 text-white border-primary-500 shadow-sm'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      {s.value > 0 ? `+${s.value}` : s.value}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <button
              type="button"
              onClick={() => setCurrentPage(p => p - 1)}
              disabled={currentPage === 0}
              className="btn-secondary disabled:opacity-30"
            >
              ← Précédent
            </button>

            {currentPage < totalPages - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentPage(p => p + 1)}
                className="btn-primary"
              >
                Suivant →
              </button>
            ) : (
              <div className="space-y-2 text-right">
                <div>
                  <label htmlFor="rathus-notes" className="text-sm text-gray-500 block mb-1">Notes (optionnel)</label>
                  <input
                    id="rathus-notes"
                    type="text"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Notes pour votre psy..."
                    className="input-field text-sm mb-2"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!allAnswered || saving}
                  className="btn-primary disabled:opacity-50"
                >
                  {!allAnswered
                    ? `${RATHUS_ITEMS.length - answeredCount} question(s) restante(s)`
                    : saving
                    ? 'Enregistrement...'
                    : 'Voir mon résultat'}
                </button>
              </div>
            )}
          </div>
        </main>
      </>
    )
  }

  // List view
  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Échelle d'affirmation de soi de Rathus</h1>
            <p className="text-gray-500 mt-1">Mesurez votre degré d'assertivité avec 30 questions</p>
          </div>
          <button type="button" onClick={startNew} className="btn-primary">
            + Nouvelle passation
          </button>
        </div>

        {/* Info card */}
        <div className="card mb-6 bg-blue-50 border-blue-100">
          <h2 className="font-semibold text-blue-800 mb-2">Comment ça fonctionne ?</h2>
          <p className="text-sm text-blue-700 mb-2">
            Pour chacune des 30 affirmations, indiquez à quel degré elle est caractéristique de votre comportement
            (de -3 "vraiment non caractéristique" à +3 "très caractéristique").
          </p>
          <p className="text-sm text-blue-600">
            Le score va de -90 (passivité) à +90 (forte affirmation). Un score autour de 0 traduit un comportement normalement affirmé.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400">Chargement...</div>
        ) : entries.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">💪</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Aucune passation</h2>
            <p className="text-gray-500 mb-6">Commencez votre première évaluation de l'affirmation de soi.</p>
            <button type="button" onClick={startNew} className="btn-primary">Commencer le test</button>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map(entry => {
              const interp = interpretRathusScore(entry.score)
              return (
                <div key={entry.id} className="card hover:shadow-md transition-shadow animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                        style={{ backgroundColor: interp.couleur }}
                      >
                        {entry.score > 0 ? `+${entry.score}` : entry.score}
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 font-mono">
                          {new Date(entry.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                        <p className="font-medium" style={{ color: interp.couleur }}>{interp.niveau}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleGeneratePDF(entry)}
                        className="text-primary-500 hover:text-primary-600 text-sm font-medium"
                      >
                        PDF
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(entry.id)}
                        className="text-gray-400 hover:text-red-500 text-sm"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>

                  {/* Score bar */}
                  <div className="mt-3">
                    <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="absolute top-0 bottom-0 left-0 rounded-full"
                        style={{
                          width: `${((entry.score + 90) / 180) * 100}%`,
                          backgroundColor: interp.couleur,
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-300 mt-1">
                      <span>-90</span>
                      <span>0</span>
                      <span>+90</span>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Evolution chart if multiple entries */}
            {entries.length > 1 && (
              <div className="card">
                <h3 className="font-semibold text-gray-900 mb-4">Évolution</h3>
                <div className="flex items-end gap-2 h-32">
                  {[...entries].reverse().map((entry, i) => {
                    const pct = ((entry.score + 90) / 180) * 100
                    const interp = interpretRathusScore(entry.score)
                    return (
                      <div key={entry.id} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-xs font-bold" style={{ color: interp.couleur }}>
                          {entry.score > 0 ? `+${entry.score}` : entry.score}
                        </span>
                        <div
                          className="w-full rounded-t-lg transition-all"
                          style={{
                            height: `${Math.max(pct, 5)}%`,
                            backgroundColor: interp.couleur,
                          }}
                        />
                        <span className="text-xs text-gray-400">
                          {new Date(entry.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </>
  )
}
