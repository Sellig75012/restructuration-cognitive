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
  // Les futurs exercices seront ajoutés ici
  // {
  //   slug: 'exposition-progressive',
  //   nom: 'Exposition Progressive',
  //   description: 'Hiérarchie des situations anxiogènes et progression',
  //   icone: '🪜',
  // },
]

export function getExerciseBySlug(slug: string): Exercise | undefined {
  return EXERCISES.find(e => e.slug === slug)
}
