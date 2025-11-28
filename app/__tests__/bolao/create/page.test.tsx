import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import CreateBolao from "@/app/bolao/create/page"
import { fetchLeagues } from "@/app/lib/data"

// Mock dependencies
vi.mock("@/app/lib/data")
vi.mock("@/app/components/pageTitle", () => ({
    default: ({ children, center }: { children: React.ReactNode, center?: boolean }) => (
        <div data-testid="page-title" data-center={center}>{children}</div>
    )
}))
vi.mock("@/app/ui/bolao/create/form", () => ({
    default: (props: any) => <div data-testid="create-form" data-props={JSON.stringify(props)} />
}))

describe("CreateBolao", () => {
    const mockLeagues = [
        { id: "1", name: "League 1" },
        { id: "2", name: "League 2" }
    ]

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("should render page with form and leagues data", async () => {
        (fetchLeagues as any).mockResolvedValue(mockLeagues);

        const result = await CreateBolao()
        render(result)

        expect(screen.getByTestId("page-title")).toBeDefined()
        expect(screen.getByText("Create bolão")).toBeDefined()
        expect(screen.getByTestId("create-form")).toBeDefined()

        // Verify PageTitle has center prop
        const pageTitle = screen.getByTestId("page-title")
        expect(pageTitle.getAttribute("data-center")).toBe("true")

        // Verify Form receives leagues data
        const form = screen.getByTestId("create-form")
        const formProps = JSON.parse(form.getAttribute("data-props") || "{}")
        expect(formProps.leagues).toEqual(mockLeagues)

        // Verify fetchLeagues was called
        expect(fetchLeagues).toHaveBeenCalledOnce()
    })
})
