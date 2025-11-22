import { describe, it, expect, vi, beforeEach } from "vitest"
import { getData } from "../controllerResults"
import type { Bolao, UserBolao, Bet, FixtureData } from "@/app/lib/definitions"

// Mock data fetching functions
vi.mock("@/app/lib/data", () => ({
  fetchBolao: vi.fn(),
  fetchUsersBolao: vi.fn(),
  fetchRounds: vi.fn(),
  fetchFixtures: vi.fn(),
  fetchUsersBets: vi.fn(),
}))

// Mock Clerk client
vi.mock("@clerk/nextjs/server", () => ({
  clerkClient: vi.fn(),
}))

// Mock Next.js cache
vi.mock("next/cache", () => ({
  unstable_noStore: vi.fn(),
}))

// Mock utility functions
vi.mock("@/app/lib/utils", () => ({
  sortFixtures: vi.fn((fixtures) => fixtures),
  cleanRounds: vi.fn((rounds) => rounds),
}))

describe("controllerResults", () => {
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

  const mockRounds = ["Round 1", "Round 2", "Round 3", "Round 4"]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("getData", () => {
    it("should fetch and return all required data without roundParam", async () => {
      const {
        fetchBolao,
        fetchUsersBolao,
        fetchRounds,
        fetchFixtures,
        fetchUsersBets,
      } = await import("@/app/lib/data")
      const { clerkClient } = await import("@clerk/nextjs/server")

      const mockClient = {
        users: {
          getUserList: vi.fn().mockResolvedValue({
            data: [
              {
                id: "user-1",
                firstName: "John",
                emailAddresses: [{ emailAddress: "john@example.com" }],
              },
              {
                id: "user-2",
                firstName: "Jane",
                emailAddresses: [{ emailAddress: "jane@example.com" }],
              },
            ],
          }),
        },
      }

      vi.mocked(fetchBolao).mockResolvedValue(mockBolao as any)
      vi.mocked(fetchUsersBolao).mockResolvedValue(mockUsersBolao as any)
      vi.mocked(fetchRounds)
        .mockResolvedValueOnce(mockRounds)
        .mockResolvedValueOnce(["Round 2"])
      vi.mocked(fetchFixtures).mockResolvedValue([mockFixture])
      vi.mocked(fetchUsersBets).mockResolvedValue(mockBets)
      vi.mocked(clerkClient).mockResolvedValue(mockClient as any)

      const result = await getData({ bolaoId: "bolao-1" })

      expect(result.bolao).toEqual(mockBolao)
      expect(result.usersBolao).toEqual(mockUsersBolao)
      expect(result.allRounds).toEqual(mockRounds)
      expect(result.currentRound).toBe("Round 2")
      expect(result.fixtures).toEqual([mockFixture])
      expect(result.players).toHaveLength(2)
      expect(result.bets).toEqual(mockBets)
    })

    it("should call noStore to disable caching", async () => {
      const {
        fetchBolao,
        fetchUsersBolao,
        fetchRounds,
        fetchFixtures,
        fetchUsersBets,
      } = await import("@/app/lib/data")
      const { clerkClient } = await import("@clerk/nextjs/server")
      const { unstable_noStore } = await import("next/cache")

      const mockClient = {
        users: {
          getUserList: vi.fn().mockResolvedValue({ data: [] }),
        },
      }

      vi.mocked(fetchBolao).mockResolvedValue(mockBolao as any)
      vi.mocked(fetchUsersBolao).mockResolvedValue([] as any)
      vi.mocked(fetchRounds).mockResolvedValue(mockRounds)
      vi.mocked(fetchFixtures).mockResolvedValue([])
      vi.mocked(fetchUsersBets).mockResolvedValue([])
      vi.mocked(clerkClient).mockResolvedValue(mockClient as any)

      await getData({ bolaoId: "bolao-1" })

      expect(unstable_noStore).toHaveBeenCalled()
    })

    it("should fetch bolao and usersBolao in parallel", async () => {
      const {
        fetchBolao,
        fetchUsersBolao,
        fetchRounds,
        fetchFixtures,
        fetchUsersBets,
      } = await import("@/app/lib/data")
      const { clerkClient } = await import("@clerk/nextjs/server")

      const mockClient = {
        users: {
          getUserList: vi.fn().mockResolvedValue({ data: [] }),
        },
      }

      vi.mocked(fetchBolao).mockResolvedValue(mockBolao as any)
      vi.mocked(fetchUsersBolao).mockResolvedValue([] as any)
      vi.mocked(fetchRounds).mockResolvedValue(mockRounds)
      vi.mocked(fetchFixtures).mockResolvedValue([])
      vi.mocked(fetchUsersBets).mockResolvedValue([])
      vi.mocked(clerkClient).mockResolvedValue(mockClient as any)

      await getData({ bolaoId: "bolao-1" })

      expect(fetchBolao).toHaveBeenCalledWith("bolao-1")
      expect(fetchUsersBolao).toHaveBeenCalledWith("bolao-1")
    })

    it("should fetch rounds with correct parameters", async () => {
      const {
        fetchBolao,
        fetchUsersBolao,
        fetchRounds,
        fetchFixtures,
        fetchUsersBets,
      } = await import("@/app/lib/data")
      const { clerkClient } = await import("@clerk/nextjs/server")

      const mockClient = {
        users: {
          getUserList: vi.fn().mockResolvedValue({ data: [] }),
        },
      }

      vi.mocked(fetchBolao).mockResolvedValue(mockBolao as any)
      vi.mocked(fetchUsersBolao).mockResolvedValue([] as any)
      vi.mocked(fetchRounds).mockResolvedValue(mockRounds)
      vi.mocked(fetchFixtures).mockResolvedValue([])
      vi.mocked(fetchUsersBets).mockResolvedValue([])
      vi.mocked(clerkClient).mockResolvedValue(mockClient as any)

      await getData({ bolaoId: "bolao-1" })

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
      const {
        fetchBolao,
        fetchUsersBolao,
        fetchRounds,
        fetchFixtures,
        fetchUsersBets,
      } = await import("@/app/lib/data")
      const { clerkClient } = await import("@clerk/nextjs/server")
      const { cleanRounds } = await import("@/app/lib/utils")

      const mockClient = {
        users: {
          getUserList: vi.fn().mockResolvedValue({ data: [] }),
        },
      }

      vi.mocked(fetchBolao).mockResolvedValue(mockBolao as any)
      vi.mocked(fetchUsersBolao).mockResolvedValue([] as any)
      vi.mocked(fetchRounds).mockResolvedValue(mockRounds)
      vi.mocked(fetchFixtures).mockResolvedValue([])
      vi.mocked(fetchUsersBets).mockResolvedValue([])
      vi.mocked(clerkClient).mockResolvedValue(mockClient as any)

      await getData({ bolaoId: "bolao-1" })

      expect(cleanRounds).toHaveBeenCalledWith(mockRounds)
    })

    it("should use sortFixtures utility on fetched fixtures", async () => {
      const {
        fetchBolao,
        fetchUsersBolao,
        fetchRounds,
        fetchFixtures,
        fetchUsersBets,
      } = await import("@/app/lib/data")
      const { clerkClient } = await import("@clerk/nextjs/server")
      const { sortFixtures } = await import("@/app/lib/utils")

      const mockClient = {
        users: {
          getUserList: vi.fn().mockResolvedValue({ data: [] }),
        },
      }

      vi.mocked(fetchBolao).mockResolvedValue(mockBolao as any)
      vi.mocked(fetchUsersBolao).mockResolvedValue([] as any)
      vi.mocked(fetchRounds).mockResolvedValue(mockRounds)
      vi.mocked(fetchFixtures).mockResolvedValue([mockFixture])
      vi.mocked(fetchUsersBets).mockResolvedValue([])
      vi.mocked(clerkClient).mockResolvedValue(mockClient as any)

      await getData({ bolaoId: "bolao-1" })

      expect(sortFixtures).toHaveBeenCalledWith([mockFixture])
    })

    it("should handle roundParam and use it for pagination", async () => {
      const {
        fetchBolao,
        fetchUsersBolao,
        fetchRounds,
        fetchFixtures,
        fetchUsersBets,
      } = await import("@/app/lib/data")
      const { clerkClient } = await import("@clerk/nextjs/server")

      const mockClient = {
        users: {
          getUserList: vi.fn().mockResolvedValue({ data: [] }),
        },
      }

      vi.mocked(fetchBolao).mockResolvedValue(mockBolao as any)
      vi.mocked(fetchUsersBolao).mockResolvedValue([] as any)
      vi.mocked(fetchRounds).mockResolvedValue(mockRounds)
      vi.mocked(fetchFixtures).mockResolvedValue([])
      vi.mocked(fetchUsersBets).mockResolvedValue([])
      vi.mocked(clerkClient).mockResolvedValue(mockClient as any)

      const result = await getData({ bolaoId: "bolao-1", roundParam: "2" })

      expect(result.currentRound).toBe("Round 2")
      expect(fetchFixtures).toHaveBeenCalledWith({
        leagueId: "2",
        year: 2024,
        round: "Round 2",
      })
    })

    it("should set isFirstRound correctly when roundParam is 1", async () => {
      const {
        fetchBolao,
        fetchUsersBolao,
        fetchRounds,
        fetchFixtures,
        fetchUsersBets,
      } = await import("@/app/lib/data")
      const { clerkClient } = await import("@clerk/nextjs/server")

      const mockClient = {
        users: {
          getUserList: vi.fn().mockResolvedValue({ data: [] }),
        },
      }

      vi.mocked(fetchBolao).mockResolvedValue(mockBolao as any)
      vi.mocked(fetchUsersBolao).mockResolvedValue([] as any)
      vi.mocked(fetchRounds).mockResolvedValue(mockRounds)
      vi.mocked(fetchFixtures).mockResolvedValue([])
      vi.mocked(fetchUsersBets).mockResolvedValue([])
      vi.mocked(clerkClient).mockResolvedValue(mockClient as any)

      const result = await getData({ bolaoId: "bolao-1", roundParam: "1" })

      expect(result.isFirstRound).toBe(true)
      expect(result.isLastRound).toBe(false)
      expect(result.currentRound).toBe("Round 1")
    })

    it("should set isLastRound correctly when roundParam is last round", async () => {
      const {
        fetchBolao,
        fetchUsersBolao,
        fetchRounds,
        fetchFixtures,
        fetchUsersBets,
      } = await import("@/app/lib/data")
      const { clerkClient } = await import("@clerk/nextjs/server")

      const mockClient = {
        users: {
          getUserList: vi.fn().mockResolvedValue({ data: [] }),
        },
      }

      vi.mocked(fetchBolao).mockResolvedValue(mockBolao as any)
      vi.mocked(fetchUsersBolao).mockResolvedValue([] as any)
      vi.mocked(fetchRounds).mockResolvedValue(mockRounds)
      vi.mocked(fetchFixtures).mockResolvedValue([])
      vi.mocked(fetchUsersBets).mockResolvedValue([])
      vi.mocked(clerkClient).mockResolvedValue(mockClient as any)

      const result = await getData({ bolaoId: "bolao-1", roundParam: "4" })

      expect(result.isFirstRound).toBe(false)
      expect(result.isLastRound).toBe(true)
      expect(result.currentRound).toBe("Round 4")
    })

    it("should handle middle round correctly", async () => {
      const {
        fetchBolao,
        fetchUsersBolao,
        fetchRounds,
        fetchFixtures,
        fetchUsersBets,
      } = await import("@/app/lib/data")
      const { clerkClient } = await import("@clerk/nextjs/server")

      const mockClient = {
        users: {
          getUserList: vi.fn().mockResolvedValue({ data: [] }),
        },
      }

      vi.mocked(fetchBolao).mockResolvedValue(mockBolao as any)
      vi.mocked(fetchUsersBolao).mockResolvedValue([] as any)
      vi.mocked(fetchRounds).mockResolvedValue(mockRounds)
      vi.mocked(fetchFixtures).mockResolvedValue([])
      vi.mocked(fetchUsersBets).mockResolvedValue([])
      vi.mocked(clerkClient).mockResolvedValue(mockClient as any)

      const result = await getData({ bolaoId: "bolao-1", roundParam: "3" })

      expect(result.isFirstRound).toBe(false)
      expect(result.isLastRound).toBe(false)
      expect(result.currentRound).toBe("Round 3")
    })

    it("should fallback to last round when currentRound is empty", async () => {
      const {
        fetchBolao,
        fetchUsersBolao,
        fetchRounds,
        fetchFixtures,
        fetchUsersBets,
      } = await import("@/app/lib/data")
      const { clerkClient } = await import("@clerk/nextjs/server")

      const mockClient = {
        users: {
          getUserList: vi.fn().mockResolvedValue({ data: [] }),
        },
      }

      vi.mocked(fetchBolao).mockResolvedValue(mockBolao as any)
      vi.mocked(fetchUsersBolao).mockResolvedValue([] as any)
      vi.mocked(fetchRounds)
        .mockResolvedValueOnce(mockRounds)
        .mockResolvedValueOnce([]) // Empty current round
      vi.mocked(fetchFixtures).mockResolvedValue([])
      vi.mocked(fetchUsersBets).mockResolvedValue([])
      vi.mocked(clerkClient).mockResolvedValue(mockClient as any)

      const result = await getData({ bolaoId: "bolao-1" })

      expect(result.currentRound).toBe("Round 4") // Last round
    })

    it("should fetch players from Clerk with correct user IDs", async () => {
      const {
        fetchBolao,
        fetchUsersBolao,
        fetchRounds,
        fetchFixtures,
        fetchUsersBets,
      } = await import("@/app/lib/data")
      const { clerkClient } = await import("@clerk/nextjs/server")

      const mockGetUserList = vi.fn().mockResolvedValue({
        data: [
          {
            id: "user-1",
            firstName: "John",
            emailAddresses: [{ emailAddress: "john@example.com" }],
          },
        ],
      })

      const mockClient = {
        users: { getUserList: mockGetUserList },
      }

      vi.mocked(fetchBolao).mockResolvedValue(mockBolao as any)
      vi.mocked(fetchUsersBolao).mockResolvedValue(mockUsersBolao as any)
      vi.mocked(fetchRounds).mockResolvedValue(mockRounds)
      vi.mocked(fetchFixtures).mockResolvedValue([])
      vi.mocked(fetchUsersBets).mockResolvedValue([])
      vi.mocked(clerkClient).mockResolvedValue(mockClient as any)

      await getData({ bolaoId: "bolao-1" })

      expect(mockGetUserList).toHaveBeenCalledWith({
        userId: ["user-1", "user-2"],
      })
    })

    it("should map players correctly with userBolaoId", async () => {
      const {
        fetchBolao,
        fetchUsersBolao,
        fetchRounds,
        fetchFixtures,
        fetchUsersBets,
      } = await import("@/app/lib/data")
      const { clerkClient } = await import("@clerk/nextjs/server")

      const mockClient = {
        users: {
          getUserList: vi.fn().mockResolvedValue({
            data: [
              {
                id: "user-1",
                firstName: "John",
                emailAddresses: [{ emailAddress: "john@example.com" }],
              },
            ],
          }),
        },
      }

      vi.mocked(fetchBolao).mockResolvedValue(mockBolao as any)
      vi.mocked(fetchUsersBolao).mockResolvedValue([mockUsersBolao[0]] as any)
      vi.mocked(fetchRounds).mockResolvedValue(mockRounds)
      vi.mocked(fetchFixtures).mockResolvedValue([])
      vi.mocked(fetchUsersBets).mockResolvedValue([])
      vi.mocked(clerkClient).mockResolvedValue(mockClient as any)

      const result = await getData({ bolaoId: "bolao-1" })

      expect(result.players[0]).toEqual({
        id: "user-1",
        firstName: "John",
        email: "john@example.com",
        userBolaoId: "ub-1",
      })
    })

    it("should fetch bets with all userBolao IDs", async () => {
      const {
        fetchBolao,
        fetchUsersBolao,
        fetchRounds,
        fetchFixtures,
        fetchUsersBets,
      } = await import("@/app/lib/data")
      const { clerkClient } = await import("@clerk/nextjs/server")

      const mockClient = {
        users: {
          getUserList: vi.fn().mockResolvedValue({ data: [] }),
        },
      }

      vi.mocked(fetchBolao).mockResolvedValue(mockBolao as any)
      vi.mocked(fetchUsersBolao).mockResolvedValue(mockUsersBolao as any)
      vi.mocked(fetchRounds).mockResolvedValue(mockRounds)
      vi.mocked(fetchFixtures).mockResolvedValue([])
      vi.mocked(fetchUsersBets).mockResolvedValue([])
      vi.mocked(clerkClient).mockResolvedValue(mockClient as any)

      await getData({ bolaoId: "bolao-1" })

      expect(fetchUsersBets).toHaveBeenCalledWith(["ub-1", "ub-2"])
    })

    it("should set isFirstRound and isLastRound when no roundParam and currentRound is first", async () => {
      const {
        fetchBolao,
        fetchUsersBolao,
        fetchRounds,
        fetchFixtures,
        fetchUsersBets,
      } = await import("@/app/lib/data")
      const { clerkClient } = await import("@clerk/nextjs/server")

      const mockClient = {
        users: {
          getUserList: vi.fn().mockResolvedValue({ data: [] }),
        },
      }

      vi.mocked(fetchBolao).mockResolvedValue(mockBolao as any)
      vi.mocked(fetchUsersBolao).mockResolvedValue([] as any)
      vi.mocked(fetchRounds)
        .mockResolvedValueOnce(mockRounds)
        .mockResolvedValueOnce(["Round 1"]) // Current round is first
      vi.mocked(fetchFixtures).mockResolvedValue([])
      vi.mocked(fetchUsersBets).mockResolvedValue([])
      vi.mocked(clerkClient).mockResolvedValue(mockClient as any)

      const result = await getData({ bolaoId: "bolao-1" })

      expect(result.isFirstRound).toBe(true)
      expect(result.isLastRound).toBe(false)
    })

    it("should set isFirstRound and isLastRound when no roundParam and currentRound is last", async () => {
      const {
        fetchBolao,
        fetchUsersBolao,
        fetchRounds,
        fetchFixtures,
        fetchUsersBets,
      } = await import("@/app/lib/data")
      const { clerkClient } = await import("@clerk/nextjs/server")

      const mockClient = {
        users: {
          getUserList: vi.fn().mockResolvedValue({ data: [] }),
        },
      }

      vi.mocked(fetchBolao).mockResolvedValue(mockBolao as any)
      vi.mocked(fetchUsersBolao).mockResolvedValue([] as any)
      vi.mocked(fetchRounds)
        .mockResolvedValueOnce(mockRounds)
        .mockResolvedValueOnce(["Round 4"]) // Current round is last
      vi.mocked(fetchFixtures).mockResolvedValue([])
      vi.mocked(fetchUsersBets).mockResolvedValue([])
      vi.mocked(clerkClient).mockResolvedValue(mockClient as any)

      const result = await getData({ bolaoId: "bolao-1" })

      expect(result.isFirstRound).toBe(false)
      expect(result.isLastRound).toBe(true)
    })

    it("should propagate errors from fetchBolao", async () => {
      const { fetchBolao } = await import("@/app/lib/data")
      const error = new Error("Failed to fetch bolao")

      vi.mocked(fetchBolao).mockRejectedValue(error)

      await expect(getData({ bolaoId: "bolao-1" })).rejects.toThrow(
        "Failed to fetch bolao"
      )
    })

    it("should propagate errors from Clerk client", async () => {
      const { fetchBolao, fetchUsersBolao, fetchRounds } = await import(
        "@/app/lib/data"
      )
      const { clerkClient } = await import("@clerk/nextjs/server")
      const error = new Error("Clerk API error")

      vi.mocked(fetchBolao).mockResolvedValue(mockBolao as any)
      vi.mocked(fetchUsersBolao).mockResolvedValue(mockUsersBolao as any)
      vi.mocked(fetchRounds).mockResolvedValue(mockRounds)
      vi.mocked(clerkClient).mockRejectedValue(error)

      await expect(getData({ bolaoId: "bolao-1" })).rejects.toThrow(
        "Clerk API error"
      )
    })

    it("should handle users with null firstName", async () => {
      const {
        fetchBolao,
        fetchUsersBolao,
        fetchRounds,
        fetchFixtures,
        fetchUsersBets,
      } = await import("@/app/lib/data")
      const { clerkClient } = await import("@clerk/nextjs/server")

      const mockClient = {
        users: {
          getUserList: vi.fn().mockResolvedValue({
            data: [
              {
                id: "user-1",
                firstName: null,
                emailAddresses: [{ emailAddress: "john@example.com" }],
              },
            ],
          }),
        },
      }

      vi.mocked(fetchBolao).mockResolvedValue(mockBolao as any)
      vi.mocked(fetchUsersBolao).mockResolvedValue([mockUsersBolao[0]] as any)
      vi.mocked(fetchRounds).mockResolvedValue(mockRounds)
      vi.mocked(fetchFixtures).mockResolvedValue([])
      vi.mocked(fetchUsersBets).mockResolvedValue([])
      vi.mocked(clerkClient).mockResolvedValue(mockClient as any)

      const result = await getData({ bolaoId: "bolao-1" })

      expect(result.players[0].firstName).toBeNull()
    })

    it("should handle multiple fixtures and bets", async () => {
      const {
        fetchBolao,
        fetchUsersBolao,
        fetchRounds,
        fetchFixtures,
        fetchUsersBets,
      } = await import("@/app/lib/data")
      const { clerkClient } = await import("@clerk/nextjs/server")

      const mockClient = {
        users: {
          getUserList: vi.fn().mockResolvedValue({ data: [] }),
        },
      }

      const multipleFixtures = [
        mockFixture,
        { ...mockFixture, fixture: { ...mockFixture.fixture, id: 2 } },
        { ...mockFixture, fixture: { ...mockFixture.fixture, id: 3 } },
      ]

      const multipleBets = [
        ...mockBets,
        { ...mockBets[0], id: "bet-3", fixture_id: "2" },
      ]

      vi.mocked(fetchBolao).mockResolvedValue(mockBolao as any)
      vi.mocked(fetchUsersBolao).mockResolvedValue([] as any)
      vi.mocked(fetchRounds).mockResolvedValue(mockRounds)
      vi.mocked(fetchFixtures).mockResolvedValue(multipleFixtures)
      vi.mocked(fetchUsersBets).mockResolvedValue(multipleBets)
      vi.mocked(clerkClient).mockResolvedValue(mockClient as any)

      const result = await getData({ bolaoId: "bolao-1" })

      expect(result.fixtures).toHaveLength(3)
      expect(result.bets).toHaveLength(3)
    })
  })
})
