import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import LeadPage from "@/app/bolao/[id]/lead/page"
import { getData } from "@/app/lib/controllerLead"
import { calcLead } from "@/app/lib/calcLeadFactory"

// Mock dependencies
vi.mock("@/app/lib/controllerLead")
vi.mock("@/app/lib/calcLeadFactory")
vi.mock("@/app/ui/bolao/bolaoPageTitle", () => ({
    default: (props: any) => <div data-testid="bolao-page-title" data-props={JSON.stringify(props)} />
}))
vi.mock("@/app/ui/bolao/bolaoLinks", () => ({
    default: (props: any) => <div data-testid="bolao-links" data-props={JSON.stringify(props)} />
}))
vi.mock("@/app/ui/bolao/lead/tableLead", () => ({
    default: (props: any) => <div data-testid="table-lead" data-props={JSON.stringify(props)} />
}))

describe("LeadPage", () => {
    const mockParams = Promise.resolve({ id: "bolao-123" })
    const mockData = {
        bolao: { id: "bolao-123", name: "Test Bolao" },
        players: [],
        fixtures: [{ league: { logo: "logo.png", name: "League Name" } }],
        bets: []
    }
    const mockLeadData = [
        { id: "p1", name: "Player 1", total: 10 },
        { id: "p2", name: "Player 2", total: 20 }
    ]

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("should render page content with sorted lead data", async () => {
        (getData as any).mockResolvedValue(mockData);
        (calcLead as any).mockReturnValue(mockLeadData);

        const result = await LeadPage({ params: mockParams })
        render(result)

        expect(screen.getByTestId("bolao-page-title")).toBeDefined()
        expect(screen.getByTestId("bolao-links")).toBeDefined()
        expect(screen.getByTestId("table-lead")).toBeDefined()

        // Verify data fetching
        expect(getData).toHaveBeenCalledWith({ bolaoId: "bolao-123" })
        expect(calcLead).toHaveBeenCalledWith({
            players: mockData.players,
            fixtures: mockData.fixtures,
            bets: mockData.bets
        })

        // Verify sorting
        const tableLead = screen.getByTestId("table-lead")
        const tableProps = JSON.parse(tableLead.getAttribute("data-props") || "{}")
        expect(tableProps.data).toHaveLength(2)
        expect(tableProps.data[0].total).toBe(20) // Player 2 (20) should be first
        expect(tableProps.data[1].total).toBe(10) // Player 1 (10) should be second
    })
})
