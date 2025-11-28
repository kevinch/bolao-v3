import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import ResultsPage from "@/app/bolao/[id]/results/page"
import { getData } from "@/app/lib/controllerResults"
import { auth } from "@clerk/nextjs/server"

// Mock dependencies
vi.mock("@/app/lib/controllerResults")
vi.mock("@clerk/nextjs/server")
vi.mock("@/app/ui/bolao/bolaoPageTitle", () => ({
    default: (props: any) => <div data-testid="bolao-page-title" data-props={JSON.stringify(props)} />
}))
vi.mock("@/app/ui/bolao/bolaoLinks", () => ({
    default: (props: any) => <div data-testid="bolao-links" data-props={JSON.stringify(props)} />
}))
vi.mock("@/app/ui/bolao/bet/pagination", () => ({
    default: (props: any) => <div data-testid="pagination" data-props={JSON.stringify(props)} />
}))
vi.mock("@/app/ui/bolao/results/tableMatchDayResults", () => ({
    default: (props: any) => <div data-testid="table-match-day-results" data-props={JSON.stringify(props)} />
}))

describe("ResultsPage", () => {
    const mockParams = Promise.resolve({ id: "bolao-123" })
    const mockSearchParams = Promise.resolve({ roundIndex: "1" })

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("should render error if userId is missing", async () => {
        (auth as any).mockResolvedValue({ userId: null })

        const result = await ResultsPage({ params: mockParams, searchParams: mockSearchParams })
        render(result)

        expect(screen.getByText("Error while loading the results page. Missing userid.")).toBeDefined()
    })

    it("should render error if data is missing", async () => {
        (auth as any).mockResolvedValue({ userId: "user-123" });
        (getData as any).mockResolvedValue(null);

        const result = await ResultsPage({ params: mockParams, searchParams: mockSearchParams })
        render(result)

        expect(screen.getByText("Error while loading the results page. No data.")).toBeDefined()
    })

    it("should render page content when data is present", async () => {
        (auth as any).mockResolvedValue({ userId: "user-123" });

        const mockData = {
            bolao: { id: "bolao-123", year: 2023, competition_id: "comp-1" },
            currentRound: "Round 1",
            allRounds: ["Round 1", "Round 2"],
            fixtures: [{ league: { logo: "logo.png", name: "League Name" } }],
            isLastRound: false,
            isFirstRound: true,
            bets: [],
            players: []
        };
        (getData as any).mockResolvedValue(mockData);

        const result = await ResultsPage({ params: mockParams, searchParams: mockSearchParams })
        render(result)

        expect(screen.getByTestId("bolao-page-title")).toBeDefined()
        expect(screen.getByTestId("bolao-links")).toBeDefined()
        expect(screen.getByTestId("pagination")).toBeDefined()
        expect(screen.getByTestId("table-match-day-results")).toBeDefined()

        // Verify props passed to components
        const title = screen.getByTestId("bolao-page-title")
        const titleProps = JSON.parse(title.getAttribute("data-props") || "{}")
        expect(titleProps.bolao).toEqual(mockData.bolao)
        expect(titleProps.leagueLogo).toBe("logo.png")
        expect(titleProps.leagueName).toBe("League Name")

        const table = screen.getByTestId("table-match-day-results")
        const tableProps = JSON.parse(table.getAttribute("data-props") || "{}")
        expect(tableProps.userId).toBe("user-123")
    })
})
