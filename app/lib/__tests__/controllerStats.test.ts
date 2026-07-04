import { describe, it, expect, vi, beforeEach } from "vitest"
import { getData } from "../controllerStats"
import { SCORING_TIER_IDS } from "../scoresCalcFactory"
import type { Bolao, UserBolao, Bet, FixtureData, PlayersData } from "../definitions"

vi.mock("@/app/lib/data", () => ({
  fetchBolao: vi.fn(),
  fetchUsersBolao: vi.fn(),
  fetchFixtures: vi.fn(),
  fetchUsersBets: vi.fn(),
  fetchChampionPicks: vi.fn(),
  fetchLeague: vi.fn(),
  fetchRounds: vi.fn(),
}))

vi.mock("../players", () => ({
  getPlayersFromUsersBolao: vi.fn(),
}))

vi.mock("../championPick", () => ({
  resolveChampionTeamId: vi.fn(),
}))

describe("controllerStats", () => {
  const mockBolao: Bolao = {
    id: "bolao-1",
    name: "Test Bolao",
    competition_id: "2",
    created_by: "user-1",
    created_at: new Date("2024-01-01"),
    year: 2024,
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
      periods: { first: 45, second: 90 },
      venue: { id: 1, name: "Stadium", city: "City" },
      status: { long: "Match Finished", short: "FT", elapsed: 90 },
    },
    league: {
      id: 2,
      name: "World Cup",
      country: "World",
      logo: "logo.png",
      flag: "flag.png",
      season: 2024,
      round: "Group Stage - 1",
    },
    teams: {
      home: { id: 1, name: "Team A", logo: "a.png", winner: null },
      away: { id: 2, name: "Team B", logo: "b.png", winner: null },
    },
    goals: { home: 2, away: 1 },
    score: {
      halftime: { home: 1, away: 0 },
      fulltime: { home: 2, away: 1 },
      extratime: { home: null, away: null },
      penalty: { home: null, away: null },
    },
  }

  const mockPlayers: PlayersData[] = [
    {
      id: "user-1",
      username: "alice",
      email: "alice@example.com",
      userBolaoId: "ub-1",
    },
    {
      id: "user-2",
      username: "bob",
      email: "bob@example.com",
      userBolaoId: "ub-2",
    },
  ]

  const mockBets: Bet[] = [
    {
      id: "b1",
      user_bolao_id: "ub-1",
      fixture_id: "1",
      value: 2,
      type: "home",
    },
    {
      id: "b2",
      user_bolao_id: "ub-1",
      fixture_id: "1",
      value: 1,
      type: "away",
    },
    {
      id: "b3",
      user_bolao_id: "ub-2",
      fixture_id: "1",
      value: 0,
      type: "home",
    },
    {
      id: "b4",
      user_bolao_id: "ub-2",
      fixture_id: "1",
      value: 0,
      type: "away",
    },
  ]

  beforeEach(async () => {
    vi.clearAllMocks()

    const data = await import("@/app/lib/data")
    const { getPlayersFromUsersBolao } = await import("../players")
    const { resolveChampionTeamId } = await import("../championPick")

    vi.mocked(data.fetchBolao).mockResolvedValue(mockBolao)
    vi.mocked(data.fetchUsersBolao).mockResolvedValue(mockUsersBolao as never)
    vi.mocked(data.fetchFixtures).mockResolvedValue([mockFixture])
    vi.mocked(data.fetchUsersBets).mockResolvedValue(mockBets)
    vi.mocked(data.fetchChampionPicks).mockResolvedValue([])
    vi.mocked(data.fetchLeague).mockResolvedValue({
      league: { id: 2, name: "World Cup", type: "Cup" },
    } as never)
    vi.mocked(data.fetchRounds).mockResolvedValue(["Group Stage - 1"])
    vi.mocked(getPlayersFromUsersBolao).mockResolvedValue(mockPlayers)
    vi.mocked(resolveChampionTeamId).mockResolvedValue(null)
  })

  it("returns stats view model for the current member", async () => {
    const result = await getData({
      bolaoId: "bolao-1",
      userId: "user-1",
      seasonEndLabel: "Season end",
    })

    expect(result.bolao).toEqual(mockBolao)
    expect(result.fixtures).toHaveLength(1)
    expect(result.stats.hasFinishedRound).toBe(true)
    expect(result.stats.positionSnapshots).toHaveLength(1)
    expect(result.stats.tierBreakdown).toEqual(
      SCORING_TIER_IDS.map((tier) =>
        tier === "exact"
          ? { tier, points: 200, percentage: 100 }
          : { tier, points: 0, percentage: 0 }
      )
    )
    expect(result.stats.zeroPointsBreakdown).toEqual({
      points: 0,
      percentage: 0,
    })
    expect(result.stats.tierComparison).toEqual([
      {
        tier: "exact",
        youPoints: 200,
        youPercentage: 100,
        groupAveragePercentage: 50,
      },
    ])
  })

  it("omits tier breakdown when the user is not a bolao member", async () => {
    const result = await getData({
      bolaoId: "bolao-1",
      userId: "outsider",
      seasonEndLabel: "Season end",
    })

    expect(result.stats.hasFinishedRound).toBe(true)
    expect(result.stats.tierBreakdown).toBeNull()
    expect(result.stats.zeroPointsBreakdown).toBeNull()
    expect(result.stats.tierComparison).toBeNull()
  })

  it("cleans rounds before building snapshots", async () => {
    const data = await import("@/app/lib/data")
    vi.mocked(data.fetchRounds).mockResolvedValue([
      "Preliminary Round",
      "Group Stage - 1",
    ])

    const result = await getData({
      bolaoId: "bolao-1",
      userId: "user-1",
      seasonEndLabel: "Season end",
    })

    expect(result.stats.positionSnapshots[0].label).toBe("Group Stage - 1")
  })
})
