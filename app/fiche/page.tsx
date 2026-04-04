'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { DISTORSIONS } from '@/lib/distorsions'

interface FicheData {
  id?: number
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
  notes: string
}

const EMOTIONS = [
  'Peur', 'Anxiété', 'Tristesse', 'Colère', 'Honte', 'Culpabilité',
  'Frustration', 'Dégoût', 'Jalousie', 'Solitude', 'Désespoir', 'Stress',
  'Joie', 'Sérénité', 'Confiance', 'Soulagement', 'Fierté', 'Gratitude',
]

const QUESTIONS_AIDE = [
  'Ces pensées sont-elles bien vraies ?',
  'Pourrait-on voir les choses autrement ?',
  'Les conséquences sont-elles si graves ?',
  'Qu\'est-ce que je dirais à un ami dans cette situation ?',
  'Quels faits contredisent cette pensée ?',
  'Suis-je en train de confondre une pensée avec un fait ?',
]

function FicheForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const editId = searchParams.get('id')

  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [fiche, setFiche] = useState<FicheData>({
    date: new Date().toISOString().split('T')[0],
    situation: '',
    emotion_initiale: '',
    emotion_initiale_pct: 50,
    pensees_automatiques: '',
    distorsions_identifiees: [],
    questionnement: '',
    pensees_adaptees: '',
    emotion_finale: '',
    emotion_finale_pct: 50,
    action: '',
    notes: '',
  })

  useEffect(() => {
    if (editId) {
      fetch('/api/fiches')
        .then(r => r.json())
        .then((fiches: FicheData[]) => {
          const f = fiches.find((ff: FicheData) => ff.id === Number(editId))
          if (f) {
            setFiche(f)
          }
        })
    }
  }, [editId])

  const update = (field: keyof FicheData, value: unknown) => {
    setFiche(prev => ({ ...prev, [field]: value }))
  }

  const toggleDistorsion = (nom: string) => {
    setFiche(prev => ({
      ...prev,
      distorsions_identifiees: prev.distorsions_identifiees.includes(nom)
        ? prev.distorsions_identifiees.filter(d => d !== nom)
        : [...prev.distorsions_identifiees, nom],
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const method = editId ? 'PUT' : 'POST'
      const body = editId ? { ...fiche, id: Number(editId) } : fiche
      const res = await fetch('/api/fiches', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => router.push('/dashboard'), 1500)
      }
    } finally {
      setSaving(false)
    }
  }

  const handleGeneratePDF = async () => {
    const { default: jsPDF } = await import('jspdf')
    const { default: autoTable } = await import('jspdf-autotable')

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

    // Title
    doc.setFontSize(18)
    doc.setTextColor(99, 102, 241)
    doc.text('Tableau de Restructuration Cognitive', 148, 20, { align: 'center' })

    doc.setFontSize(10)
    doc.setTextColor(107, 114, 128)
    doc.text(`Date : ${new Date(fiche.date).toLocaleDateString('fr-FR')}`, 148, 28, { align: 'center' })

    // Table
    autoTable(doc, {
      startY: 35,
      head: [[
        { content: 'Etape 1 : Identification', colSpan: 3, styles: { fillColor: [99, 102, 241], halign: 'center' } },
        { content: 'Etape 2', colSpan: 1, styles: { fillColor: [245, 158, 11], halign: 'center' } },
        { content: 'Etape 3 : Modification', colSpan: 2, styles: { fillColor: [34, 197, 94], halign: 'center' } },
        { content: 'Etape 4', colSpan: 1, styles: { fillColor: [59, 130, 246], halign: 'center' } },
      ], [
        'Situation', 'Emotions (%)', 'Pensees automatiques',
        'Questionnement', 'Pensees adaptees', 'Emotions (%)',
        'Passage a l\'action',
      ]],
      body: [[
        fiche.situation,
        `${fiche.emotion_initiale}\n${fiche.emotion_initiale_pct}%`,
        fiche.pensees_automatiques,
        fiche.questionnement,
        fiche.pensees_adaptees,
        `${fiche.emotion_finale}\n${fiche.emotion_finale_pct}%`,
        fiche.action,
      ]],
      styles: { fontSize: 9, cellPadding: 5, overflow: 'linebreak', minCellHeight: 30 },
      headStyles: { textColor: 255, fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 25 },
        2: { cellWidth: 45 },
        3: { cellWidth: 50 },
        4: { cellWidth: 45 },
        5: { cellWidth: 25 },
        6: { cellWidth: 42 },
      },
    })

    // Distorsions
    if (fiche.distorsions_identifiees.length > 0) {
      const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY || 100
      doc.setFontSize(11)
      doc.setTextColor(99, 102, 241)
      doc.text('Distorsions cognitives identifiees :', 14, finalY + 10)
      doc.setFontSize(9)
      doc.setTextColor(75, 85, 99)
      fiche.distorsions_identifiees.forEach((d, i) => {
        const dist = DISTORSIONS.find(dd => dd.nom === d)
        doc.text(`${dist?.icone || '-'} ${d}`, 20, finalY + 18 + i * 6)
      })
    }

    // Notes
    if (fiche.notes) {
      const finalY2 = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY || 100
      const notesY = finalY2 + 10 + (fiche.distorsions_identifiees.length * 6) + 15
      doc.setFontSize(11)
      doc.setTextColor(99, 102, 241)
      doc.text('Notes :', 14, notesY)
      doc.setFontSize(9)
      doc.setTextColor(75, 85, 99)
      const lines = doc.splitTextToSize(fiche.notes, 250)
      doc.text(lines, 14, notesY + 7)
    }

    // Footer
    doc.setFontSize(8)
    doc.setTextColor(156, 163, 175)
    doc.text('Document genere sur stenthiit.fr - Restructuration Cognitive', 148, 200, { align: 'center' })

    doc.save(`restructuration-cognitive-${fiche.date}.pdf`)
  }

  const getEmotionGradient = (pct: number) => {
    if (pct <= 30) return 'from-green-400 to-green-500'
    if (pct <= 60) return 'from-yellow-400 to-orange-400'
    return 'from-orange-500 to-red-500'
  }

  if (saved) {
    return (
      <>
        <Navbar />
        <main className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="card animate-fade-in">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Fiche enregistrée !</h2>
            <p className="text-gray-500">Redirection vers votre tableau de bord...</p>
          </div>
        </main>
      </>
    )
  }

  const steps = [
    { num: 1, label: 'Identification', color: 'primary' },
    { num: 2, label: 'Questionnement', color: 'yellow' },
    { num: 3, label: 'Modification', color: 'green' },
    { num: 4, label: 'Action', color: 'blue' },
  ]

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {editId ? 'Modifier la fiche' : 'Nouvelle fiche de restructuration'}
        </h1>
        <p className="text-gray-500 mb-6">Suivez les 4 étapes pour restructurer votre pensée</p>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map(s => (
            <button
              key={s.num}
              onClick={() => setStep(s.num)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                step === s.num
                  ? 'bg-primary-500 text-white shadow-md'
                  : step > s.num
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                {step > s.num ? '✓' : s.num}
              </span>
              <span className="hidden sm:inline">{s.label}</span>
            </button>
          ))}
        </div>

        <div className="card animate-fade-in" key={step}>
          {/* Step 1 : Identification */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="bg-primary-50 rounded-xl p-4 mb-4">
                <h2 className="font-semibold text-primary-800 mb-1">Étape 1 : Identification des pensées automatiques</h2>
                <p className="text-sm text-primary-600">Décrivez la situation et identifiez vos émotions et pensées.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={fiche.date}
                  onChange={e => update('date', e.target.value)}
                  className="input-field max-w-xs"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Situation déclenchante</label>
                <textarea
                  value={fiche.situation}
                  onChange={e => update('situation', e.target.value)}
                  placeholder="Décrivez la situation qui a déclenché vos émotions..."
                  className="input-field min-h-[100px] resize-y"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Émotion ressentie</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {EMOTIONS.map(e => (
                    <button
                      key={e}
                      onClick={() => update('emotion_initiale', e)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        fiche.emotion_initiale === e
                          ? 'bg-primary-500 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={fiche.emotion_initiale}
                  onChange={e => update('emotion_initiale', e.target.value)}
                  placeholder="Ou saisissez une émotion..."
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Intensité de l'émotion : <span className="font-bold text-lg">{fiche.emotion_initiale_pct}%</span>
                </label>
                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={fiche.emotion_initiale_pct}
                    onChange={e => update('emotion_initiale_pct', Number(e.target.value))}
                    className="slider-emotion"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Faible</span>
                    <span>Modérée</span>
                    <span>Intense</span>
                  </div>
                </div>
                <div className={`mt-2 h-2 rounded-full bg-gradient-to-r ${getEmotionGradient(fiche.emotion_initiale_pct)} transition-all`}
                     style={{ width: `${fiche.emotion_initiale_pct}%` }} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pensées automatiques</label>
                <textarea
                  value={fiche.pensees_automatiques}
                  onChange={e => update('pensees_automatiques', e.target.value)}
                  placeholder="Quelles pensées vous sont venues spontanément ?"
                  className="input-field min-h-[100px] resize-y"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Distorsions cognitives identifiées
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {DISTORSIONS.map(d => (
                    <button
                      key={d.id}
                      onClick={() => toggleDistorsion(d.nom)}
                      className={`flex items-center gap-2 p-3 rounded-xl text-left text-sm transition-all border ${
                        fiche.distorsions_identifiees.includes(d.nom)
                          ? 'border-2 shadow-sm'
                          : 'border-gray-100 hover:border-gray-200'
                      }`}
                      style={{
                        borderColor: fiche.distorsions_identifiees.includes(d.nom) ? d.couleur : undefined,
                        backgroundColor: fiche.distorsions_identifiees.includes(d.nom) ? `${d.couleur}08` : undefined,
                      }}
                    >
                      <span className="text-xl">{d.icone}</span>
                      <span className="font-medium" style={{
                        color: fiche.distorsions_identifiees.includes(d.nom) ? d.couleur : '#374151',
                      }}>
                        {d.nom}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2 : Questionnement */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="bg-yellow-50 rounded-xl p-4 mb-4">
                <h2 className="font-semibold text-yellow-800 mb-1">Étape 2 : Questionnement des pensées automatiques</h2>
                <p className="text-sm text-yellow-700">Remettez en question vos pensées automatiques en vous aidant des questions ci-dessous.</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm font-medium text-gray-600 mb-2">Vos pensées automatiques :</p>
                <p className="italic text-gray-800">&laquo; {fiche.pensees_automatiques || 'Aucune pensée saisie'} &raquo;</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Questions pour vous aider :</label>
                <div className="grid gap-2 mb-4">
                  {QUESTIONS_AIDE.map(q => (
                    <button
                      key={q}
                      onClick={() => {
                        const current = fiche.questionnement
                        const newQ = current ? `${current}\n${q}` : q
                        update('questionnement', newQ)
                      }}
                      className="text-left p-3 rounded-xl bg-yellow-50 hover:bg-yellow-100 text-sm text-yellow-800 transition-colors border border-yellow-100"
                    >
                      💡 {q}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Votre questionnement</label>
                <textarea
                  value={fiche.questionnement}
                  onChange={e => update('questionnement', e.target.value)}
                  placeholder="Écrivez votre réflexion sur ces pensées..."
                  className="input-field min-h-[150px] resize-y"
                />
              </div>
            </div>
          )}

          {/* Step 3 : Modification */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="bg-green-50 rounded-xl p-4 mb-4">
                <h2 className="font-semibold text-green-800 mb-1">Étape 3 : Modification des pensées dysfonctionnelles</h2>
                <p className="text-sm text-green-700">Reformulez une pensée plus adaptée et réévaluez votre émotion.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 rounded-xl p-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Pensée initiale</p>
                  <p className="text-sm italic text-red-600">&laquo; {fiche.pensees_automatiques || '-'} &raquo;</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Votre questionnement</p>
                  <p className="text-sm text-gray-700">{fiche.questionnement || '-'}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pensées adaptées</label>
                <textarea
                  value={fiche.pensees_adaptees}
                  onChange={e => update('pensees_adaptees', e.target.value)}
                  placeholder="Quelle pensée plus adaptée pourriez-vous formuler ?"
                  className="input-field min-h-[120px] resize-y"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Émotion après restructuration</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {EMOTIONS.map(e => (
                    <button
                      key={e}
                      onClick={() => update('emotion_finale', e)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        fiche.emotion_finale === e
                          ? 'bg-green-500 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={fiche.emotion_finale}
                  onChange={e => update('emotion_finale', e.target.value)}
                  placeholder="Ou saisissez une émotion..."
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Intensité après restructuration : <span className="font-bold text-lg">{fiche.emotion_finale_pct}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={fiche.emotion_finale_pct}
                  onChange={e => update('emotion_finale_pct', Number(e.target.value))}
                  className="slider-emotion"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Faible</span>
                  <span>Modérée</span>
                  <span>Intense</span>
                </div>
                <div className={`mt-2 h-2 rounded-full bg-gradient-to-r ${getEmotionGradient(fiche.emotion_finale_pct)} transition-all`}
                     style={{ width: `${fiche.emotion_finale_pct}%` }} />

                {fiche.emotion_initiale_pct > 0 && fiche.emotion_finale_pct < fiche.emotion_initiale_pct && (
                  <p className="text-sm text-green-600 mt-2 font-medium">
                    ↓ Diminution de {fiche.emotion_initiale_pct - fiche.emotion_finale_pct} points
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 4 : Action */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="bg-blue-50 rounded-xl p-4 mb-4">
                <h2 className="font-semibold text-blue-800 mb-1">Étape 4 : Passage à l'action</h2>
                <p className="text-sm text-blue-700">Définissez une action concrète en accord avec votre nouvelle pensée.</p>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <h3 className="font-medium text-gray-700">Récapitulatif</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Situation :</span>
                    <p className="text-gray-800">{fiche.situation || '-'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Émotion initiale :</span>
                    <p className="text-gray-800">{fiche.emotion_initiale} ({fiche.emotion_initiale_pct}%)</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Pensée adaptée :</span>
                    <p className="text-gray-800">{fiche.pensees_adaptees || '-'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Émotion finale :</span>
                    <p className="text-gray-800">{fiche.emotion_finale} ({fiche.emotion_finale_pct}%)</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Action à entreprendre</label>
                <textarea
                  value={fiche.action}
                  onChange={e => update('action', e.target.value)}
                  placeholder="Quelle action concrète allez-vous entreprendre ?"
                  className="input-field min-h-[100px] resize-y"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes complémentaires (optionnel)</label>
                <textarea
                  value={fiche.notes}
                  onChange={e => update('notes', e.target.value)}
                  placeholder="Notes pour votre psychologue..."
                  className="input-field min-h-[80px] resize-y"
                />
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
            <div>
              {step > 1 && (
                <button onClick={() => setStep(step - 1)} className="btn-secondary">
                  ← Précédent
                </button>
              )}
            </div>

            <div className="flex gap-3">
              {step < 4 ? (
                <button onClick={() => setStep(step + 1)} className="btn-primary">
                  Suivant →
                </button>
              ) : (
                <>
                  <button onClick={handleGeneratePDF} className="btn-secondary">
                    📄 Générer PDF
                  </button>
                  <button onClick={handleSave} disabled={saving} className="btn-primary disabled:opacity-50">
                    {saving ? 'Enregistrement...' : '💾 Enregistrer'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

export default function FichePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p>Chargement...</p></div>}>
      <FicheForm />
    </Suspense>
  )
}
