export interface Exercise {
  slug: string
  nom: string
  description: string
  icone: string
}

export const EXERCISES: Exercise[] = [
  {
    slug: 'restructuration-cognitive',
    nom: 'Restructuration Cognitive',
    description: 'Tableau en 4 étapes pour identifier et modifier les pensées dysfonctionnelles',
    icone: '🧠',
  },
  {
    slug: 'echelle-rathus',
    nom: 'Échelle de Rathus',
    description: "Échelle d'affirmation de soi - 30 affirmations pour mesurer votre degré d'assertivité",
    icone: '💪',
  },
]

export function getExerciseBySlug(slug: string): Exercise | undefined {
  return EXERCISES.find(e => e.slug === slug)
}
