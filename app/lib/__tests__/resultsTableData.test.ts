import { describe, it, expect } from "vitest"
import { buildResultsTableView } from "../resultsTableData"
import type { Bet, FixtureData, PlayersData } from "../definitions"

const mockPlayers: PlayersData[] = [
  {
    id: "player1",
    username: "johnny",
    email: "john@example.com",
    userBolaoId: "ub-1",
  },
  {
    id: "player2",
    username: null,
    email: "jane@example.com",
    userBolaoId: "ub-2",
  },
]

const createFixture = (statusShort: string): FixtureData =>
  ({
    fixture: {
      id: 12345,
      status: { short: statusShort, long: statusShort, elapsed: 0 },
      timestamp: 1705348800,
      date: new Date("2024-01-15T20:00:00Z"),
    },
    league: { round: "Group Stage - 1" },
    teams: {
      home: { id: 1, name: "Home", logo: "h.png" },
      away: { id: 2, name: "Away", logo: "a.png" },
    },
    goals: { home: 2, away: 1 },
    score: {
      halftime: { home: 1, away: 0 },
      fulltime: { home: 2, away: 1 },
      extratime: { home: null, away: null },
      penalty: { home: null, away: null },
    },
  }) as FixtureData

describe("buildResultsTableView", () => {
  it("does not expose emails or internal ids in the view model", () => {
    const view = buildResultsTableView({
      fixtures: [createFixture("NS")],
      bets: [],
      players: mockPlayers,
      currentUserId: "player1",
    })

    const serialized = JSON.stringify(view)
    expect(serialized).not.toContain("john@example.com")
    expect(serialized).not.toContain("jane@example.com")
    expect(serialized).not.toContain("ub-1")
    expect(serialized).not.toContain("ub-2")
    expect(serialized).not.toContain("player1")
    expect(serialized).not.toContain("player2")
  })

  it("uses username or email prefix for display names", () => {
    const view = buildResultsTableView({
      fixtures: [createFixture("FT")],
      bets: [],
      players: mockPlayers,
      currentUserId: "player1",
    })

    expect(view.players[0].displayName).toBe("johnny")
    expect(view.players[1].displayName).toBe("jane")
  })

  it("hides other players bets before kickoff", () => {
    const bets: Bet[] = [
      {
        id: "bet-1",
        user_bolao_id: "ub-1",
        fixture_id: "12345",
        value: 2,
        type: "home",
      },
      {
        id: "bet-2",
        user_bolao_id: "ub-1",
        fixture_id: "12345",
        value: 1,
        type: "away",
      },
      {
        id: "bet-3",
        user_bolao_id: "ub-2",
        fixture_id: "12345",
        value: 0,
        type: "home",
      },
      {
        id: "bet-4",
        user_bolao_id: "ub-2",
        fixture_id: "12345",
        value: 0,
        type: "away",
      },
    ]

    const view = buildResultsTableView({
      fixtures: [createFixture("NS")],
      bets,
      players: mockPlayers,
      currentUserId: "player1",
    })

    expect(view.rows[0].cells[0]).toEqual({
      home: "2",
      away: "1",
      points: null,
    })
    expect(view.rows[0].cells[1]).toEqual({
      home: ".",
      away: ".",
      points: null,
    })
  })

  it("shows all bets once the fixture is in play", () => {
    const bets: Bet[] = [
      {
        id: "bet-1",
        user_bolao_id: "ub-2",
        fixture_id: "12345",
        value: 1,
        type: "home",
      },
      {
        id: "bet-2",
        user_bolao_id: "ub-2",
        fixture_id: "12345",
        value: 0,
        type: "away",
      },
    ]

    const view = buildResultsTableView({
      fixtures: [createFixture("1H")],
      bets,
      players: mockPlayers,
      currentUserId: "player1",
    })

    expect(view.rows[0].cells[1].home).toBe("1")
    expect(view.rows[0].cells[1].away).toBe("0")
    expect(view.rows[0].cells[1].points).not.toBeNull()
  })
})
