export const SITE_URL = "https://bolao.io"

export const SITE_NAME = "Bolão.io"

export const SITE_DESCRIPTIONS = {
  en: "Create a free bolão (soccer betting pool) with friends. Predict match results, track live standings and compete for bragging rights. No money involved, 100% free.",
  "pt-br":
    "Crie um bolão de futebol grátis com os amigos. Dê palpites nos resultados, acompanhe a classificação ao vivo e dispute pelo direito de se gabar. Sem dinheiro envolvido, 100% grátis.",
} as const

export const SITE_DESCRIPTION = SITE_DESCRIPTIONS.en

export function getSiteDescription(locale: string) {
  return SITE_DESCRIPTIONS[locale as keyof typeof SITE_DESCRIPTIONS] ?? SITE_DESCRIPTION
}
