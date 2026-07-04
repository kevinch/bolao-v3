import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import StatsPage from "@/app/bolao/[id]/stats/page"
import { getData } from "@/app/lib/controllerStats"
import { auth } from "@clerk/nextjs/server"

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}))

vi.mock("@/app/lib/controllerStats", () => ({
  getData: vi.fn(),
}))

vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn(async () => (key: string) => key),
}))

vi.mock("@/app/ui/bolao/bolaoPageTitle", () => ({
  default: () => <div data-testid="bolao-page-title" />,
}))

vi.mock("@/app/ui/bolao/bolaoLinks", () => ({
  default: (props: { bolaoId: string; active?: number }) => (
    <div
      data-testid="bolao-links"
      data-bolao-id={props.bolaoId}
      data-active={props.active}
    />
  ),
}))

vi.mock("@/app/ui/bolao/stats/statsContent", () => ({
  default: (props: { stats: { hasFinishedRound: boolean } }) => (
    <div
      data-testid="stats-content"
      data-has-finished-round={String(props.stats.hasFinishedRound)}
    />
  ),
}))

describe("StatsPage", () => {
  const mockParams = Promise.resolve({ id: "bolao-123" })

  const mockData = {
    bolao: { id: "bolao-123", name: "Copa 2026" },
    fixtures: [
      {
        league: { logo: "logo.png", name: "World Cup" },
      },
    ],
    stats: {
      hasFinishedRound: true,
      positionSnapshots: [],
      tierBreakdown: [],
      zeroPointsBreakdown: null,
      tierComparison: null,
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(auth).mockResolvedValue({ userId: "user-1" } as never)
    vi.mocked(getData).mockResolvedValue(mockData as never)
  })

  it("renders stats content for authenticated users", async () => {
    const page = await StatsPage({ params: mockParams })
    render(page)

    expect(screen.getByTestId("bolao-page-title")).toBeInTheDocument()
    expect(screen.getByTestId("bolao-links")).toHaveAttribute(
      "data-bolao-id",
      "bolao-123"
    )
    expect(screen.getByTestId("bolao-links")).toHaveAttribute("data-active", "5")
    expect(screen.getByTestId("stats-content")).toHaveAttribute(
      "data-has-finished-round",
      "true"
    )
    expect(getData).toHaveBeenCalledWith({
      bolaoId: "bolao-123",
      userId: "user-1",
      seasonEndLabel: "seasonEnd",
    })
  })

  it("shows missing user error when unauthenticated", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null } as never)

    const page = await StatsPage({ params: mockParams })
    render(page)

    expect(screen.getByText("errorMissingUser")).toBeInTheDocument()
    expect(getData).not.toHaveBeenCalled()
  })

  it("shows load error when controller throws", async () => {
    vi.mocked(getData).mockRejectedValue(new Error("boom"))
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})

    const page = await StatsPage({ params: mockParams })
    render(page)

    expect(screen.getByText("errorLoadFailed")).toBeInTheDocument()

    consoleSpy.mockRestore()
  })

  it("shows no data error when fixtures are empty", async () => {
    vi.mocked(getData).mockResolvedValue({
      ...mockData,
      fixtures: [],
    } as never)

    const page = await StatsPage({ params: mockParams })
    render(page)

    expect(screen.getByText("errorNoData")).toBeInTheDocument()
  })
})
