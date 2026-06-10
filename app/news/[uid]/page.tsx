import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { asText, asImageSrc } from "@prismicio/client"
import { PrismicRichText } from "@prismicio/react"
import { createClient } from "@/prismicio"
import PageTitle from "@/app/components/pageTitle"
import JsonLd from "@/app/components/jsonLd"
import { formatDateNews } from "@/app/lib/utils"
import { SITE_URL, SITE_NAME } from "@/app/lib/siteConfig"

type Props = {
  params: Promise<{ uid: string }>
}

async function getDocument(uid: string) {
  const client = createClient()
  return client.getByUID("news", uid).catch(() => null)
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { uid } = await props.params
  const document = await getDocument(uid)

  if (!document) return {}

  const title = document.data.meta_title || asText(document.data.title)
  const description =
    document.data.meta_description ||
    asText(document.data.content).slice(0, 160)
  const image = asImageSrc(document.data.meta_image)

  return {
    title,
    description,
    alternates: {
      canonical: `/news/${uid}`,
    },
    openGraph: {
      type: "article",
      title,
      description,
      url: `${SITE_URL}/news/${uid}`,
      publishedTime: document.first_publication_date,
      modifiedTime: document.last_publication_date,
      ...(image && { images: [image] }),
    },
  }
}

async function NewsPost(props: Props) {
  const { uid } = await props.params
  const document = await getDocument(uid)

  if (!document) notFound()

  const title = asText(document.data.title)

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description:
      document.data.meta_description ||
      asText(document.data.content).slice(0, 160),
    datePublished: document.first_publication_date,
    dateModified: document.last_publication_date,
    mainEntityOfPage: `${SITE_URL}/news/${uid}`,
    author: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    publisher: { "@id": `${SITE_URL}/#organization` },
  }

  return (
    <article className="max-w-2xl mx-auto">
      <JsonLd data={articleJsonLd} />

      <PageTitle center={true}>
        <h1>{title}</h1>
      </PageTitle>

      <div className="text-sm mb-12 text-slate-500 text-center">
        {formatDateNews(document.first_publication_date)}
      </div>

      <div className="news-container">
        <PrismicRichText field={document.data.content} />
      </div>
    </article>
  )
}

export default NewsPost
