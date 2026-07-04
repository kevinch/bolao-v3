import { describe, it, expect } from "vitest"
import robots from "../robots"
import { SITE_URL } from "@/app/lib/siteConfig"

describe("robots", () => {
  it("allows public pages and blocks private routes", () => {
    const result = robots()

    expect(result.sitemap).toBe(`${SITE_URL}/sitemap.xml`)

    const defaultRule = result.rules.find((rule) => rule.userAgent === "*")
    expect(defaultRule).toEqual({
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/bolao", "/api", "/sign-up/db"],
    })
  })

  it("includes explicit rules for AI crawlers", () => {
    const result = robots()

    const aiAgents = [
      "GPTBot",
      "OAI-SearchBot",
      "ChatGPT-User",
      "ClaudeBot",
      "anthropic-ai",
      "PerplexityBot",
      "Google-Extended",
      "Bingbot",
    ]

    for (const userAgent of aiAgents) {
      expect(result.rules).toContainEqual({
        userAgent,
        allow: "/",
        disallow: ["/admin", "/bolao", "/api", "/sign-up/db"],
      })
    }
  })
})
