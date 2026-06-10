import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import PageTitle from "@/app/components/pageTitle"
import JsonLd from "@/app/components/jsonLd"

const QUESTION_KEYS = ["1", "2", "3", "4", "5", "6"] as const

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
    question: t(`q${key}`),
    answer: t(`a${key}`),
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

      {questions.map(({ question, answer }) => (
        <section key={question} className="mb-10">
          <h2 className="text-2xl mb-4">{question}</h2>
          <p>{answer}</p>
        </section>
      ))}
    </div>
  )
}
