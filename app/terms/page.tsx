import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import PageTitle from "@/app/components/pageTitle"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("terms")

  return {
    title: t("title"),
    description: t("metaDescription"),
    alternates: { canonical: "/terms" },
  }
}

const SECTION_KEYS = [
  "service",
  "accounts",
  "acceptableUse",
  "content",
  "availability",
  "thirdParties",
  "changes",
  "contact",
] as const

export default async function TermsPage() {
  const t = await getTranslations("terms")

  return (
    <main className="mx-auto max-w-2xl">
      <PageTitle center>
        <h1>{t("title")}</h1>
      </PageTitle>

      <p className="mb-10 text-center text-sm text-muted-foreground">
        {t("lastUpdated")}
      </p>
      <p className="mb-10">{t("intro")}</p>

      {SECTION_KEYS.map((key) => (
        <section key={key} className="mb-10">
          <h2 className="mb-4 text-2xl">{t(`${key}.title`)}</h2>
          <p>{t(`${key}.body`)}</p>
        </section>
      ))}
    </main>
  )
}
