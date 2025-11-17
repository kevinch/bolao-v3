import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import NewsList from "../newsList"
import type { NewsDocument } from "@/prismicio-types"

// Mock formatDateNews utility
vi.mock("@/app/lib/utils", () => ({
  formatDateNews: vi.fn((dateString: string) => "January 15, 2024"),
}))

// Mock PrismicRichText
vi.mock("@prismicio/react", () => ({
  PrismicRichText: ({ field }: { field: any }) => (
    <div data-testid="prismic-rich-text">{JSON.stringify(field)}</div>
  ),
}))

describe("NewsList", () => {
  const mockNewsDocument: NewsDocument = {
    id: "news-1",
    uid: "test-news-article",
    type: "news",
    href: "https://example.com/news-1",
    tags: [],
    first_publication_date: "2024-01-15T10:00:00+0000",
    last_publication_date: "2024-01-15T10:00:00+0000",
    slugs: [],
    linked_documents: [],
    lang: "en-us",
    alternate_languages: [],
    data: {
      title: [{ type: "heading1" as const, text: "Test News Article", spans: [] }],
      content: [
        {
          type: "paragraph" as const,
          text: "This is the content of the news article.",
          spans: [],
        },
      ],
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("Component Rendering", () => {
    it("should render without crashing", () => {
      render(<NewsList documents={[mockNewsDocument]} />)

      expect(screen.getByText("Test News Article")).toBeInTheDocument()
    })

    it("should render news title", () => {
      render(<NewsList documents={[mockNewsDocument]} />)

      expect(screen.getByText("Test News Article")).toBeInTheDocument()
    })

    it("should render formatted publication date", () => {
      render(<NewsList documents={[mockNewsDocument]} />)

      expect(screen.getByText("January 15, 2024")).toBeInTheDocument()
    })

    it("should call formatDateNews with correct date", async () => {
      const { formatDateNews } = await import("@/app/lib/utils")

      render(<NewsList documents={[mockNewsDocument]} />)

      expect(formatDateNews).toHaveBeenCalledWith("2024-01-15T10:00:00+0000")
    })

    it("should render PrismicRichText component", () => {
      render(<NewsList documents={[mockNewsDocument]} />)

      expect(screen.getByTestId("prismic-rich-text")).toBeInTheDocument()
    })
  })

  describe("Title Styling", () => {
    it("should have text-2xl class on title", () => {
      const { container } = render(<NewsList documents={[mockNewsDocument]} />)

      const title = container.querySelector(".text-2xl")
      expect(title).toBeInTheDocument()
      expect(title?.textContent).toBe("Test News Article")
    })

    it("should render title as h2 element", () => {
      render(<NewsList documents={[mockNewsDocument]} />)

      const title = screen.getByRole("heading", { level: 2 })
      expect(title).toBeInTheDocument()
      expect(title).toHaveTextContent("Test News Article")
    })
  })

  describe("Date Styling", () => {
    it("should have correct date styling classes", () => {
      const { container } = render(<NewsList documents={[mockNewsDocument]} />)

      const dateElement = container.querySelector(".text-sm.mb-12.text-slate-500")
      expect(dateElement).toBeInTheDocument()
      expect(dateElement?.textContent).toBe("January 15, 2024")
    })

    it("should apply small text class", () => {
      const { container } = render(<NewsList documents={[mockNewsDocument]} />)

      const dateElement = screen.getByText("January 15, 2024")
      expect(dateElement.className).toContain("text-sm")
    })

    it("should apply bottom margin class", () => {
      const { container } = render(<NewsList documents={[mockNewsDocument]} />)

      const dateElement = screen.getByText("January 15, 2024")
      expect(dateElement.className).toContain("mb-12")
    })

    it("should apply slate-500 text color", () => {
      const { container } = render(<NewsList documents={[mockNewsDocument]} />)

      const dateElement = screen.getByText("January 15, 2024")
      expect(dateElement.className).toContain("text-slate-500")
    })
  })

  describe("Layout Structure", () => {
    it("should wrap each document in a div with mb-20", () => {
      const { container } = render(<NewsList documents={[mockNewsDocument]} />)

      const wrapper = container.querySelector(".mb-20")
      expect(wrapper).toBeInTheDocument()
    })

    it("should have correct element hierarchy", () => {
      const { container } = render(<NewsList documents={[mockNewsDocument]} />)

      const wrapper = container.querySelector(".mb-20")
      expect(wrapper?.querySelector("h2")).toBeInTheDocument()
      expect(wrapper?.querySelector(".text-sm")).toBeInTheDocument()
      expect(wrapper?.querySelector('[data-testid="prismic-rich-text"]')).toBeInTheDocument()
    })
  })

  describe("Multiple Documents", () => {
    it("should render multiple news documents", () => {
      const documents: NewsDocument[] = [
        {
          ...mockNewsDocument,
          id: "news-1",
          data: {
            title: [{ type: "heading1" as const, text: "Article 1", spans: [] }],
            content: [],
          },
        },
        {
          ...mockNewsDocument,
          id: "news-2",
          data: {
            title: [{ type: "heading1" as const, text: "Article 2", spans: [] }],
            content: [],
          },
        },
        {
          ...mockNewsDocument,
          id: "news-3",
          data: {
            title: [{ type: "heading1" as const, text: "Article 3", spans: [] }],
            content: [],
          },
        },
      ]

      render(<NewsList documents={documents} />)

      expect(screen.getByText("Article 1")).toBeInTheDocument()
      expect(screen.getByText("Article 2")).toBeInTheDocument()
      expect(screen.getByText("Article 3")).toBeInTheDocument()
    })

    it("should render each document with its own key", () => {
      const documents: NewsDocument[] = [
        { ...mockNewsDocument, id: "news-1" },
        { ...mockNewsDocument, id: "news-2" },
      ]

      const { container } = render(<NewsList documents={documents} />)

      const wrappers = container.querySelectorAll(".mb-20")
      expect(wrappers).toHaveLength(2)
    })

    it("should render multiple dates correctly", async () => {
      const { formatDateNews } = await import("@/app/lib/utils")

      const documents: NewsDocument[] = [
        { ...mockNewsDocument, id: "news-1" },
        { ...mockNewsDocument, id: "news-2" },
      ]

      render(<NewsList documents={documents} />)

      expect(formatDateNews).toHaveBeenCalledTimes(2)
    })

    it("should render multiple PrismicRichText components", () => {
      const documents: NewsDocument[] = [
        { ...mockNewsDocument, id: "news-1" },
        { ...mockNewsDocument, id: "news-2" },
        { ...mockNewsDocument, id: "news-3" },
      ]

      render(<NewsList documents={documents} />)

      const richTextComponents = screen.getAllByTestId("prismic-rich-text")
      expect(richTextComponents).toHaveLength(3)
    })
  })

  describe("Empty State", () => {
    it("should render nothing when documents array is empty", () => {
      const { container } = render(<NewsList documents={[]} />)

      // Fragment renders as empty div
      const wrappers = container.querySelectorAll(".mb-20")
      expect(wrappers).toHaveLength(0)
    })

    it("should not call formatDateNews when no documents", async () => {
      const { formatDateNews } = await import("@/app/lib/utils")

      render(<NewsList documents={[]} />)

      expect(formatDateNews).not.toHaveBeenCalled()
    })
  })

  describe("Title Variations", () => {
    it("should handle title with multiple text elements", () => {
      const document = {
        ...mockNewsDocument,
        data: {
          title: [
            { type: "heading1" as const, text: "First Part", spans: [] },
            { type: "heading1" as const, text: "Second Part", spans: [] },
          ],
          content: [],
        },
      }

      render(<NewsList documents={[document]} />)

      // Should only display first element
      expect(screen.getByText("First Part")).toBeInTheDocument()
    })

    it("should handle empty title array", () => {
      const document = {
        ...mockNewsDocument,
        data: {
          title: [],
          content: [],
        },
      }

      const { container } = render(<NewsList documents={[document]} />)

      const title = container.querySelector("h2")
      expect(title).toBeInTheDocument()
      expect(title?.textContent).toBe("")
    })

    it("should handle title with special characters", () => {
      const document = {
        ...mockNewsDocument,
        data: {
          title: [
            {
              type: "heading1" as const,
              text: "Special & Characters: <Test>",
              spans: [],
            },
          ],
          content: [],
        },
      }

      render(<NewsList documents={[document]} />)

      expect(screen.getByText("Special & Characters: <Test>")).toBeInTheDocument()
    })

    it("should handle very long titles", () => {
      const longTitle = "A".repeat(200)
      const document = {
        ...mockNewsDocument,
        data: {
          title: [{ type: "heading1" as const, text: longTitle, spans: [] }],
          content: [],
        },
      }

      render(<NewsList documents={[document]} />)

      expect(screen.getByText(longTitle)).toBeInTheDocument()
    })

    it("should handle title with Unicode characters", () => {
      const document = {
        ...mockNewsDocument,
        data: {
          title: [
            {
              type: "heading1" as const,
              text: "Notícias sobre Futebol ⚽ 🏆",
              spans: [],
            },
          ],
          content: [],
        },
      }

      render(<NewsList documents={[document]} />)

      expect(screen.getByText("Notícias sobre Futebol ⚽ 🏆")).toBeInTheDocument()
    })
  })

  describe("Date Variations", () => {
    it("should handle different date formats", () => {
      const document = {
        ...mockNewsDocument,
        first_publication_date: "2023-12-25T23:59:59+0000",
      }

      render(<NewsList documents={[document]} />)

      expect(screen.getByText("January 15, 2024")).toBeInTheDocument()
    })

    it("should format each document's date independently", async () => {
      const { formatDateNews } = await import("@/app/lib/utils")
      vi.mocked(formatDateNews).mockImplementation((date: string) => {
        if (date === "2024-01-15T10:00:00+0000") return "January 15, 2024"
        if (date === "2024-02-20T10:00:00+0000") return "February 20, 2024"
        return "Unknown"
      })

      const documents: NewsDocument[] = [
        {
          ...mockNewsDocument,
          id: "news-1",
          first_publication_date: "2024-01-15T10:00:00+0000",
          data: {
            title: [{ type: "heading1" as const, text: "Article 1", spans: [] }],
            content: [],
          },
        },
        {
          ...mockNewsDocument,
          id: "news-2",
          first_publication_date: "2024-02-20T10:00:00+0000",
          data: {
            title: [{ type: "heading1" as const, text: "Article 2", spans: [] }],
            content: [],
          },
        },
      ]

      render(<NewsList documents={documents} />)

      expect(screen.getByText("January 15, 2024")).toBeInTheDocument()
      expect(screen.getByText("February 20, 2024")).toBeInTheDocument()
    })
  })

  describe("Content Integration", () => {
    it("should pass content field to PrismicRichText", () => {
      const content = [
        {
          type: "paragraph" as const,
          text: "Test content paragraph",
          spans: [],
        },
      ]

      const document = {
        ...mockNewsDocument,
        data: {
          title: [{ type: "heading1" as const, text: "Test", spans: [] }],
          content,
        },
      }

      render(<NewsList documents={[document]} />)

      const richText = screen.getByTestId("prismic-rich-text")
      expect(richText.textContent).toContain(JSON.stringify(content))
    })

    it("should handle empty content", () => {
      const document = {
        ...mockNewsDocument,
        data: {
          title: [{ type: "heading1" as const, text: "Test", spans: [] }],
          content: [],
        },
      }

      render(<NewsList documents={[document]} />)

      const richText = screen.getByTestId("prismic-rich-text")
      expect(richText).toBeInTheDocument()
    })

    it("should handle complex content structures", () => {
      const complexContent = [
        {
          type: "paragraph" as const,
          text: "First paragraph",
          spans: [],
        },
        {
          type: "heading2" as const,
          text: "Subheading",
          spans: [],
        },
        {
          type: "paragraph" as const,
          text: "Second paragraph",
          spans: [],
        },
      ]

      const document = {
        ...mockNewsDocument,
        data: {
          title: [{ type: "heading1" as const, text: "Test", spans: [] }],
          content: complexContent,
        },
      }

      render(<NewsList documents={[document]} />)

      const richText = screen.getByTestId("prismic-rich-text")
      expect(richText.textContent).toContain(JSON.stringify(complexContent))
    })
  })

  describe("Edge Cases", () => {
    it("should handle empty title array gracefully", () => {
      const document = {
        ...mockNewsDocument,
        data: {
          title: [],
          content: [],
        },
      }

      const { container } = render(<NewsList documents={[document]} />)

      const title = container.querySelector("h2")
      expect(title).toBeInTheDocument()
    })

    it("should handle very large number of documents", () => {
      const documents = Array.from({ length: 100 }, (_, i) => ({
        ...mockNewsDocument,
        id: `news-${i}`,
        data: {
          title: [{ type: "heading1" as const, text: `Article ${i}`, spans: [] }],
          content: [],
        },
      }))

      render(<NewsList documents={documents} />)

      const wrappers = screen.getAllByRole("heading", { level: 2 })
      expect(wrappers).toHaveLength(100)
    })

    it("should handle document without id", () => {
      const document = {
        ...mockNewsDocument,
        id: undefined as any,
      }

      const { container } = render(<NewsList documents={[document]} />)

      // Should still render
      expect(container.querySelector(".mb-20")).toBeInTheDocument()
    })
  })

  describe("Accessibility", () => {
    it("should use semantic HTML with h2 for titles", () => {
      render(<NewsList documents={[mockNewsDocument]} />)

      const heading = screen.getByRole("heading", { level: 2 })
      expect(heading).toBeInTheDocument()
    })

    it("should have all titles as headings", () => {
      const documents: NewsDocument[] = [
        {
          ...mockNewsDocument,
          id: "news-1",
          data: {
            title: [{ type: "heading1" as const, text: "Article 1", spans: [] }],
            content: [],
          },
        },
        {
          ...mockNewsDocument,
          id: "news-2",
          data: {
            title: [{ type: "heading1" as const, text: "Article 2", spans: [] }],
            content: [],
          },
        },
      ]

      render(<NewsList documents={documents} />)

      const headings = screen.getAllByRole("heading", { level: 2 })
      expect(headings).toHaveLength(2)
    })
  })
})

