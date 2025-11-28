import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import NewsPost from "@/app/news/[uid]/page"
import { createClient } from "@/prismicio"

// Mock dependencies
vi.mock("@/prismicio")

describe("NewsPost", () => {
    const mockParams = Promise.resolve({ uid: "test-news-post" })

    const mockDocument = {
        id: "1",
        uid: "test-news-post",
        type: "news",
        data: {
            title: [{ text: "Test News Title" }],
            content: [{ text: "Test news content" }]
        }
    }

    const mockClient = {
        getByUID: vi.fn()
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("should render news post document as JSON", async () => {
        (createClient as any).mockReturnValue(mockClient);
        mockClient.getByUID.mockResolvedValue(mockDocument);

        const result = await NewsPost({ params: mockParams })
        render(result)

        // Verify the document is rendered as JSON
        const preElement = screen.getByText((content, element) => {
            return element?.tagName.toLowerCase() === 'pre' && content.includes('"uid": "test-news-post"')
        })
        expect(preElement).toBeDefined()

        // Verify client methods were called correctly
        expect(createClient).toHaveBeenCalledOnce()
        expect(mockClient.getByUID).toHaveBeenCalledWith("news", "test-news-post")
    })
})
