import { describe, it, expect, vi, beforeEach } from "vitest"
import sitemap from "../sitemap"
import { createClient } from "@/prismicio"
import { SITE_URL } from "@/app/lib/siteConfig"

vi.mock("@/prismicio")

describe("sitemap", () => {
  const mockClient = {
    getAllByType: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(createClient as ReturnType<typeof vi.fn>).mockReturnValue(mockClient)
  })

  it("includes static routes", async () => {
    mockClient.getAllByType.mockResolvedValue([])

    const result = await sitemap()

    expect(result).toEqual(
      expect.arrayContaining([
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
      ])
    )
  })

  it("adds news article routes from Prismic", async () => {
    mockClient.getAllByType.mockResolvedValue([
      {
        uid: "world-cup-preview",
        last_publication_date: "2026-01-15T12:00:00.000Z",
      },
    ])

    const result = await sitemap()

    expect(createClient).toHaveBeenCalledOnce()
    expect(mockClient.getAllByType).toHaveBeenCalledWith("news")
    expect(result).toContainEqual({
      url: `${SITE_URL}/news/world-cup-preview`,
      lastModified: new Date("2026-01-15T12:00:00.000Z"),
      changeFrequency: "monthly",
      priority: 0.6,
    })
  })

  it("returns static routes when Prismic is unavailable", async () => {
    mockClient.getAllByType.mockRejectedValue(new Error("CMS down"))

    const result = await sitemap()

    expect(result).toHaveLength(4)
    expect(result.every((entry) => !entry.url.includes("/news/"))).toBe(true)
  })
})
