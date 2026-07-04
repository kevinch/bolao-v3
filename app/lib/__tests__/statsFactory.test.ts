import { describe, it, expect } from "vitest"
import {
  buildPositionSnapshots,
  buildStatsViewModel,
  buildTierBreakdown,
  buildTierComparison,
  buildGroupAverageTierBreakdown,
  buildZeroPointsBreakdown,
  rankLeadTotals,
} from "../statsFactory"
import { classifyScoringTier, SCORING_TIER_IDS } from "../scoresCalcFactory"
import type { Bet, FixtureData, PlayersData } from "../definitions"

function createFinishedFixture({
  id,
  round,
  homeGoals,
  awayGoals,
}: {
  id: number
  round: string
  homeGoals: number
  awayGoals: number
}): FixtureData {
  return {
    fixture: {
      id,
      referee: null,
      timezone: "UTC",
      date: new Date("2024-01-15"),
      timestamp: 1705334400 + id,
      periods: { first: 45, second: 90 },
      venue: { id: 1, name: "Stadium", city: "City" },
      status: { long: "Match Finished", short: "FT", elapsed: 90 },
    },
    league: {
      id: 2,
      name: "League",
      country: "World",
      logo: "logo.png",
      flag: "flag.png",
      season: 2024,
      round,
    },
    teams: {
      home: { id: 1, name: "Team A", logo: "a.png", winner: null },
      away: { id: 2, name: "Team B", logo: "b.png", winner: null },
    },
    goals: { home: homeGoals, away: awayGoals },
    score: {
      halftime: { home: homeGoals, away: awayGoals },
      fulltime: { home: homeGoals, away: awayGoals },
      extratime: { home: null, away: null },
      penalty: { home: null, away: null },
    },
  }
}

const players: PlayersData[] = [
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

describe("statsFactory", () => {
  describe("rankLeadTotals", () => {
    it("assigns consecutive ranks matching the Lead tab tie behavior", () => {
      const totals = new Map([
        ["ub-1", 100],
        ["ub-2", 100],
      ])

      const ranks = rankLeadTotals(players, totals)

      expect(ranks).toEqual([
        { userBolaoId: "ub-1", name: "alice", total: 100, rank: 1 },
        { userBolaoId: "ub-2", name: "bob", total: 100, rank: 2 },
      ])
    })
  })

  describe("buildPositionSnapshots", () => {
    it("creates snapshots only for fully finished rounds in order", () => {
      const fixtures = [
        createFinishedFixture({
          id: 1,
          round: "Regular Season - 1",
          homeGoals: 2,
          awayGoals: 1,
        }),
        {
          ...createFinishedFixture({
            id: 2,
            round: "Regular Season - 2",
            homeGoals: 1,
            awayGoals: 0,
          }),
          fixture: {
            ...createFinishedFixture({
              id: 2,
              round: "Regular Season - 2",
              homeGoals: 1,
              awayGoals: 0,
            }).fixture,
            status: { long: "Not Started", short: "NS", elapsed: 0 },
          },
        },
      ]

      const bets: Bet[] = [
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

      const snapshots = buildPositionSnapshots({
        players,
        fixtures,
        bets,
        allRounds: ["Regular Season - 1", "Regular Season - 2"],
        seasonEndLabel: "Season end",
      })

      expect(snapshots).toHaveLength(1)
      expect(snapshots[0].label).toBe("Regular Season - 1")
      expect(snapshots[0].ranks[0]).toMatchObject({
        name: "alice",
        rank: 1,
      })
    })

    it("appends a season-end snapshot when the champion is known", () => {
      const fixtures = [
        createFinishedFixture({
          id: 1,
          round: "Final",
          homeGoals: 1,
          awayGoals: 0,
        }),
      ]

      const bets: Bet[] = [
        {
          id: "b1",
          user_bolao_id: "ub-1",
          fixture_id: "1",
          value: 1,
          type: "home",
        },
        {
          id: "b2",
          user_bolao_id: "ub-1",
          fixture_id: "1",
          value: 0,
          type: "away",
        },
      ]

      const snapshots = buildPositionSnapshots({
        players,
        fixtures,
        bets,
        allRounds: ["Final"],
        championPicks: [
          {
            id: "cp-1",
            user_bolao_id: "ub-1",
            team_id: 99,
            team_name: "Winner FC",
            team_logo: "w.png",
            created_at: "2024-01-01",
            updated_at: "2024-01-01",
          },
        ],
        leagueWinnerTeamId: 99,
        seasonEndLabel: "Season end",
      })

      expect(snapshots).toHaveLength(2)
      expect(snapshots[1]).toMatchObject({
        label: "Season end",
        isSeasonEnd: true,
      })
      expect(snapshots[1].ranks[0].total).toBe(700)
    })
  })

  describe("buildTierBreakdown", () => {
    it("groups earned points by scoring tier for one member", () => {
      const fixtures = [
        createFinishedFixture({
          id: 1,
          round: "Regular Season - 1",
          homeGoals: 2,
          awayGoals: 1,
        }),
      ]

      const bets: Bet[] = [
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
      ]

      const breakdown = buildTierBreakdown({
        fixtures,
        bets,
        userBolaoId: "ub-1",
      })

      expect(breakdown).toEqual([
        { tier: "exact", points: 200, percentage: 100 },
      ])
    })
  })

  describe("buildZeroPointsBreakdown", () => {
    it("returns the share of finished bets that scored no points", () => {
      const fixtures = [
        createFinishedFixture({
          id: 1,
          round: "Regular Season - 1",
          homeGoals: 2,
          awayGoals: 1,
        }),
        createFinishedFixture({
          id: 2,
          round: "Regular Season - 1",
          homeGoals: 2,
          awayGoals: 1,
        }),
      ]

      const bets: Bet[] = [
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
          user_bolao_id: "ub-1",
          fixture_id: "2",
          value: 0,
          type: "home",
        },
        {
          id: "b4",
          user_bolao_id: "ub-1",
          fixture_id: "2",
          value: 0,
          type: "away",
        },
      ]

      expect(
        buildZeroPointsBreakdown({
          fixtures,
          bets,
          userBolaoId: "ub-1",
        })
      ).toEqual({
        points: 0,
        percentage: 50,
      })
    })
  })

  describe("buildGroupAverageTierBreakdown", () => {
    it("averages tier percentages across all members", () => {
      const fixtures = [
        createFinishedFixture({
          id: 1,
          round: "Regular Season - 1",
          homeGoals: 2,
          awayGoals: 1,
        }),
        createFinishedFixture({
          id: 2,
          round: "Regular Season - 1",
          homeGoals: 2,
          awayGoals: 1,
        }),
      ]

      const bets: Bet[] = [
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
          fixture_id: "2",
          value: 4,
          type: "home",
        },
        {
          id: "b4",
          user_bolao_id: "ub-2",
          fixture_id: "2",
          value: 2,
          type: "away",
        },
      ]

      const average = buildGroupAverageTierBreakdown({
        players,
        fixtures,
        bets,
      })

      expect(average).toEqual(
        expect.arrayContaining([
          { tier: "exact", points: 0, percentage: 50 },
          { tier: "winnerOnly", points: 0, percentage: 50 },
        ])
      )
    })
  })

  describe("buildTierComparison", () => {
    it("returns you vs group average rows for each active tier", () => {
      const fixtures = [
        createFinishedFixture({
          id: 1,
          round: "Regular Season - 1",
          homeGoals: 2,
          awayGoals: 1,
        }),
        createFinishedFixture({
          id: 2,
          round: "Regular Season - 1",
          homeGoals: 2,
          awayGoals: 1,
        }),
      ]

      const bets: Bet[] = [
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
          fixture_id: "2",
          value: 4,
          type: "home",
        },
        {
          id: "b4",
          user_bolao_id: "ub-2",
          fixture_id: "2",
          value: 2,
          type: "away",
        },
      ]

      const comparison = buildTierComparison({
        players,
        fixtures,
        bets,
        currentUserBolaoId: "ub-1",
      })

      expect(comparison).toEqual([
        {
          tier: "exact",
          youPoints: 200,
          youPercentage: 100,
          groupAveragePercentage: 50,
        },
        {
          tier: "winnerOnly",
          youPoints: 0,
          youPercentage: 0,
          groupAveragePercentage: 50,
        },
      ])
    })

    it("returns empty when there is only one member", () => {
      const comparison = buildTierComparison({
        players: [players[0]],
        fixtures: [],
        bets: [],
        currentUserBolaoId: "ub-1",
      })

      expect(comparison).toEqual([])
    })
  })

  describe("buildStatsViewModel", () => {
    it("returns populated stats when a round is finished", () => {
      const fixtures = [
        createFinishedFixture({
          id: 1,
          round: "Group Stage - 1",
          homeGoals: 2,
          awayGoals: 1,
        }),
        createFinishedFixture({
          id: 2,
          round: "Group Stage - 1",
          homeGoals: 2,
          awayGoals: 1,
        }),
      ]

      const bets: Bet[] = [
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
          fixture_id: "2",
          value: 4,
          type: "home",
        },
        {
          id: "b4",
          user_bolao_id: "ub-2",
          fixture_id: "2",
          value: 2,
          type: "away",
        },
      ]

      const viewModel = buildStatsViewModel({
        players,
        fixtures,
        bets,
        allRounds: ["Group Stage - 1"],
        seasonEndLabel: "Season end",
        currentUserBolaoId: "ub-1",
      })

      expect(viewModel.hasFinishedRound).toBe(true)
      expect(viewModel.positionSnapshots).toHaveLength(1)
      expect(viewModel.tierBreakdown).toEqual(
        SCORING_TIER_IDS.map((tier) =>
          tier === "exact"
            ? { tier, points: 200, percentage: 100 }
            : { tier, points: 0, percentage: 0 }
        )
      )
      expect(viewModel.zeroPointsBreakdown).toEqual({
        points: 0,
        percentage: 0,
      })
      expect(viewModel.tierComparison).toEqual([
        {
          tier: "exact",
          youPoints: 200,
          youPercentage: 100,
          groupAveragePercentage: 50,
        },
        {
          tier: "winnerOnly",
          youPoints: 0,
          youPercentage: 0,
          groupAveragePercentage: 50,
        },
      ])
    })

    it("returns empty charts before any round finishes", () => {
      const fixtures = [
        {
          ...createFinishedFixture({
            id: 1,
            round: "Regular Season - 1",
            homeGoals: 1,
            awayGoals: 0,
          }),
          fixture: {
            ...createFinishedFixture({
              id: 1,
              round: "Regular Season - 1",
              homeGoals: 1,
              awayGoals: 0,
            }).fixture,
            status: { long: "Not Started", short: "NS", elapsed: 0 },
          },
        },
      ]

      const viewModel = buildStatsViewModel({
        players,
        fixtures,
        bets: [],
        allRounds: ["Regular Season - 1"],
        seasonEndLabel: "Season end",
        currentUserBolaoId: "ub-1",
      })

      expect(viewModel.hasFinishedRound).toBe(false)
      expect(viewModel.positionSnapshots).toEqual([])
      expect(viewModel.tierBreakdown).toBeNull()
      expect(viewModel.zeroPointsBreakdown).toBeNull()
      expect(viewModel.tierComparison).toBeNull()
    })
  })
})

describe("classifyScoringTier", () => {
  it("returns exact for a perfect score", () => {
    expect(
      classifyScoringTier({
        resultHome: 2,
        resultAway: 1,
        betHome: 2,
        betAway: 1,
      })
    ).toBe("exact")
  })
})
