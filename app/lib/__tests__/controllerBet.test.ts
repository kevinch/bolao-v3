import { describe, it, expect, vi, beforeEach } from "vitest"
import { getData } from "../controllerBet"
import type { Bolao, UserBolao, Bet, FixtureData } from "@/app/lib/definitions"

vi.mock("@/app/lib/data", () => ({
  fetchBetPageContext: vi.fn(),
  fetchUsersBolao: vi.fn(),
  fetchRounds: vi.fn(),
  fetchFixtures: vi.fn(),
  fetchUserBets: vi.fn(),
}))

vi.mock("@clerk/nextjs/server", () => ({
  clerkClient: vi.fn(),
}))

vi.mock("@/app/lib/authRole", () => ({
  getUserRole: vi.fn(),
}))

vi.mock("@/app/lib/utils", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/app/lib/utils")>()
  return {
    ...actual,
    sortFixtures: vi.fn((fixtures) => fixtures),
    cleanRounds: vi.fn((rounds) => rounds),
  }
})

describe("controllerBet", () => {
  const mockBolao: Bolao = {
    id: "bolao-1",
    name: "Test Bolao",
    competition_id: "2",
    created_by: "user-1",
    created_at: new Date("2024-01-01"),
    year: 2024,
    start: "2024-01-01",
    end: "2024-12-31",
  }

  const mockUserBolao: UserBolao = {
    id: "ub-1",
    bolao_id: "bolao-1",
    user_id: "user-1",
  }

  const mockOtherUserBolao: UserBolao = {
    id: "ub-2",
    bolao_id: "bolao-1",
    user_id: "user-2",
  }

  const mockFixture: FixtureData = {
    fixture: {
      id: 1,
      referee: null,
      timezone: "UTC",
      date: new Date("2024-01-15"),
      timestamp: 1705334400,
      periods: { first: 0, second: 0 },
      venue: { id: 1, name: "Stadium", city: "City" },
      status: { long: "Match Finished", short: "FT", elapsed: 90 },
    },
    league: {
      id: 2,
      name: "Champions League",
      country: "World",
      logo: "logo.png",
      flag: "flag.png",
      season: 2024,
      round: "Round 2",
    },
    teams: {
      home: { id: 1, name: "Team A", logo: "teamA.png", winner: null },
      away: { id: 2, name: "Team B", logo: "teamB.png", winner: null },
    },
    goals: { home: 2, away: 1 },
    score: {
      halftime: { home: 1, away: 0 },
      fulltime: { home: 2, away: 1 },
      extratime: { home: null, away: null },
      penalty: { home: null, away: null },
    },
  }

  const mockBets: Bet[] = [
    {
      id: "bet-1",
      user_bolao_id: "ub-1",
      fixture_id: "1",
      value: 2,
      type: "home",
    },
  ]

  const mockRounds = ["Round 1", "Round 2", "Round 3", "Round 4"]

  const fixtureForRound = (round: string, id = 1): FixtureData => ({
    ...mockFixture,
    fixture: { ...mockFixture.fixture, id },
    league: { ...mockFixture.league, round },
  })

  async function setupDefaultMocks(options?: {
    userRole?: string
    bolao?: Bolao
    fixtures?: FixtureData[]
    currentRound?: string[]
  }) {
    const {
      fetchBetPageContext,
      fetchRounds,
      fetchFixtures,
      fetchUserBets,
    } = await import("@/app/lib/data")
    const { getUserRole } = await import("@/app/lib/authRole")

    vi.mocked(getUserRole).mockResolvedValue(options?.userRole ?? "user")
    vi.mocked(fetchBetPageContext).mockResolvedValue({
      bolao: options?.bolao ?? mockBolao,
      userBolao: mockUserBolao,
      championPick: null,
    })
    vi.mocked(fetchRounds)
      .mockResolvedValueOnce(mockRounds)
      .mockResolvedValueOnce(options?.currentRound ?? ["Round 2"])
    vi.mocked(fetchFixtures).mockResolvedValue(
      options?.fixtures ?? mockRounds.map((round, index) => fixtureForRound(round, index + 1))
    )
    vi.mocked(fetchUserBets).mockResolvedValue(mockBets)
  }

  beforeEach(async () => {
    vi.clearAllMocks()
    await setupDefaultMocks()
  })

  describe("getData", () => {
    it("returns bet page data without roundParam", async () => {
      const result = await getData({ bolaoId: "bolao-1", userId: "user-1" })

      expect(result.bolao).toEqual(mockBolao)
      expect(result.userBolao).toEqual(mockUserBolao)
      expect(result.currentRound).toBe("Round 2")
      expect(result.fixtures).toEqual([fixtureForRound("Round 2", 2)])
      expect(result.bets).toEqual(mockBets)
      expect(result.isAdmin).toBe(false)
    })

    it("loads bet page context in one query", async () => {
      const { fetchBetPageContext } = await import("@/app/lib/data")

      await getData({ bolaoId: "bolao-1", userId: "user-1" })

      expect(fetchBetPageContext).toHaveBeenCalledWith({
        bolaoId: "bolao-1",
        userId: "user-1",
      })
    })

    it("loads admin player data when user role is admin in Clerk", async () => {
      const { fetchUsersBolao } = await import("@/app/lib/data")
      const { getUserRole } = await import("@/app/lib/authRole")
      const { clerkClient } = await import("@clerk/nextjs/server")

      await setupDefaultMocks({ userRole: "admin" })
      vi.mocked(fetchUsersBolao).mockResolvedValue([
        mockUserBolao,
        mockOtherUserBolao,
      ] as any)
      vi.mocked(clerkClient).mockResolvedValue({
        users: {
          getUserList: vi.fn().mockResolvedValue({
            data: [
              {
                id: "user-1",
                username: "kevin",
                emailAddresses: [{ emailAddress: "kevin@example.com" }],
              },
            ],
          }),
        },
      } as any)

      const result = await getData({
        bolaoId: "bolao-1",
        userId: "user-1",
        selectedUserBolaoId: "ub-2",
      })

      expect(result.isAdmin).toBe(true)
      expect(getUserRole).toHaveBeenCalledWith("user-1")
      expect(fetchUsersBolao).toHaveBeenCalledWith("bolao-1")
      expect(result.userBolao).toEqual(mockOtherUserBolao)
    })

    it("handles roundParam pagination", async () => {
      const result = await getData({
        bolaoId: "bolao-1",
        userId: "user-1",
        roundParam: "3",
      })

      expect(result.currentRound).toBe("Round 3")
      expect(result.fixtures).toEqual([fixtureForRound("Round 3", 3)])
      expect(result.isFirstRound).toBe(false)
      expect(result.isLastRound).toBe(false)
    })

    it("fetches season fixtures once", async () => {
      const { fetchFixtures } = await import("@/app/lib/data")

      await getData({ bolaoId: "bolao-1", userId: "user-1" })

      expect(fetchFixtures).toHaveBeenCalledTimes(1)
      expect(fetchFixtures).toHaveBeenCalledWith({
        leagueId: "2",
        year: 2024,
      })
    })

    it("includes champion pick metadata", async () => {
      const { fetchBetPageContext } = await import("@/app/lib/data")

      vi.mocked(fetchBetPageContext).mockResolvedValue({
        bolao: mockBolao,
        userBolao: mockUserBolao,
        championPick: {
          id: "cp-1",
          user_bolao_id: "ub-1",
          team_id: 10,
          team_name: "Brazil",
          team_logo: "b.png",
          created_at: "",
          updated_at: "",
        },
      })

      const result = await getData({ bolaoId: "bolao-1", userId: "user-1" })

      expect(result.userChampionPick?.team_name).toBe("Brazil")
      expect(result.championPickTeams.length).toBeGreaterThan(0)
    })

    it("propagates bet page context errors", async () => {
      const { fetchBetPageContext } = await import("@/app/lib/data")

      vi.mocked(fetchBetPageContext).mockRejectedValue(
        new Error("Failed to fetch bet page context.")
      )

      await expect(
        getData({ bolaoId: "bolao-1", userId: "user-1" })
      ).rejects.toThrow("Failed to fetch bet page context.")
    })

    it("throws when user is not a member", async () => {
      const { fetchBetPageContext } = await import("@/app/lib/data")

      vi.mocked(fetchBetPageContext).mockResolvedValue(null)

      await expect(
        getData({ bolaoId: "bolao-1", userId: "user-1" })
      ).rejects.toThrow("User is not a member of this bolao.")
    })
  })
})
