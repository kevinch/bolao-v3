import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import PageTitle from "@/app/components/pageTitle"
import JsonLd from "@/app/components/jsonLd"

const QUESTION_KEYS = ["1", "2", "3", "4", "5", "6"] as const
const SCORING_TIER_KEYS = [
  "tierExact",
  "tierWinnerScore",
  "tierDraw",
  "tierWinnerLoser",
  "tierGoalDiff",
  "tierWinnerOnly",
] as const

type FaqTranslator = Awaited<ReturnType<typeof getTranslations<"faq">>>

function getScoringAnswerText(t: FaqTranslator): string {
  return [
    t("scoring.intro"),
    ...SCORING_TIER_KEYS.map((key) => t(`scoring.${key}`)),
    t("scoring.championBonus"),
    t("scoring.outro"),
  ].join(" ")
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("faq")

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: "/faq",
    },
  }
}

export default async function Faq() {
  const t = await getTranslations("faq")

  const questions = QUESTION_KEYS.map((key) => ({
    key,
    question: t(`q${key}`),
    answer: key === "5" ? getScoringAnswerText(t) : t(`a${key}`),
  }))

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: {
        "@type": "Answer",
        text: answer,
      },
    })),
  }

  return (
    <div className="max-w-2xl mx-auto">
      <JsonLd data={faqJsonLd} />

      <PageTitle center={true}>
        <h1>{t("title")}</h1>
      </PageTitle>

      {questions.map(({ key, question, answer }) => (
        <section key={question} className="mb-10">
          <h2 className="text-2xl mb-4">{question}</h2>
          {key === "5" ? (
            <>
              <p className="mb-4">{t("scoring.intro")}</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                {SCORING_TIER_KEYS.map((tierKey) => (
                  <li key={tierKey}>{t(`scoring.${tierKey}`)}</li>
                ))}
              </ul>
              <p className="mb-4">{t("scoring.championBonus")}</p>
              <p>{t("scoring.outro")}</p>
            </>
          ) : (
            <p>{answer}</p>
          )}
        </section>
      ))}
    </div>
  )
}
