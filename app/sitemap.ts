import type { MetadataRoute } from "next"
import { createClient } from "@/prismicio"
import { SITE_URL } from "@/app/lib/siteConfig"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/about`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/faq`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/news`,
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ]

  let newsRoutes: MetadataRoute.Sitemap = []
  try {
    const client = createClient()
    const documents = await client.getAllByType("news")

    newsRoutes = documents.map((document) => ({
      url: `${SITE_URL}/news/${document.uid}`,
      lastModified: new Date(document.last_publication_date),
      changeFrequency: "monthly",
      priority: 0.6,
    }))
  } catch {
    // CMS unavailable: still serve the static routes.
  }

  return [...staticRoutes, ...newsRoutes]
}
