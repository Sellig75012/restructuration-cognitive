export interface Distorsion {
  id: number
  nom: string
  description: string
  exemple: string
  icone: string
  couleur: string
}

export const DISTORSIONS: Distorsion[] = [
  {
    id: 1,
    nom: 'Lecture de pensée',
    description: "Être convaincu de connaître le contenu des pensées de quelqu'un d'autre, à partir de peu d'éléments concrets, avec des difficultés à envisager d'autres explications plausibles.",
    exemple: "Elle pense que je suis un bon-à-rien, ça se voit à son regard.",
    icone: '🔮',
    couleur: '#8B5CF6',
  },
  {
    id: 2,
    nom: 'Disqualification du positif',
    description: "Minimiser à outrance les aspects positifs d'une expérience ou d'un comportement.",
    exemple: "J'ai eu 17/30 mais ça ne compte pas : le contrôle était simple.",
    icone: '👎',
    couleur: '#EC4899',
  },
  {
    id: 3,
    nom: 'Raisonnement émotionnel',
    description: "Croire que quelque chose est vrai parce que c'est ce qu'on ressent profondément, malgré les faits.",
    exemple: "Je suis terrifié par les avions, alors voler en avion doit être dangereux.",
    icone: '💭',
    couleur: '#F59E0B',
  },
  {
    id: 4,
    nom: 'Surgénéralisation',
    description: "Extrapoler à partir de peu d'éléments. Tirer des conclusions générales qui dépassent nettement la réalité à partir d'un évènement isolé. Les mots « toujours, jamais, tout » sont souvent employés.",
    exemple: "J'ai eu un 7/20 à mon contrôle. J'échoue dans tout ce que j'entreprends dans la vie.",
    icone: '🌊',
    couleur: '#3B82F6',
  },
  {
    id: 5,
    nom: 'Anticipation négative',
    description: "Anticiper négativement le futur, comme si le pire allait se passer, sans envisager d'autres issues. Aussi appelée dramatisation ou catastrophisme.",
    exemple: "J'ai observé un nouveau grain de beauté, ce qui veut dire que j'ai le cancer.",
    icone: '⚡',
    couleur: '#EF4444',
  },
  {
    id: 6,
    nom: 'Pensée dichotomique',
    description: "Envisager les faits d'une façon extrême, voire passer d'un extrême à l'autre, sans nuances. Aussi appelée « pensée en tout-ou-rien ».",
    exemple: "Soit on est avec moi, soit on est contre moi.",
    icone: '⚖️',
    couleur: '#6366F1',
  },
  {
    id: 7,
    nom: 'Étiquetage',
    description: "Attribuer à soi-même ou à quelqu'un d'autre une étiquette, un jugement de valeur généralement négatif ou définir quelqu'un de façon extrêmement réductrice.",
    exemple: "Je suis un raté.",
    icone: '🏷️',
    couleur: '#14B8A6',
  },
  {
    id: 8,
    nom: 'Personnalisation',
    description: "Prendre les choses personnellement, s'attribuer injustement la responsabilité des évènements.",
    exemple: "Il est triste à cause de moi.",
    icone: '🎯',
    couleur: '#F97316',
  },
  {
    id: 9,
    nom: 'Abstraction sélective',
    description: "Focaliser son attention sur un détail négatif précis, sans avoir de vision globale de la situation.",
    exemple: "La soirée s'est mal passée : le champagne était mauvais.",
    icone: '🔍',
    couleur: '#84CC16',
  },
  {
    id: 10,
    nom: 'Filtre négatif',
    description: "Ne filtrer que les informations négatives sans considérer les informations positives.",
    exemple: "Le monde va mal. Nous sommes tous égoïstes. Il n'y a pas de solidarité.",
    icone: '🕶️',
    couleur: '#64748B',
  },
  {
    id: 11,
    nom: 'Maximalisation / Minimalisation',
    description: "Tendance à surévaluer les aspects négatifs d'une situation et à minimiser les aspects positifs.",
    exemple: "Mon mari ne me fait que des reproches. Il a été présent récemment, mais il va se lasser.",
    icone: '📊',
    couleur: '#A855F7',
  },
  {
    id: 12,
    nom: 'Devoir / Fausses obligations',
    description: "S'imposer des actes, des règles, des comportements sans que personne ne les exige. Obéir à des règles rigides, surestimer les conséquences du non-respect.",
    exemple: "Je dois toujours obéir à mes parents. Sinon je suis une mauvaise fille.",
    icone: '⛓️',
    couleur: '#DC2626',
  },
  {
    id: 13,
    nom: 'Inférence arbitraire',
    description: "Présenter comme des faits des affirmations pour lesquelles nous n'avons aucune preuve. Aussi appelée conclusions hâtives.",
    exemple: "Mon patron ne m'a pas regardé, il pense que je suis incompétent.",
    icone: '🎲',
    couleur: '#0891B2',
  },
  {
    id: 14,
    nom: 'Blâme',
    description: "Rendre les autres responsables de ma souffrance ou se rendre responsable des comportements et des attitudes des autres.",
    exemple: "C'est de ma faute si mon fils a épousé une personne égoïste.",
    icone: '👆',
    couleur: '#BE185D',
  },
]
