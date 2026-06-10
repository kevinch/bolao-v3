import { describe, it, expect, vi, afterEach, beforeEach } from "vitest"
import {
  isChampionPickLocked,
  getChampionPickLockDate,
  getTeamsFromFixtures,
} from "../utils"
import {
  isSeasonFinished,
  getCupWinnerTeamId,
  getLeagueWinnerFromStandings,
  resolveChampionTeamId,
} from "../championPick"
import type { FixtureData, Standing } from "../definitions"

vi.mock("../data", () => ({
  fetchStandings: vi.fn(),
}))

function makeFixture(
  id: number,
  date: string,
  home: { id: number; name: string; winner?: boolean | null },
  away: { id: number; name: string; winner?: boolean | null },
  statusShort: string = "NS"
): FixtureData {
  return {
    fixture: {
      id,
      date: new Date(date),
      status: { long: "", short: statusShort, elapsed: null },
    } as unknown as FixtureData["fixture"],
    teams: {
      home: {
        id: home.id,
        name: home.name,
        logo: `${home.name}.png`,
        winner: home.winner ?? null,
      },
      away: {
        id: away.id,
        name: away.name,
        logo: `${away.name}.png`,
        winner: away.winner ?? null,
      },
    },
  } as FixtureData
}

function makeStanding(rank: number, teamId: number, teamName: string): Standing {
  return {
    rank,
    team: { id: teamId, name: teamName, logo: `${teamName}.png` },
  } as Standing
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
})

describe("winner resolution", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("isSeasonFinished", () => {
    it("returns false for empty fixtures", () => {
      expect(isSeasonFinished([])).toBe(false)
    })

    it("returns false when a fixture is still open to play", () => {
      const fixtures = [
        makeFixture(1, "2026-06-11T19:00:00Z", { id: 1, name: "A" }, { id: 2, name: "B" }, "FT"),
        makeFixture(2, "2026-06-15T19:00:00Z", { id: 3, name: "C" }, { id: 4, name: "D" }, "NS"),
      ]
      expect(isSeasonFinished(fixtures)).toBe(false)
    })

    it("returns false when a fixture is in play", () => {
      const fixtures = [
        makeFixture(1, "2026-06-11T19:00:00Z", { id: 1, name: "A" }, { id: 2, name: "B" }, "2H"),
      ]
      expect(isSeasonFinished(fixtures)).toBe(false)
    })

    it("returns true when all fixtures are finished", () => {
      const fixtures = [
        makeFixture(1, "2026-06-11T19:00:00Z", { id: 1, name: "A" }, { id: 2, name: "B" }, "FT"),
        makeFixture(2, "2026-06-15T19:00:00Z", { id: 3, name: "C" }, { id: 4, name: "D" }, "PEN"),
      ]
      expect(isSeasonFinished(fixtures)).toBe(true)
    })
  })

  describe("getCupWinnerTeamId", () => {
    it("returns the winning team of the chronologically last fixture", () => {
      const fixtures = [
        makeFixture(
          2,
          "2022-12-18T15:00:00Z",
          { id: 26, name: "Argentina", winner: true },
          { id: 2, name: "France", winner: false },
          "PEN"
        ),
        makeFixture(
          1,
          "2022-12-17T15:00:00Z",
          { id: 7, name: "Croatia", winner: true },
          { id: 31, name: "Morocco", winner: false },
          "FT"
        ),
      ]
      expect(getCupWinnerTeamId(fixtures)).toBe(26)
    })

    it("returns the away team when it won the final", () => {
      const fixtures = [
        makeFixture(
          1,
          "2022-12-18T15:00:00Z",
          { id: 26, name: "Argentina", winner: false },
          { id: 2, name: "France", winner: true },
          "FT"
        ),
      ]
      expect(getCupWinnerTeamId(fixtures)).toBe(2)
    })

    it("returns null when the last fixture has no winner flag", () => {
      const fixtures = [
        makeFixture(
          1,
          "2022-12-18T15:00:00Z",
          { id: 26, name: "Argentina" },
          { id: 2, name: "France" },
          "NS"
        ),
      ]
      expect(getCupWinnerTeamId(fixtures)).toBeNull()
    })

    it("returns null for empty fixtures", () => {
      expect(getCupWinnerTeamId([])).toBeNull()
    })

    it("does not mutate the input fixtures order", () => {
      const fixtures = [
        makeFixture(
          2,
          "2022-12-18T15:00:00Z",
          { id: 26, name: "Argentina", winner: true },
          { id: 2, name: "France", winner: false },
          "PEN"
        ),
        makeFixture(
          1,
          "2022-12-17T15:00:00Z",
          { id: 7, name: "Croatia", winner: true },
          { id: 31, name: "Morocco", winner: false },
          "FT"
        ),
      ]
      getCupWinnerTeamId(fixtures)
      expect(fixtures[0].fixture.id).toBe(2)
    })
  })

  describe("getLeagueWinnerFromStandings", () => {
    it("returns the rank 1 team of the first group", () => {
      const standings: Standing[][] = [
        [
          makeStanding(2, 40, "Marseille"),
          makeStanding(1, 85, "PSG"),
          makeStanding(3, 80, "Lyon"),
        ],
      ]
      expect(getLeagueWinnerFromStandings(standings)).toBe(85)
    })

    it("returns null for empty standings", () => {
      expect(getLeagueWinnerFromStandings([])).toBeNull()
    })

    it("returns null when no rank 1 entry exists", () => {
      const standings: Standing[][] = [[makeStanding(2, 40, "Marseille")]]
      expect(getLeagueWinnerFromStandings(standings)).toBeNull()
    })
  })

  describe("resolveChampionTeamId", () => {
    it("returns null while the season is in progress and does not fetch standings", async () => {
      const { fetchStandings } = await import("../data")
      const fixtures = [
        makeFixture(1, "2026-06-11T19:00:00Z", { id: 1, name: "A" }, { id: 2, name: "B" }, "NS"),
      ]

      const result = await resolveChampionTeamId({
        leagueType: "League",
        leagueId: "61",
        year: 2026,
        fixtures,
      })

      expect(result).toBeNull()
      expect(fetchStandings).not.toHaveBeenCalled()
    })

    it("resolves a cup winner from the final fixture without fetching standings", async () => {
      const { fetchStandings } = await import("../data")
      const fixtures = [
        makeFixture(
          1,
          "2022-12-18T15:00:00Z",
          { id: 26, name: "Argentina", winner: true },
          { id: 2, name: "France", winner: false },
          "PEN"
        ),
      ]

      const result = await resolveChampionTeamId({
        leagueType: "Cup",
        leagueId: "1",
        year: 2022,
        fixtures,
      })

      expect(result).toBe(26)
      expect(fetchStandings).not.toHaveBeenCalled()
    })

    it("resolves a league winner from standings when the season is finished", async () => {
      const { fetchStandings } = await import("../data")
      vi.mocked(fetchStandings).mockResolvedValue({
        standings: [[makeStanding(1, 85, "PSG"), makeStanding(2, 40, "Marseille")]],
      } as any)

      const fixtures = [
        makeFixture(1, "2026-05-20T19:00:00Z", { id: 85, name: "PSG" }, { id: 40, name: "Marseille" }, "FT"),
      ]

      const result = await resolveChampionTeamId({
        leagueType: "League",
        leagueId: "61",
        year: 2025,
        fixtures,
      })

      expect(result).toBe(85)
      expect(fetchStandings).toHaveBeenCalledWith({ leagueId: "61", year: 2025 })
    })

    it("returns null when standings are unavailable", async () => {
      const { fetchStandings } = await import("../data")
      vi.mocked(fetchStandings).mockResolvedValue([] as any)

      const fixtures = [
        makeFixture(1, "2026-05-20T19:00:00Z", { id: 85, name: "PSG" }, { id: 40, name: "Marseille" }, "FT"),
      ]

      const result = await resolveChampionTeamId({
        leagueType: "League",
        leagueId: "61",
        year: 2025,
        fixtures,
      })

      expect(result).toBeNull()
    })

    it("returns null for empty fixtures", async () => {
      const result = await resolveChampionTeamId({
        leagueType: "Cup",
        leagueId: "1",
        year: 2022,
        fixtures: [],
      })
      expect(result).toBeNull()
    })
  })
})
