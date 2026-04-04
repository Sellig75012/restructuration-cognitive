export interface RathusItem {
  id: number
  texte: string
  inverse: boolean
}

export const RATHUS_ITEMS: RathusItem[] = [
  { id: 1, texte: "La plupart des gens me semblent être plus agressifs et défendre mieux leurs droits que moi.", inverse: true },
  { id: 2, texte: "Il m'est arrivé d'hésiter par timidité au moment de donner ou d'accepter des rendez-vous.", inverse: true },
  { id: 3, texte: "Quand la nourriture dans un restaurant ne me satisfait pas, je m'en plains au serveur ou à la serveuse.", inverse: false },
  { id: 4, texte: "Je fais attention à ne pas heurter les sentiments des autres, même lorsque je sens que l'on m'a blessé(e).", inverse: true },
  { id: 5, texte: "Si un vendeur s'est donné beaucoup de mal à me montrer une marchandise qui ne me convient pas parfaitement, j'ai un moment difficile lorsque je dois dire non.", inverse: true },
  { id: 6, texte: "Lorsqu'on me demande de faire quelque chose, j'insiste pour en savoir la raison.", inverse: false },
  { id: 7, texte: "Il y a des moments où je cherche une bonne et vigoureuse discussion.", inverse: false },
  { id: 8, texte: "Je me bats pour arriver aussi bien que les autres dans ma profession.", inverse: false },
  { id: 9, texte: "A vrai dire, les gens tirent souvent profit de moi.", inverse: true },
  { id: 10, texte: "J'ai du plaisir à entreprendre des conversations avec de nouvelles connaissances ou des étrangers.", inverse: false },
  { id: 11, texte: "Souvent je ne sais rien dire à des personnes séduisantes du sexe opposé.", inverse: true },
  { id: 12, texte: "J'hésiterais à téléphoner à un grand établissement de commerce ou à une administration.", inverse: true },
  { id: 13, texte: "Je préférerais poser ma candidature pour un autre travail par lettre plutôt que par un entretien personnel.", inverse: true },
  { id: 14, texte: "Je trouve embarrassant de renvoyer une marchandise.", inverse: true },
  { id: 15, texte: "Si un parent proche et respecté est en train de m'ennuyer, j'étoufferais mes sentiments plutôt que d'exprimer cette gêne.", inverse: true },
  { id: 16, texte: "Il m'est arrivé de ne pas poser des questions, par peur de paraître stupide.", inverse: true },
  { id: 17, texte: "Pendant une discussion serrée, j'ai souvent peur d'être bouleversé(e) au point de trembler de tout mon corps.", inverse: true },
  { id: 18, texte: "Si un conférencier réputé et respecté dit quelque chose que je pense inexact, j'aimerais que le public entende aussi mon point de vue.", inverse: false },
  { id: 19, texte: "J'évite de discuter les prix avec les représentants et les vendeurs.", inverse: true },
  { id: 20, texte: "Lorsque j'ai fait quelque chose d'important et de valable, je m'arrange pour le faire savoir aux autres.", inverse: false },
  { id: 21, texte: "Je suis ouvert et franc au sujet de mes sentiments.", inverse: false },
  { id: 22, texte: "Si quelqu'un a répandu des histoires fausses et de mauvais goût à mon sujet, je le vois aussi vite que possible pour une explication.", inverse: false },
  { id: 23, texte: "J'ai souvent un moment difficile lorsque je dois dire non.", inverse: true },
  { id: 24, texte: "J'ai tendance à contenir des émotions plutôt que de faire une scène.", inverse: true },
  { id: 25, texte: "Je me plains lorsque le service est mal fait, dans un restaurant ou ailleurs.", inverse: false },
  { id: 26, texte: "Souvent je ne sais pas quoi dire lorsqu'on me fait un compliment.", inverse: true },
  { id: 27, texte: "Au cinéma, au théâtre, ou lors d'une conférence, si un couple près de moi est en train de parler à voix haute, je lui demande de se taire ou d'aller autre part.", inverse: false },
  { id: 28, texte: "Quiconque cherche à passer devant moi dans une queue risque une bonne explication.", inverse: false },
  { id: 29, texte: "Je suis rapide dans l'expression de mes opinions.", inverse: false },
  { id: 30, texte: "Il y a des moments où je ne sais pas quoi dire.", inverse: true },
]

export const RATHUS_SCALE = [
  { value: -3, label: 'Vraiment non caractéristique' },
  { value: -2, label: 'Plutôt non caractéristique' },
  { value: -1, label: 'Un peu non caractéristique' },
  { value: 1, label: 'Un peu caractéristique' },
  { value: 2, label: 'Plutôt caractéristique' },
  { value: 3, label: 'Très caractéristique' },
]

export function calculateRathusScore(responses: Record<number, number>): number {
  let total = 0
  for (const item of RATHUS_ITEMS) {
    const value = responses[item.id] ?? 0
    total += item.inverse ? -value : value
  }
  return total
}

export function interpretRathusScore(score: number): { niveau: string; description: string; couleur: string } {
  if (score <= -30) {
    return {
      niveau: 'Difficultés importantes',
      description: 'Vous présentez des difficultés significatives d\'affirmation de soi, dans le sens de la passivité. Un travail thérapeutique sur l\'affirmation de soi serait bénéfique.',
      couleur: '#EF4444',
    }
  }
  if (score <= -10) {
    return {
      niveau: 'Tendance passive',
      description: 'Vous avez une tendance à la passivité dans vos relations sociales. Certaines situations vous posent des difficultés pour vous affirmer.',
      couleur: '#F97316',
    }
  }
  if (score <= 10) {
    return {
      niveau: 'Comportement normalement affirmé',
      description: 'Votre score traduit un comportement normalement affirmé. Vous savez généralement exprimer vos besoins tout en respectant ceux des autres.',
      couleur: '#22C55E',
    }
  }
  if (score <= 30) {
    return {
      niveau: 'Bien affirmé',
      description: 'Vous êtes bien affirmé(e) dans vos relations sociales. Vous exprimez facilement vos opinions et vos besoins.',
      couleur: '#3B82F6',
    }
  }
  return {
    niveau: 'Très affirmé / Tendance assertive forte',
    description: 'Votre score est élevé, ce qui peut traduire une forte affirmation de soi. Veillez à ce que cette affirmation reste respectueuse des autres.',
    couleur: '#8B5CF6',
  }
}
