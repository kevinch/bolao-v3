import { describe, it, expect, vi, beforeEach } from "vitest"
import { getData } from "../controllerBet"
import type { Bolao, UserBolao, Bet, FixtureData } from "@/app/lib/definitions"

// Mock data fetching functions
vi.mock("@/app/lib/data", () => ({
  fetchBolao: vi.fn(),
  fetchUserBolao: vi.fn(),
  fetchRounds: vi.fn(),
  fetchFixtures: vi.fn(),
  fetchUserBets: vi.fn(),
}))

// Mock utility functions
vi.mock("@/app/lib/utils", () => ({
  sortFixtures: vi.fn((fixtures) => fixtures),
  cleanRounds: vi.fn((rounds) => rounds),
}))

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
      user_bolao_id: "ub-1",
      fixture_id: "2",
      value: 1,
      type: "away",
    },
  ]

  const mockRounds = ["Round 1", "Round 2", "Round 3", "Round 4"]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("getData", () => {
    it("should fetch and return all required data without roundParam", async () => {
      const { fetchBolao, fetchUserBolao, fetchRounds, fetchFixtures, fetchUserBets } =
        await import("@/app/lib/data")

      vi.mocked(fetchBolao).mockResolvedValue(mockBolao as any)
      vi.mocked(fetchUserBolao).mockResolvedValue(mockUserBolao as any)
      vi.mocked(fetchRounds)
        .mockResolvedValueOnce(mockRounds)
        .mockResolvedValueOnce(["Round 2"])
      vi.mocked(fetchFixtures).mockResolvedValue([mockFixture])
      vi.mocked(fetchUserBets).mockResolvedValue(mockBets)

      const result = await getData({ bolaoId: "bolao-1", userId: "user-1" })

      expect(result.bolao).toEqual(mockBolao)
      expect(result.userBolao).toEqual(mockUserBolao)
      expect(result.allRounds).toEqual(mockRounds)
      expect(result.currentRound).toBe("Round 2")
      expect(result.fixtures).toEqual([mockFixture])
      expect(result.bets).toEqual(mockBets)
    })

    it("should fetch bolao and userBolao in parallel", async () => {
      const { fetchBolao, fetchUserBolao, fetchRounds, fetchFixtures, fetchUserBets } =
        await import("@/app/lib/data")

      vi.mocked(fetchBolao).mockResolvedValue(mockBolao as any)
      vi.mocked(fetchUserBolao).mockResolvedValue(mockUserBolao as any)
      vi.mocked(fetchRounds).mockResolvedValue(mockRounds)
      vi.mocked(fetchFixtures).mockResolvedValue([])
      vi.mocked(fetchUserBets).mockResolvedValue([])

      await getData({ bolaoId: "bolao-1", userId: "user-1" })

      expect(fetchBolao).toHaveBeenCalledWith("bolao-1")
      expect(fetchUserBolao).toHaveBeenCalledWith({
        bolaoId: "bolao-1",
        userId: "user-1",
      })
    })

    it("should fetch user bets with userBolaoId", async () => {
      const { fetchBolao, fetchUserBolao, fetchRounds, fetchFixtures, fetchUserBets } =
        await import("@/app/lib/data")

      vi.mocked(fetchBolao).mockResolvedValue(mockBolao as any)
      vi.mocked(fetchUserBolao).mockResolvedValue(mockUserBolao as any)
      vi.mocked(fetchRounds).mockResolvedValue(mockRounds)
      vi.mocked(fetchFixtures).mockResolvedValue([])
      vi.mocked(fetchUserBets).mockResolvedValue(mockBets)

      await getData({ bolaoId: "bolao-1", userId: "user-1" })

      expect(fetchUserBets).toHaveBeenCalledWith("ub-1")
    })

    it("should fetch rounds with correct parameters", async () => {
      const { fetchBolao, fetchUserBolao, fetchRounds, fetchFixtures, fetchUserBets } =
        await import("@/app/lib/data")

      vi.mocked(fetchBolao).mockResolvedValue(mockBolao as any)
      vi.mocked(fetchUserBolao).mockResolvedValue(mockUserBolao as any)
      vi.mocked(fetchRounds).mockResolvedValue(mockRounds)
      vi.mocked(fetchFixtures).mockResolvedValue([])
      vi.mocked(fetchUserBets).mockResolvedValue([])

      await getData({ bolaoId: "bolao-1", userId: "user-1" })

      expect(fetchRounds).toHaveBeenCalledWith({
        leagueId: "2",
        year: 2024,
      })
      expect(fetchRounds).toHaveBeenCalledWith({
        leagueId: "2",
        year: 2024,
        current: true,
      })
    })

    it("should use cleanRounds utility on fetched rounds", async () => {
      const { fetchBolao, fetchUserBolao, fetchRounds, fetchFixtures, fetchUserBets } =
        await import("@/app/lib/data")
      const { cleanRounds } = await import("@/app/lib/utils")

      vi.mocked(fetchBolao).mockResolvedValue(mockBolao as any)
      vi.mocked(fetchUserBolao).mockResolvedValue(mockUserBolao as any)
      vi.mocked(fetchRounds).mockResolvedValue(mockRounds)
      vi.mocked(fetchFixtures).mockResolvedValue([])
      vi.mocked(fetchUserBets).mockResolvedValue([])

      await getData({ bolaoId: "bolao-1", userId: "user-1" })

      expect(cleanRounds).toHaveBeenCalledWith(mockRounds)
    })

    it("should use sortFixtures utility on fetched fixtures", async () => {
      const { fetchBolao, fetchUserBolao, fetchRounds, fetchFixtures, fetchUserBets } =
        await import("@/app/lib/data")
      const { sortFixtures } = await import("@/app/lib/utils")

      vi.mocked(fetchBolao).mockResolvedValue(mockBolao as any)
      vi.mocked(fetchUserBolao).mockResolvedValue(mockUserBolao as any)
      vi.mocked(fetchRounds).mockResolvedValue(mockRounds)
      vi.mocked(fetchFixtures).mockResolvedValue([mockFixture])
      vi.mocked(fetchUserBets).mockResolvedValue([])

      await getData({ bolaoId: "bolao-1", userId: "user-1" })

      expect(sortFixtures).toHaveBeenCalledWith([mockFixture])
    })

    it("should use last element of currentRoundObj for current round", async () => {
      const { fetchBolao, fetchUserBolao, fetchRounds, fetchFixtures, fetchUserBets } =
        await import("@/app/lib/data")

      vi.mocked(fetchBolao).mockResolvedValue(mockBolao as any)
      vi.mocked(fetchUserBolao).mockResolvedValue(mockUserBolao as any)
      vi.mocked(fetchRounds)
        .mockResolvedValueOnce(mockRounds)
        .mockResolvedValueOnce(["Round 2", "Round 3"]) // Multiple current rounds
      vi.mocked(fetchFixtures).mockResolvedValue([])
      vi.mocked(fetchUserBets).mockResolvedValue([])

      const result = await getData({ bolaoId: "bolao-1", userId: "user-1" })

      expect(result.currentRound).toBe("Round 3") // Last element
    })

    it("should fallback to last round when currentRoundObj is empty", async () => {
      const { fetchBolao, fetchUserBolao, fetchRounds, fetchFixtures, fetchUserBets } =
        await import("@/app/lib/data")

      vi.mocked(fetchBolao).mockResolvedValue(mockBolao as any)
      vi.mocked(fetchUserBolao).mockResolvedValue(mockUserBolao as any)
      vi.mocked(fetchRounds)
        .mockResolvedValueOnce(mockRounds)
        .mockResolvedValueOnce([]) // Empty current round
      vi.mocked(fetchFixtures).mockResolvedValue([])
      vi.mocked(fetchUserBets).mockResolvedValue([])

      const result = await getData({ bolaoId: "bolao-1", userId: "user-1" })

      expect(result.currentRound).toBe("Round 4") // Last round
    })

    it("should handle roundParam and use it for pagination", async () => {
      const { fetchBolao, fetchUserBolao, fetchRounds, fetchFixtures, fetchUserBets } =
        await import("@/app/lib/data")

      vi.mocked(fetchBolao).mockResolvedValue(mockBolao as any)
      vi.mocked(fetchUserBolao).mockResolvedValue(mockUserBolao as any)
      vi.mocked(fetchRounds).mockResolvedValue(mockRounds)
      vi.mocked(fetchFixtures).mockResolvedValue([])
      vi.mocked(fetchUserBets).mockResolvedValue([])

      const result = await getData({
        bolaoId: "bolao-1",
        userId: "user-1",
        roundParam: "2",
      })

      expect(result.currentRound).toBe("Round 2")
      expect(fetchFixtures).toHaveBeenCalledWith({
        leagueId: "2",
        year: 2024,
        round: "Round 2",
      })
    })

    it("should set isFirstRound correctly when roundParam is 1", async () => {
      const { fetchBolao, fetchUserBolao, fetchRounds, fetchFixtures, fetchUserBets } =
        await import("@/app/lib/data")

      vi.mocked(fetchBolao).mockResolvedValue(mockBolao as any)
      vi.mocked(fetchUserBolao).mockResolvedValue(mockUserBolao as any)
      vi.mocked(fetchRounds).mockResolvedValue(mockRounds)
      vi.mocked(fetchFixtures).mockResolvedValue([])
      vi.mocked(fetchUserBets).mockResolvedValue([])

      const result = await getData({
        bolaoId: "bolao-1",
        userId: "user-1",
        roundParam: "1",
      })

      expect(result.isFirstRound).toBe(true)
      expect(result.isLastRound).toBe(false)
      expect(result.currentRound).toBe("Round 1")
    })

    it("should set isLastRound correctly when roundParam is last round", async () => {
      const { fetchBolao, fetchUserBolao, fetchRounds, fetchFixtures, fetchUserBets } =
        await import("@/app/lib/data")

      vi.mocked(fetchBolao).mockResolvedValue(mockBolao as any)
      vi.mocked(fetchUserBolao).mockResolvedValue(mockUserBolao as any)
      vi.mocked(fetchRounds).mockResolvedValue(mockRounds)
      vi.mocked(fetchFixtures).mockResolvedValue([])
      vi.mocked(fetchUserBets).mockResolvedValue([])

      const result = await getData({
        bolaoId: "bolao-1",
        userId: "user-1",
        roundParam: "4",
      })

      expect(result.isFirstRound).toBe(false)
      expect(result.isLastRound).toBe(true)
      expect(result.currentRound).toBe("Round 4")
    })

    it("should handle middle round correctly", async () => {
      const { fetchBolao, fetchUserBolao, fetchRounds, fetchFixtures, fetchUserBets } =
        await import("@/app/lib/data")

      vi.mocked(fetchBolao).mockResolvedValue(mockBolao as any)
      vi.mocked(fetchUserBolao).mockResolvedValue(mockUserBolao as any)
      vi.mocked(fetchRounds).mockResolvedValue(mockRounds)
      vi.mocked(fetchFixtures).mockResolvedValue([])
      vi.mocked(fetchUserBets).mockResolvedValue([])

      const result = await getData({
        bolaoId: "bolao-1",
        userId: "user-1",
        roundParam: "3",
      })

      expect(result.isFirstRound).toBe(false)
      expect(result.isLastRound).toBe(false)
      expect(result.currentRound).toBe("Round 3")
    })

    it("should set isFirstRound and isLastRound when no roundParam and currentRound is first", async () => {
      const { fetchBolao, fetchUserBolao, fetchRounds, fetchFixtures, fetchUserBets } =
        await import("@/app/lib/data")

      vi.mocked(fetchBolao).mockResolvedValue(mockBolao as any)
      vi.mocked(fetchUserBolao).mockResolvedValue(mockUserBolao as any)
      vi.mocked(fetchRounds)
        .mockResolvedValueOnce(mockRounds)
        .mockResolvedValueOnce(["Round 1"]) // Current round is first
      vi.mocked(fetchFixtures).mockResolvedValue([])
      vi.mocked(fetchUserBets).mockResolvedValue([])

      const result = await getData({ bolaoId: "bolao-1", userId: "user-1" })

      expect(result.isFirstRound).toBe(true)
      expect(result.isLastRound).toBe(false)
    })

    it("should set isFirstRound and isLastRound when no roundParam and currentRound is last", async () => {
      const { fetchBolao, fetchUserBolao, fetchRounds, fetchFixtures, fetchUserBets } =
        await import("@/app/lib/data")

      vi.mocked(fetchBolao).mockResolvedValue(mockBolao as any)
      vi.mocked(fetchUserBolao).mockResolvedValue(mockUserBolao as any)
      vi.mocked(fetchRounds)
        .mockResolvedValueOnce(mockRounds)
        .mockResolvedValueOnce(["Round 4"]) // Current round is last
      vi.mocked(fetchFixtures).mockResolvedValue([])
      vi.mocked(fetchUserBets).mockResolvedValue([])

      const result = await getData({ bolaoId: "bolao-1", userId: "user-1" })

      expect(result.isFirstRound).toBe(false)
      expect(result.isLastRound).toBe(true)
    })

    it("should fetch fixtures with correct round parameter", async () => {
      const { fetchBolao, fetchUserBolao, fetchRounds, fetchFixtures, fetchUserBets } =
        await import("@/app/lib/data")

      vi.mocked(fetchBolao).mockResolvedValue(mockBolao as any)
      vi.mocked(fetchUserBolao).mockResolvedValue(mockUserBolao as any)
      vi.mocked(fetchRounds)
        .mockResolvedValueOnce(mockRounds)
        .mockResolvedValueOnce(["Round 3"])
      vi.mocked(fetchFixtures).mockResolvedValue([])
      vi.mocked(fetchUserBets).mockResolvedValue([])

      await getData({ bolaoId: "bolao-1", userId: "user-1" })

      expect(fetchFixtures).toHaveBeenCalledWith({
        leagueId: "2",
        year: 2024,
        round: "Round 3",
      })
    })

    it("should propagate errors from fetchBolao", async () => {
      const { fetchBolao } = await import("@/app/lib/data")
      const error = new Error("Failed to fetch bolao")

      vi.mocked(fetchBolao).mockRejectedValue(error)

      await expect(
        getData({ bolaoId: "bolao-1", userId: "user-1" })
      ).rejects.toThrow("Failed to fetch bolao")
    })

    it("should propagate errors from fetchUserBolao", async () => {
      const { fetchBolao, fetchUserBolao } = await import("@/app/lib/data")
      const error = new Error("Failed to fetch user bolao")

      vi.mocked(fetchBolao).mockResolvedValue(mockBolao as any)
      vi.mocked(fetchUserBolao).mockRejectedValue(error)

      await expect(
        getData({ bolaoId: "bolao-1", userId: "user-1" })
      ).rejects.toThrow("Failed to fetch user bolao")
    })

    it("should propagate errors from fetchUserBets", async () => {
      const { fetchBolao, fetchUserBolao, fetchUserBets } = await import(
        "@/app/lib/data"
      )
      const error = new Error("Failed to fetch bets")

      vi.mocked(fetchBolao).mockResolvedValue(mockBolao as any)
      vi.mocked(fetchUserBolao).mockResolvedValue(mockUserBolao as any)
      vi.mocked(fetchUserBets).mockRejectedValue(error)

      await expect(
        getData({ bolaoId: "bolao-1", userId: "user-1" })
      ).rejects.toThrow("Failed to fetch bets")
    })

    it("should handle multiple fixtures", async () => {
      const { fetchBolao, fetchUserBolao, fetchRounds, fetchFixtures, fetchUserBets } =
        await import("@/app/lib/data")

      const multipleFixtures = [
        mockFixture,
        { ...mockFixture, fixture: { ...mockFixture.fixture, id: 2 } },
        { ...mockFixture, fixture: { ...mockFixture.fixture, id: 3 } },
      ]

      vi.mocked(fetchBolao).mockResolvedValue(mockBolao as any)
      vi.mocked(fetchUserBolao).mockResolvedValue(mockUserBolao as any)
      vi.mocked(fetchRounds).mockResolvedValue(mockRounds)
      vi.mocked(fetchFixtures).mockResolvedValue(multipleFixtures)
      vi.mocked(fetchUserBets).mockResolvedValue([])

      const result = await getData({ bolaoId: "bolao-1", userId: "user-1" })

      expect(result.fixtures).toHaveLength(3)
    })

    it("should handle empty bets array", async () => {
      const { fetchBolao, fetchUserBolao, fetchRounds, fetchFixtures, fetchUserBets } =
        await import("@/app/lib/data")

      vi.mocked(fetchBolao).mockResolvedValue(mockBolao as any)
      vi.mocked(fetchUserBolao).mockResolvedValue(mockUserBolao as any)
      vi.mocked(fetchRounds).mockResolvedValue(mockRounds)
      vi.mocked(fetchFixtures).mockResolvedValue([])
      vi.mocked(fetchUserBets).mockResolvedValue([])

      const result = await getData({ bolaoId: "bolao-1", userId: "user-1" })

      expect(result.bets).toHaveLength(0)
    })

    it("should extract year and leagueId from bolao", async () => {
      const { fetchBolao, fetchUserBolao, fetchRounds, fetchFixtures, fetchUserBets } =
        await import("@/app/lib/data")

      const customBolao = { ...mockBolao, year: 2023, competition_id: "39" }

      vi.mocked(fetchBolao).mockResolvedValue(customBolao as any)
      vi.mocked(fetchUserBolao).mockResolvedValue(mockUserBolao as any)
      vi.mocked(fetchRounds).mockResolvedValue(mockRounds)
      vi.mocked(fetchFixtures).mockResolvedValue([])
      vi.mocked(fetchUserBets).mockResolvedValue([])

      await getData({ bolaoId: "bolao-1", userId: "user-1" })

      expect(fetchRounds).toHaveBeenCalledWith({
        leagueId: "39",
        year: 2023,
      })
      expect(fetchFixtures).toHaveBeenCalledWith(
        expect.objectContaining({
          leagueId: "39",
          year: 2023,
        })
      )
    })
  })
})

