import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import StandingsPage from "@/app/bolao/[id]/standings/page"
import { getData } from "@/app/lib/controllerStandings"

// Mock dependencies
vi.mock("@/app/lib/controllerStandings")
vi.mock("@/app/ui/bolao/bolaoPageTitle", () => ({
    default: (props: any) => <div data-testid="bolao-page-title" data-props={JSON.stringify(props)} />
}))
vi.mock("@/app/ui/bolao/bolaoLinks", () => ({
    default: (props: any) => <div data-testid="bolao-links" data-props={JSON.stringify(props)} />
}))
vi.mock("@/app/ui/bolao/standings/tableStandings", () => ({
    default: (props: any) => <div data-testid="table-standings" data-props={JSON.stringify(props)} />
}))

describe("StandingsPage", () => {
    const mockParams = Promise.resolve({ id: "bolao-123" })

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("should render error if data is missing", async () => {
        (getData as any).mockResolvedValue(null);

        const result = await StandingsPage({ params: mockParams })
        render(result)

        expect(screen.getByText("Error while loading the standings.")).toBeDefined()
    })

    it("should render page content when data is present", async () => {
        const mockData = {
            bolao: { id: "bolao-123", name: "Test Bolao" },
            standingsLeague: {
                logo: "league-logo.png",
                name: "League Name",
                standings: []
            }
        };
        (getData as any).mockResolvedValue(mockData);

        const result = await StandingsPage({ params: mockParams })
        render(result)

        expect(screen.getByTestId("bolao-page-title")).toBeDefined()
        expect(screen.getByTestId("bolao-links")).toBeDefined()
        expect(screen.getByTestId("table-standings")).toBeDefined()

        // Verify props passed to components
        const title = screen.getByTestId("bolao-page-title")
        const titleProps = JSON.parse(title.getAttribute("data-props") || "{}")
        expect(titleProps.bolao).toEqual(mockData.bolao)
        expect(titleProps.leagueLogo).toBe("league-logo.png")
        expect(titleProps.leagueName).toBe("League Name")

        const links = screen.getByTestId("bolao-links")
        const linksProps = JSON.parse(links.getAttribute("data-props") || "{}")
        expect(linksProps.bolaoId).toBe("bolao-123")
        expect(linksProps.active).toBe(2)

        const table = screen.getByTestId("table-standings")
        const tableProps = JSON.parse(table.getAttribute("data-props") || "{}")
        expect(tableProps.standingsLeague).toEqual(mockData.standingsLeague)
    })
})
