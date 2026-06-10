import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import BetPage from "@/app/bolao/[id]/bet/page"
import { getData } from "@/app/lib/controllerBet"
import { auth } from "@clerk/nextjs/server"

vi.mock("@/app/lib/controllerBet")
vi.mock("@clerk/nextjs/server")
vi.mock("@/app/ui/bolao/bolaoPageTitle", () => ({
  default: (props: any) => (
    <div data-testid="bolao-page-title" data-props={JSON.stringify(props)} />
  ),
}))
vi.mock("@/app/ui/bolao/bolaoLinks", () => ({
  default: (props: any) => (
    <div data-testid="bolao-links" data-props={JSON.stringify(props)} />
  ),
}))
vi.mock("@/app/ui/bolao/bet/pagination", () => ({
  default: (props: any) => (
    <div data-testid="pagination" data-props={JSON.stringify(props)} />
  ),
}))
vi.mock("@/app/ui/bolao/bet/playerSelector", () => ({
  default: (props: any) => (
    <div data-testid="player-selector" data-props={JSON.stringify(props)} />
  ),
}))
vi.mock("@/app/ui/bolao/bet/championPickSelector", () => ({
  default: (props: any) => (
    <div
      data-testid="champion-pick-selector"
      data-props={JSON.stringify(props)}
    />
  ),
}))
vi.mock("@/app/ui/bolao/bet/tableMatchDayBets", () => ({
  default: (props: any) => (
    <div
      data-testid="table-match-day-bets"
      data-props={JSON.stringify(props)}
    />
  ),
}))

describe("BetPage", () => {
  const mockParams = Promise.resolve({ id: "bolao-123" })
  const mockSearchParams = Promise.resolve({ roundIndex: "1" })

  beforeEach(() => {
    vi.clearAllMocks()
    ;(auth as any).mockResolvedValue({ userId: "user-123" })
  })

  it("should render error if userId is missing", async () => {
    ;(auth as any).mockResolvedValue({ userId: null })

    const result = await BetPage({
      params: mockParams,
      searchParams: mockSearchParams,
    })
    render(result)

    expect(
      screen.getByText("Error while loading the bet page. Missing userid.")
    ).toBeDefined()
  })

  it("should render error if data loading throws", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {})
    ;(getData as any).mockRejectedValue(new Error("db timeout"))

    const result = await BetPage({
      params: mockParams,
      searchParams: mockSearchParams,
    })
    render(result)

    expect(
      screen.getByText(
        "Could not load the bet page. Check your connection and try again."
      )
    ).toBeDefined()
    consoleError.mockRestore()
  })

  it("should render error if data is missing fixtures", async () => {
    ;(getData as any).mockResolvedValue({
      fixtures: [],
      allRounds: [],
      currentRound: "Round 1",
    })

    const result = await BetPage({
      params: mockParams,
      searchParams: mockSearchParams,
    })
    render(result)

    expect(
      screen.getByText("Error while loading the bet page. No data.")
    ).toBeDefined()
  })

  it("should render page content when data is present", async () => {
    const mockData = {
      bolao: { id: "bolao-123", year: 2023, competition_id: "comp-1" },
      userBolao: { id: "user-bolao-123" },
      currentUserBolao: { id: "user-bolao-123" },
      isAdmin: false,
      currentRound: "Round 1",
      allRounds: ["Round 1", "Round 2"],
      fixtures: [{ league: { logo: "logo.png", name: "League Name" } }],
      isLastRound: false,
      isFirstRound: true,
      bets: [],
      players: [],
      championPickTeams: [],
      userChampionPick: null,
      isChampionPickLocked: false,
      championPickLockDate: null,
    }
    ;(getData as any).mockResolvedValue(mockData)

    const result = await BetPage({
      params: mockParams,
      searchParams: mockSearchParams,
    })
    render(result)

    expect(screen.getByTestId("bolao-page-title")).toBeDefined()
    expect(screen.getByTestId("bolao-links")).toBeDefined()
    expect(screen.getByTestId("pagination")).toBeDefined()
    expect(screen.getByTestId("table-match-day-bets")).toBeDefined()
  })

  it("should render player selector for admins", async () => {
    const mockData = {
      bolao: { id: "bolao-123", year: 2023, competition_id: "comp-1" },
      userBolao: { id: "selected-user-bolao" },
      currentUserBolao: { id: "user-bolao-123" },
      isAdmin: true,
      currentRound: "Round 1",
      allRounds: ["Round 1", "Round 2"],
      fixtures: [{ league: { logo: "logo.png", name: "League Name" } }],
      isLastRound: false,
      isFirstRound: true,
      bets: [],
      players: [
        {
          id: "user-123",
          username: "Kevin",
          email: "kevin@example.com",
          userBolaoId: "user-bolao-123",
        },
      ],
      championPickTeams: [],
      userChampionPick: null,
      isChampionPickLocked: false,
      championPickLockDate: null,
    }
    ;(getData as any).mockResolvedValue(mockData)

    const result = await BetPage({
      params: mockParams,
      searchParams: Promise.resolve({
        roundIndex: "1",
        userBolaoId: "selected-user-bolao",
      }),
    })
    render(result)

    expect(getData).toHaveBeenCalledWith({
      bolaoId: "bolao-123",
      roundParam: "1",
      userId: "user-123",
      selectedUserBolaoId: "selected-user-bolao",
    })
    expect(screen.getByTestId("player-selector")).toBeDefined()
  })
})
