import type { MetadataRoute } from "next"
import { SITE_URL } from "@/app/lib/siteConfig"

const disallowed = ["/admin", "/bolao", "/api", "/sign-up/db"]

// Explicitly welcome AI assistant crawlers (ChatGPT, Claude, Perplexity, etc.)
// so bolao.io can be discovered and cited in AI-generated answers.
const aiCrawlers = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "anthropic-ai",
  "PerplexityBot",
  "Google-Extended",
  "Bingbot",
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: disallowed,
      },
      ...aiCrawlers.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: disallowed,
      })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
