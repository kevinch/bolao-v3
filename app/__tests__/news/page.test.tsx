import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import News from "@/app/news/page"
import { createClient } from "@/prismicio"

// Mock dependencies
vi.mock("@/prismicio")
vi.mock("@/app/components/pageTitle", () => ({
    default: ({ children, center }: { children: React.ReactNode, center?: boolean }) => (
        <div data-testid="page-title" data-center={center}>{children}</div>
    )
}))
vi.mock("@/app/ui/news/newsList", () => ({
    default: (props: any) => <div data-testid="news-list" data-props={JSON.stringify(props)} />
}))

describe("News", () => {
    const mockDocuments = [
        { id: "1", uid: "news-1", type: "news", data: { title: "News 1" } },
        { id: "2", uid: "news-2", type: "news", data: { title: "News 2" } }
    ]

    const mockClient = {
        getAllByType: vi.fn()
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("should render page with news list when documents exist", async () => {
        (createClient as any).mockReturnValue(mockClient);
        mockClient.getAllByType.mockResolvedValue(mockDocuments);

        const result = await News()
        render(result)

        expect(screen.getByTestId("page-title")).toBeDefined()
        expect(screen.getByText("News")).toBeDefined()
        expect(screen.getByTestId("news-list")).toBeDefined()

        // Verify PageTitle has center prop
        const pageTitle = screen.getByTestId("page-title")
        expect(pageTitle.getAttribute("data-center")).toBe("true")

        // Verify NewsList receives documents
        const newsList = screen.getByTestId("news-list")
        const newsListProps = JSON.parse(newsList.getAttribute("data-props") || "{}")
        expect(newsListProps.documents).toEqual(mockDocuments)

        // Verify client methods were called
        expect(createClient).toHaveBeenCalledOnce()
        expect(mockClient.getAllByType).toHaveBeenCalledWith("news")
    })

    it("should render page with news list even when documents are empty", async () => {
        (createClient as any).mockReturnValue(mockClient);
        mockClient.getAllByType.mockResolvedValue([]);

        const result = await News()
        render(result)

        expect(screen.getByTestId("page-title")).toBeDefined()
        expect(screen.getByText("News")).toBeDefined()
        // Empty array is truthy, so NewsList will still render
        expect(screen.getByTestId("news-list")).toBeDefined()

        const newsList = screen.getByTestId("news-list")
        const newsListProps = JSON.parse(newsList.getAttribute("data-props") || "{}")
        expect(newsListProps.documents).toEqual([])
    })
})
