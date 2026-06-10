import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import NewsPost, { generateMetadata } from "@/app/news/[uid]/page"
import { createClient } from "@/prismicio"

// Mock dependencies
vi.mock("@/prismicio")

vi.mock("@prismicio/react", () => ({
  PrismicRichText: ({ field }: { field: any }) => (
    <div data-testid="prismic-rich-text">{JSON.stringify(field)}</div>
  ),
}))

describe("NewsPost", () => {
  const mockParams = Promise.resolve({ uid: "test-news-post" })

  const mockDocument = {
    id: "1",
    uid: "test-news-post",
    type: "news",
    first_publication_date: "2024-01-15T10:00:00+0000",
    last_publication_date: "2024-01-16T10:00:00+0000",
    data: {
      title: [{ type: "heading1", text: "Test News Title", spans: [] }],
      content: [{ type: "paragraph", text: "Test news content", spans: [] }],
      meta_title: null,
      meta_description: null,
      meta_image: {},
    },
  }

  const mockClient = {
    getByUID: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should render the news post article", async () => {
    ;(createClient as any).mockReturnValue(mockClient)
    mockClient.getByUID.mockResolvedValue(mockDocument)

    const result = await NewsPost({ params: mockParams })
    render(result)

    // Title rendered as h1
    expect(
      screen.getByRole("heading", { level: 1, name: "Test News Title" })
    ).toBeInTheDocument()

    // Content rendered through PrismicRichText
    expect(screen.getByTestId("prismic-rich-text").textContent).toContain(
      "Test news content"
    )

    // Verify client methods were called correctly
    expect(createClient).toHaveBeenCalledOnce()
    expect(mockClient.getByUID).toHaveBeenCalledWith("news", "test-news-post")
  })

  it("should generate metadata falling back to document title and content", async () => {
    ;(createClient as any).mockReturnValue(mockClient)
    mockClient.getByUID.mockResolvedValue(mockDocument)

    const metadata = await generateMetadata({ params: mockParams })

    expect(metadata.title).toBe("Test News Title")
    expect(metadata.description).toContain("Test news content")
    expect(metadata.alternates?.canonical).toBe("/news/test-news-post")
  })

  it("should prefer Prismic meta fields when present", async () => {
    ;(createClient as any).mockReturnValue(mockClient)
    mockClient.getByUID.mockResolvedValue({
      ...mockDocument,
      data: {
        ...mockDocument.data,
        meta_title: "Custom Meta Title",
        meta_description: "Custom meta description",
      },
    })

    const metadata = await generateMetadata({ params: mockParams })

    expect(metadata.title).toBe("Custom Meta Title")
    expect(metadata.description).toBe("Custom meta description")
  })
})
