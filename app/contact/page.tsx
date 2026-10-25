import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import PageTitle from "@/app/components/pageTitle"
import ContactForm from "./contactForm"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("contact")

  return {
    title: t("title"),
    description: t("metaDescription"),
    alternates: { canonical: "/contact" },
  }
}

export default async function ContactPage() {
  const t = await getTranslations("contact")

  return (
    <main className="mx-auto max-w-2xl">
      <PageTitle center>
        <h1>{t("title")}</h1>
      </PageTitle>
      <p className="mb-8 text-center text-muted-foreground">{t("intro")}</p>
      <ContactForm />
    </main>
  )
}
