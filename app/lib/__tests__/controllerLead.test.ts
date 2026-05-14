import { describe, it, expect, vi, beforeEach } from "vitest"
import { getData } from "../controllerLead"
import type {
  Bolao,
  UserBolao,
  Bet,
  PlayersData,
  FixtureData,
} from "@/app/lib/definitions"

// Mock data fetching functions
vi.mock("@/app/lib/data", () => ({
  fetchBolao: vi.fn(),
  fetchUsersBolao: vi.fn(),
  fetchFixtures: vi.fn(),
  fetchUsersBets: vi.fn(),
  fetchPlayersForBolao: vi.fn().mockResolvedValue([]),
}))

describe("controllerLead", () => {
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

  const mockUsersBolao: UserBolao[] = [
    { id: "ub-1", bolao_id: "bolao-1", user_id: "user-1" },
    { id: "ub-2", bolao_id: "bolao-1", user_id: "user-2" },
  ]

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
      round: "Group A - 1",
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
    {
      id: "bet-2",
      user_bolao_id: "ub-2",
      fixture_id: "1",
      value: 1,
      type: "away",
    },
  ]

  const mockPlayers: PlayersData[] = [
    {
      id: "user-1",
      username: null,
      email: "john@example.com",
      userBolaoId: "ub-1",
    },
    {
      id: "user-2",
      username: null,
      email: "jane@example.com",
      userBolaoId: "ub-2",
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("getData", () => {
    it("should fetch and return all required data", async () => {
      const {
        fetchBolao,
        fetchUsersBolao,
        fetchFixtures,
        fetchUsersBets,
        fetchPlayersForBolao,
      } = await import("@/app/lib/data")

      vi.mocked(fetchBolao).mockResolvedValue(mockBolao as any)
      vi.mocked(fetchUsersBolao).mockResolvedValue(mockUsersBolao as any)
      vi.mocked(fetchFixtures).mockResolvedValue([mockFixture])
      vi.mocked(fetchUsersBets).mockResolvedValue(mockBets)
      vi.mocked(fetchPlayersForBolao).mockResolvedValue(mockPlayers)

      const result = await getData({ bolaoId: "bolao-1" })

      expect(result.bolao).toEqual(mockBolao)
      expect(result.fixtures).toEqual([mockFixture])
      expect(result.players).toHaveLength(2)
      expect(result.bets).toEqual(mockBets)
    })

    it("should fetch bolao and usersBolao in parallel", async () => {
      const {
        fetchBolao,
        fetchUsersBolao,
        fetchFixtures,
        fetchUsersBets,
        fetchPlayersForBolao,
      } = await import("@/app/lib/data")

      vi.mocked(fetchBolao).mockResolvedValue(mockBolao as any)
      vi.mocked(fetchUsersBolao).mockResolvedValue([] as any)
      vi.mocked(fetchFixtures).mockResolvedValue([])
      vi.mocked(fetchUsersBets).mockResolvedValue([])
      vi.mocked(fetchPlayersForBolao).mockResolvedValue([])

      await getData({ bolaoId: "bolao-1" })

      expect(fetchBolao).toHaveBeenCalledWith("bolao-1")
      expect(fetchUsersBolao).toHaveBeenCalledWith("bolao-1")
    })

    it("should fetch players with the bolao membership payload", async () => {
      const {
        fetchBolao,
        fetchUsersBolao,
        fetchFixtures,
        fetchUsersBets,
        fetchPlayersForBolao,
      } = await import("@/app/lib/data")

      vi.mocked(fetchBolao).mockResolvedValue(mockBolao as any)
      vi.mocked(fetchUsersBolao).mockResolvedValue(mockUsersBolao as any)
      vi.mocked(fetchFixtures).mockResolvedValue([])
      vi.mocked(fetchUsersBets).mockResolvedValue([])
      vi.mocked(fetchPlayersForBolao).mockResolvedValue(mockPlayers)

      await getData({ bolaoId: "bolao-1" })

      expect(fetchPlayersForBolao).toHaveBeenCalledWith({
        bolaoId: "bolao-1",
        usersBolao: mockUsersBolao,
      })
    })

    it("should map players correctly with userBolaoId", async () => {
      const {
        fetchBolao,
        fetchUsersBolao,
        fetchFixtures,
        fetchUsersBets,
        fetchPlayersForBolao,
      } = await import("@/app/lib/data")

      vi.mocked(fetchBolao).mockResolvedValue(mockBolao as any)
      vi.mocked(fetchUsersBolao).mockResolvedValue([mockUsersBolao[0]] as any)
      vi.mocked(fetchFixtures).mockResolvedValue([])
      vi.mocked(fetchUsersBets).mockResolvedValue([])
      vi.mocked(fetchPlayersForBolao).mockResolvedValue([mockPlayers[0]])

      const result = await getData({ bolaoId: "bolao-1" })

      expect(result.players[0]).toEqual({
        id: "user-1",
        username: null,
        email: "john@example.com",
        userBolaoId: "ub-1",
      })
    })

    it("should fetch fixtures with correct parameters", async () => {
      const {
        fetchBolao,
        fetchUsersBolao,
        fetchFixtures,
        fetchUsersBets,
        fetchPlayersForBolao,
      } = await import("@/app/lib/data")

      vi.mocked(fetchBolao).mockResolvedValue(mockBolao as any)
      vi.mocked(fetchUsersBolao).mockResolvedValue([] as any)
      vi.mocked(fetchFixtures).mockResolvedValue([])
      vi.mocked(fetchUsersBets).mockResolvedValue([])
      vi.mocked(fetchPlayersForBolao).mockResolvedValue([])

      await getData({ bolaoId: "bolao-1" })

      expect(fetchFixtures).toHaveBeenCalledWith({
        leagueId: "2",
        year: 2024,
      })
    })

    it("should fetch bets with all userBolao IDs", async () => {
      const {
        fetchBolao,
        fetchUsersBolao,
        fetchFixtures,
        fetchUsersBets,
        fetchPlayersForBolao,
      } = await import("@/app/lib/data")

      vi.mocked(fetchBolao).mockResolvedValue(mockBolao as any)
      vi.mocked(fetchUsersBolao).mockResolvedValue(mockUsersBolao as any)
      vi.mocked(fetchFixtures).mockResolvedValue([])
      vi.mocked(fetchUsersBets).mockResolvedValue([])
      vi.mocked(fetchPlayersForBolao).mockResolvedValue([])

      await getData({ bolaoId: "bolao-1" })

      expect(fetchUsersBets).toHaveBeenCalledWith(["ub-1", "ub-2"])
    })

    it("should handle multiple fixtures", async () => {
      const {
        fetchBolao,
        fetchUsersBolao,
        fetchFixtures,
        fetchUsersBets,
        fetchPlayersForBolao,
      } = await import("@/app/lib/data")

      const fixtures = [
        mockFixture,
        { ...mockFixture, fixture: { ...mockFixture.fixture, id: 2 } },
        { ...mockFixture, fixture: { ...mockFixture.fixture, id: 3 } },
      ]

      vi.mocked(fetchBolao).mockResolvedValue(mockBolao as any)
      vi.mocked(fetchUsersBolao).mockResolvedValue([] as any)
      vi.mocked(fetchFixtures).mockResolvedValue(fixtures)
      vi.mocked(fetchUsersBets).mockResolvedValue([])
      vi.mocked(fetchPlayersForBolao).mockResolvedValue([])

      const result = await getData({ bolaoId: "bolao-1" })

      expect(result.fixtures).toHaveLength(3)
    })

    it("should propagate errors from fetchBolao", async () => {
      const { fetchBolao } = await import("@/app/lib/data")
      const error = new Error("Failed to fetch bolao")

      vi.mocked(fetchBolao).mockRejectedValue(error)

      await expect(getData({ bolaoId: "bolao-1" })).rejects.toThrow(
        "Failed to fetch bolao"
      )
    })

    it("should propagate errors from player fetching", async () => {
      const { fetchBolao, fetchUsersBolao, fetchPlayersForBolao } =
        await import("@/app/lib/data")
      const error = new Error("Player fetch error")

      vi.mocked(fetchBolao).mockResolvedValue(mockBolao as any)
      vi.mocked(fetchUsersBolao).mockResolvedValue(mockUsersBolao as any)
      vi.mocked(fetchPlayersForBolao).mockRejectedValue(error)

      await expect(getData({ bolaoId: "bolao-1" })).rejects.toThrow(
        "Player fetch error"
      )
    })
  })
})
