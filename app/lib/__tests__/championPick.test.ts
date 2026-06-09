import { describe, it, expect, vi, afterEach } from "vitest"
import {
  isChampionPickLocked,
  getChampionPickLockDate,
  getTeamsFromFixtures,
} from "../utils"
import { getLeagueWinnerTeamId } from "../championPick"
import type { FixtureData } from "../definitions"

function makeFixture(
  id: number,
  date: string,
  home: { id: number; name: string },
  away: { id: number; name: string }
): FixtureData {
  return {
    fixture: { id, date: new Date(date) } as FixtureData["fixture"],
    teams: {
      home: { ...home, logo: `${home.name}.png`, winner: null },
      away: { ...away, logo: `${away.name}.png`, winner: null },
    },
  } as FixtureData
}

describe("champion pick utils", () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  describe("getChampionPickLockDate", () => {
    it("returns earliest fixture date", () => {
      const fixtures = [
        makeFixture(
          2,
          "2026-06-15T19:00:00Z",
          { id: 1, name: "B" },
          { id: 2, name: "C" }
        ),
        makeFixture(
          1,
          "2026-06-11T19:00:00Z",
          { id: 3, name: "A" },
          { id: 4, name: "D" }
        ),
      ]
      expect(getChampionPickLockDate(fixtures)).toEqual(
        new Date("2026-06-11T19:00:00Z")
      )
    })

    it("returns null for empty fixtures", () => {
      expect(getChampionPickLockDate([])).toBeNull()
    })
  })

  describe("isChampionPickLocked", () => {
    it("returns false before earliest kickoff", () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date("2026-06-10T12:00:00Z"))
      const fixtures = [
        makeFixture(
          1,
          "2026-06-11T19:00:00Z",
          { id: 1, name: "A" },
          { id: 2, name: "B" }
        ),
      ]
      expect(isChampionPickLocked(fixtures)).toBe(false)
    })

    it("returns true at or after earliest kickoff", () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date("2026-06-11T19:00:00Z"))
      const fixtures = [
        makeFixture(
          1,
          "2026-06-11T19:00:00Z",
          { id: 1, name: "A" },
          { id: 2, name: "B" }
        ),
      ]
      expect(isChampionPickLocked(fixtures)).toBe(true)
    })
  })

  describe("getTeamsFromFixtures", () => {
    it("dedupes and sorts teams alphabetically", () => {
      const fixtures = [
        makeFixture(
          1,
          "2026-06-11T19:00:00Z",
          { id: 10, name: "Mexico" },
          { id: 20, name: "Brazil" }
        ),
        makeFixture(
          2,
          "2026-06-12T19:00:00Z",
          { id: 10, name: "Mexico" },
          { id: 30, name: "Argentina" }
        ),
      ]
      expect(getTeamsFromFixtures(fixtures)).toEqual([
        { id: 30, name: "Argentina", logo: "Argentina.png" },
        { id: 20, name: "Brazil", logo: "Brazil.png" },
        { id: 10, name: "Mexico", logo: "Mexico.png" },
      ])
    })
  })

  describe("getLeagueWinnerTeamId", () => {
    it("returns winner id from current season", () => {
      const league = {
        seasons: [
          { year: 2026, current: true, winner: { id: 10, name: "Brazil" } },
        ],
      }
      expect(getLeagueWinnerTeamId(league)).toBe(10)
    })

    it("returns null when no winner yet", () => {
      const league = {
        seasons: [{ year: 2026, current: true, winner: null }],
      }
      expect(getLeagueWinnerTeamId(league)).toBeNull()
    })
  })
})
