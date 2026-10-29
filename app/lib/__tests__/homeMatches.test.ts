import { beforeEach, afterEach, describe, expect, it, vi } from "vitest"
import { missingPredictions, upcomingMatches, selectChampionships, selectBolaoPreviews, championshipStatus } from "../homeMatches"
import type { Bet, Bolao, FixtureData } from "../definitions"

export function fixture(id: number, hours = 1, status = "NS", round = "Regular Season - 1"): FixtureData {
  return {
    fixture: { id, timestamp: Date.now() / 1000 + hours * 3600, status: { short: status, long: "Not Started", elapsed: 0 } },
    league: { id: 71, season: 2026, round, name: "Serie A" },
    teams: { home: { name: "Flamengo", logo: "", id: 1 }, away: { name: "Botafogo", logo: "", id: 2 } },
  } as FixtureData
}
const rounds = ["Regular Season - 1", "Regular Season - 2"]
function bet(id: number, type: "home" | "away", value: number = 0): Bet {
  return { id: `${id}-${type}`, user_bolao_id: "member-1", fixture_id: String(id), value, type }
}

describe("homepage match selection", () => {
  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date("2026-10-28T12:00:00Z")) })
  afterEach(() => vi.useRealTimers())

  it("labels current seasons by their confirmed start date without guessing missing dates", () => {
    expect(championshipStatus("2026-10-29")).toBe("upcoming")
    expect(championshipStatus("2026-10-28")).toBe("inProgress")
    expect(championshipStatus("2026-01-01")).toBe("inProgress")
    expect(championshipStatus(undefined)).toBeUndefined()
    expect(championshipStatus("invalid")).toBeUndefined()
    expect(championshipStatus("2026-02-30")).toBeUndefined()
  })

  it("includes missing and either partial prediction, but treats 0–0 as complete", () => {
    const result = missingPredictions([fixture(1), fixture(2), fixture(3), fixture(4)], rounds,
      [bet(2, "home"), bet(3, "away", 2), bet(4, "home"), bet(4, "away")])
    expect(result.map((match) => [match.fixture.fixture.id, match.incomplete])).toEqual([
      [1, false], [2, true], [3, true],
    ])
  })

  it("does not count null or invalid score values as filled", () => {
    const invalid = [null, undefined, -1, NaN]
    for (const value of invalid) {
      expect(missingPredictions([fixture(1)], rounds,
        [{ ...bet(1, "home"), value: value as number }, bet(1, "away")])[0].incomplete).toBe(true)
    }
  })

  it("excludes exact kickoff, past, live, completed and canceled games", () => {
    const result = missingPredictions([
      fixture(1, 0), fixture(2, -1), fixture(3, 1, "1H"), fixture(4, 1, "FT"), fixture(5, 1, "CANC"), fixture(6, 1),
    ], rounds, [])
    expect(result.map((match) => match.fixture.fixture.id)).toEqual([6])
  })

  it("uses cleaned API round order for links and excludes inaccessible qualifiers", () => {
    const result = upcomingMatches([
      fixture(1, 3, "NS", "Regular Season - 2"),
      fixture(2, 1, "NS", "Preliminary Round"), fixture(3, 2),
    ], ["Preliminary Round", ...rounds])
    expect(result.map((match) => [match.fixture.fixture.id, match.roundIndex])).toEqual([[3, 1], [1, 2]])
  })

  it("selects three nearest championships and two matches, including later weeks", () => {
    const result = selectChampionships([20, 1, 30, 3].map((hours, index) => ({
      id: index, name: `League ${index}`, country: "World", season: 2026,
      matches: upcomingMatches([fixture(index, hours * 24), fixture(index + 10, hours * 24 + 1), fixture(index + 20, hours * 24 + 2)], rounds),
    })))
    expect(result.map((league) => league.id)).toEqual([1, 3, 0])
    expect(result.every((league) => league.matches.length === 2)).toBe(true)
  })

  it("keeps identical fixtures separate under their own bolão, with limits and nearest first", () => {
    const result = selectBolaoPreviews([4, 2, 1, 3].map((id) => ({
      bolao: { id: String(id), name: `Group ${id}` } as Bolao,
      state: "pending" as const,
      matches: missingPredictions([fixture(1, id), fixture(2, id + 1), fixture(3, id + 2)], rounds, []),
    })))
    expect(result.map((preview) => preview.bolao.id)).toEqual(["1", "2", "3"])
    expect(result.every((preview) => preview.matches.length === 2 && preview.matches[0].fixture.fixture.id === 1)).toBe(true)
  })
})
