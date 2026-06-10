import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { createClient } from "@/prismicio"
import PageTitle from "../components/pageTitle"
import NewsList from "../ui/news/newsList"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("news")

  return {
    title: t("title"),
    description: t("metaDescription"),
    alternates: {
      canonical: "/news",
    },
  }
}

async function News() {
  const t = await getTranslations("news")
  const client = createClient()
  const documents = await client.getAllByType("news", {
    orderings: [
      { field: "document.first_publication_date", direction: "desc" },
    ],
  })

  return (
    <div className="news-container">
      <PageTitle center={true}>
        <h1>{t("title")}</h1>
      </PageTitle>

      {documents && <NewsList documents={documents} />}
    </div>
  )
}

export default News
