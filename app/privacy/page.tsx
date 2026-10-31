import type { Metadata } from "next"
import Link from "next/link"
import { getTranslations } from "next-intl/server"
import PageTitle from "@/app/components/pageTitle"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("privacy")

  return {
    title: t("title"),
    description: t("metaDescription"),
    alternates: { canonical: "/privacy" },
  }
}

const SECTION_KEYS = [
  "controller",
  "data",
  "purposes",
  "sharing",
  "cookies",
  "retention",
  "rights",
  "security",
  "updates",
] as const

export default async function PrivacyPage() {
  const t = await getTranslations("privacy")

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
          {key === "controller" && (
            <Link
              className="mt-3 inline-block underline hover:no-underline"
              href="/contact"
            >
              {t("controller.contactLink")}
            </Link>
          )}
          {key === "data" && (
            <ul className="mt-4 list-disc space-y-2 pl-6">
              {["account", "activity", "contact", "technical"].map((item) => (
                <li key={item}>{t(`data.${item}`)}</li>
              ))}
            </ul>
          )}
          {key === "sharing" && (
            <ul className="mt-4 list-disc space-y-2 pl-6">
              {[
                "clerk",
                "vercel",
                "umami",
                "infrastructure",
                "content",
                "email",
                "football",
              ].map((provider) => (
                <li key={provider}>{t(`sharing.${provider}`)}</li>
              ))}
            </ul>
          )}
          {key === "cookies" && (
            <ul className="mt-4 list-disc space-y-2 pl-6">
              {["locale", "auth", "storage", "analytics"].map((item) => (
                <li key={item}>{t(`cookies.${item}`)}</li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </main>
  )
}
