import { describe, it, expect } from "vitest"
import {
  getCurrentSeasonObject,
  sortFixtures,
  formatDateFixtures,
  formatDateNews,
  cleanRounds,
  findBetObj,
  isNil,
  INITIAL_BET_VALUE,
  STATUSES_OPEN_TO_PLAY,
  STATUSES_IN_PLAY,
  STATUSES_FINISHED,
  STATUSES_ERROR,
} from "../utils"
import type { Season, FixtureData, Bet } from "../definitions"

describe("utils", () => {
  describe("getCurrentSeasonObject", () => {
    it("should return the current season when one exists", () => {
      const seasons: Season[] = [
        {
          year: 2023,
          current: false,
          start: "2023-01-01",
          end: "2023-12-31",
          coveragge: {},
        },
        {
          year: 2024,
          current: true,
          start: "2024-01-01",
          end: "2024-12-31",
          coveragge: {},
        },
        {
          year: 2025,
          current: false,
          start: "2025-01-01",
          end: "2025-12-31",
          coveragge: {},
        },
      ]

      const result = getCurrentSeasonObject(seasons)

      expect(result).toEqual({
        year: 2024,
        current: true,
        start: "2024-01-01",
        end: "2024-12-31",
        coveragge: {},
      })
    })

    it("should return undefined when no current season exists", () => {
      const seasons: Season[] = [
        {
          year: 2023,
          current: false,
          start: "2023-01-01",
          end: "2023-12-31",
          coveragge: {},
        },
        {
          year: 2024,
          current: false,
          start: "2024-01-01",
          end: "2024-12-31",
          coveragge: {},
        },
      ]

      const result = getCurrentSeasonObject(seasons)

      expect(result).toBeUndefined()
    })

    it("should return undefined for empty array", () => {
      const result = getCurrentSeasonObject([])

      expect(result).toBeUndefined()
    })
  })

  describe("sortFixtures", () => {
    it("should sort fixtures by date in ascending order", () => {
      const fixtures: Partial<FixtureData>[] = [
        {
          fixture: { id: 1, date: "2024-03-15T20:00:00Z" } as any,
          league: { id: 1, name: "Test League", country: "Test" } as any,
          teams: {
            home: { id: 1, name: "Home Team", logo: "" } as any,
            away: { id: 2, name: "Away Team", logo: "" } as any,
          },
        },
        {
          fixture: { id: 2, date: "2024-03-10T18:00:00Z" } as any,
          league: { id: 1, name: "Test League", country: "Test" } as any,
          teams: {
            home: { id: 3, name: "Home Team 2", logo: "" } as any,
            away: { id: 4, name: "Away Team 2", logo: "" } as any,
          },
        },
        {
          fixture: { id: 3, date: "2024-03-20T21:00:00Z" } as any,
          league: { id: 1, name: "Test League", country: "Test" } as any,
          teams: {
            home: { id: 5, name: "Home Team 3", logo: "" } as any,
            away: { id: 6, name: "Away Team 3", logo: "" } as any,
          },
        },
      ]

      const result = sortFixtures(fixtures as FixtureData[])

      expect(result[0].fixture.id).toBe(2)
      expect(result[1].fixture.id).toBe(1)
      expect(result[2].fixture.id).toBe(3)
    })

    it("should handle fixtures with the same date", () => {
      const fixtures: Partial<FixtureData>[] = [
        {
          fixture: { id: 1, date: "2024-03-15T20:00:00Z" } as any,
          league: { id: 1, name: "Test League", country: "Test" } as any,
          teams: {
            home: { id: 1, name: "Home Team", logo: "" } as any,
            away: { id: 2, name: "Away Team", logo: "" } as any,
          },
        },
        {
          fixture: { id: 2, date: "2024-03-15T20:00:00Z" } as any,
          league: { id: 1, name: "Test League", country: "Test" } as any,
          teams: {
            home: { id: 3, name: "Home Team 2", logo: "" } as any,
            away: { id: 4, name: "Away Team 2", logo: "" } as any,
          },
        },
      ]

      const result = sortFixtures(fixtures as FixtureData[])

      expect(result).toHaveLength(2)
      // Order should remain stable for same dates
      expect(result[0].fixture.id).toBe(1)
      expect(result[1].fixture.id).toBe(2)
    })

    it("should return empty array for empty input", () => {
      const result = sortFixtures([])

      expect(result).toEqual([])
    })
  })

  describe("formatDateFixtures", () => {
    it("should format date correctly", () => {
      const dateString = "2024-03-15T20:30:00Z"
      const result = formatDateFixtures(dateString)

      // The format is "LLL do H:mm" (e.g., "Mar 15th 20:30")
      expect(result).toMatch(/Mar 15th \d{1,2}:\d{2}/)
    })

    it("should handle different months", () => {
      const dateString = "2024-12-25T15:45:00Z"
      const result = formatDateFixtures(dateString)

      expect(result).toMatch(/Dec 25th \d{1,2}:\d{2}/)
    })
  })

  describe("formatDateNews", () => {
    it("should format date in long format", () => {
      const dateString = "2024-03-15T20:30:00Z"
      const result = formatDateNews(dateString)

      // The format is "PPP" (e.g., "March 15th, 2024")
      expect(result).toMatch(/March 15th, 2024/)
    })

    it("should handle different dates", () => {
      const dateString = "2024-06-15T12:00:00Z"
      const result = formatDateNews(dateString)

      expect(result).toMatch(/June 15th, 2024/)
    })
  })

  describe("cleanRounds", () => {
    it("should remove qualifying rounds", () => {
      const rounds = [
        "Preliminary Round",
        "Group Stage",
        "1st Qualifying Round",
        "Round of 16",
        "2nd Qualifying Round",
        "Quarter-finals",
        "3rd Qualifying Round",
        "Semi-finals",
        "Play-offs",
        "Final",
      ]

      const result = cleanRounds(rounds)

      expect(result).toEqual([
        "Group Stage",
        "Round of 16",
        "Quarter-finals",
        "Semi-finals",
        "Final",
      ])
    })

    it("should return empty array when all rounds are removed", () => {
      const rounds = [
        "Preliminary Round",
        "1st Qualifying Round",
        "2nd Qualifying Round",
        "3rd Qualifying Round",
        "Play-offs",
      ]

      const result = cleanRounds(rounds)

      expect(result).toEqual([])
    })

    it("should return same array when no rounds need to be removed", () => {
      const rounds = ["Group Stage", "Round of 16", "Quarter-finals", "Final"]

      const result = cleanRounds(rounds)

      expect(result).toEqual(rounds)
    })

    it("should handle empty array", () => {
      const result = cleanRounds([])

      expect(result).toEqual([])
    })
  })

  describe("findBetObj", () => {
    const mockBets: Bet[] = [
      {
        id: "bet-1",
        fixture_id: "fixture-1",
        type: "home",
        value: 2,
        user_bolao_id: "user-bolao-1",
      },
      {
        id: "bet-2",
        fixture_id: "fixture-1",
        type: "away",
        value: 1,
        user_bolao_id: "user-bolao-1",
      },
      {
        id: "bet-3",
        fixture_id: "fixture-2",
        type: "home",
        value: 3,
        user_bolao_id: "user-bolao-2",
      },
    ]

    it("should find bet by fixture_id and type", () => {
      const result = findBetObj({
        bets: mockBets,
        fixtureId: "fixture-1",
        type: "home",
      })

      expect(result).toEqual(mockBets[0])
    })

    it("should find bet with userBolaoId filter", () => {
      const result = findBetObj({
        bets: mockBets,
        fixtureId: "fixture-2",
        type: "home",
        userBolaoId: "user-bolao-2",
      })

      expect(result).toEqual(mockBets[2])
    })

    it("should return null when bet is not found", () => {
      const result = findBetObj({
        bets: mockBets,
        fixtureId: "non-existent",
        type: "home",
      })

      expect(result).toBeNull()
    })

    it("should return null when userBolaoId does not match", () => {
      const result = findBetObj({
        bets: mockBets,
        fixtureId: "fixture-1",
        type: "home",
        userBolaoId: "wrong-user-bolao",
      })

      expect(result).toBeNull()
    })

    it("should handle empty bets array", () => {
      const result = findBetObj({
        bets: [],
        fixtureId: "fixture-1",
        type: "home",
      })

      expect(result).toBeNull()
    })
  })

  describe("isNil", () => {
    it("should return true for null", () => {
      expect(isNil(null)).toBe(true)
    })

    it("should return true for undefined", () => {
      expect(isNil(undefined)).toBe(true)
    })

    it("should return false for 0", () => {
      expect(isNil(0)).toBe(false)
    })

    it("should return false for empty string", () => {
      expect(isNil("")).toBe(false)
    })

    it("should return false for false", () => {
      expect(isNil(false)).toBe(false)
    })

    it("should return false for empty array", () => {
      expect(isNil([])).toBe(false)
    })

    it("should return false for empty object", () => {
      expect(isNil({})).toBe(false)
    })

    it("should return false for valid values", () => {
      expect(isNil("test")).toBe(false)
      expect(isNil(123)).toBe(false)
      expect(isNil(true)).toBe(false)
      expect(isNil([1, 2, 3])).toBe(false)
      expect(isNil({ key: "value" })).toBe(false)
    })
  })

  describe("constants", () => {
    it("should have correct INITIAL_BET_VALUE", () => {
      expect(INITIAL_BET_VALUE).toBe(".")
    })

    it("should have correct STATUSES_OPEN_TO_PLAY", () => {
      expect(STATUSES_OPEN_TO_PLAY).toEqual(["TBD", "NS", "PST", "AWD"])
    })

    it("should have correct STATUSES_IN_PLAY", () => {
      expect(STATUSES_IN_PLAY).toEqual(["1H", "HT", "2H", "ET", "BT", "LIVE"])
    })

    it("should have correct STATUSES_FINISHED", () => {
      expect(STATUSES_FINISHED).toEqual(["FT", "AET", "PEN", "CANC", ""])
    })

    it("should have correct STATUSES_ERROR", () => {
      expect(STATUSES_ERROR).toEqual(["CANC", "PST", "ABD", "AWD"])
    })
  })
})
