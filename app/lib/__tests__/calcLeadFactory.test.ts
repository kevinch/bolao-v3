import { describe, it, expect, vi, beforeEach } from "vitest"
import { calcLead } from "../calcLeadFactory"
import type { Bet, FixtureData, PlayersData } from "../definitions"
import * as scoresCalcFactory from "../scoresCalcFactory"
import * as utils from "../utils"

// Mock dependencies
vi.mock("../scoresCalcFactory")
vi.mock("../utils", async () => {
  const actual = await vi.importActual<typeof utils>("../utils")
  return {
    ...actual,
    findBetObj: vi.fn(),
  }
})

describe("calcLead", () => {
  const mockCalcScore = vi.mocked(scoresCalcFactory.calcScore)
  const mockFindBetObj = vi.mocked(utils.findBetObj)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should return an empty array when no players are provided", () => {
    const players: PlayersData[] = []
    const fixtures: FixtureData[] = []
    const bets: Bet[] = []

    const result = calcLead({ players, fixtures, bets })

    expect(result).toEqual([])
  })

  it("should calculate lead with player email username", () => {
    const players: PlayersData[] = [
      {
        id: "user-1",
        username: null,
        email: "john@example.com",
        userBolaoId: "userbolao-1",
      },
    ]
    const fixtures: FixtureData[] = []
    const bets: Bet[] = []

    const result = calcLead({ players, fixtures, bets })

    expect(result).toEqual([
      {
        name: "john",
        total: 0,
      },
    ])
  })

  it("should use email username for player name", () => {
    const players: PlayersData[] = [
      {
        id: "user-1",
        username: null,
        email: "john.doe@example.com",
        userBolaoId: "userbolao-1",
      },
    ]
    const fixtures: FixtureData[] = []
    const bets: Bet[] = []

    const result = calcLead({ players, fixtures, bets })

    expect(result).toEqual([
      {
        name: "john.doe",
        total: 0,
      },
    ])
  })

  it("should prefer username over email when username is available", () => {
    const players: PlayersData[] = [
      {
        id: "user-1",
        username: "johndoe",
        email: "john@example.com",
        userBolaoId: "userbolao-1",
      },
      {
        id: "user-2",
        username: null,
        email: "jane@example.com",
        userBolaoId: "userbolao-2",
      },
    ]
    const fixtures: FixtureData[] = []
    const bets: Bet[] = []

    const result = calcLead({ players, fixtures, bets })

    expect(result).toEqual([
      {
        name: "johndoe",
        total: 0,
      },
      {
        name: "jane",
        total: 0,
      },
    ])
  })

  it("should calculate total points for a single player with one finished fixture", () => {
    const players: PlayersData[] = [
      {
        id: "user-1",
        username: null,
        email: "john@example.com",
        userBolaoId: "userbolao-1",
      },
    ]

    const fixtures: FixtureData[] = [
      {
        fixture: {
          id: 123,
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
      },
    ]

    const bets: Bet[] = [
      {
        id: "bet-1",
        user_bolao_id: "userbolao-1",
        fixture_id: "123",
        value: 2,
        type: "home",
      },
      {
        id: "bet-2",
        user_bolao_id: "userbolao-1",
        fixture_id: "123",
        value: 1,
        type: "away",
      },
    ]

    mockFindBetObj
      .mockReturnValueOnce(bets[0]) // home bet
      .mockReturnValueOnce(bets[1]) // away bet

    mockCalcScore.mockReturnValue(5)

    const result = calcLead({ players, fixtures, bets })

    expect(mockFindBetObj).toHaveBeenCalledTimes(2)
    expect(mockFindBetObj).toHaveBeenCalledWith({
      bets,
      fixtureId: "123",
      type: "home",
      userBolaoId: "userbolao-1",
    })
    expect(mockFindBetObj).toHaveBeenCalledWith({
      bets,
      fixtureId: "123",
      type: "away",
      userBolaoId: "userbolao-1",
    })

    expect(mockCalcScore).toHaveBeenCalledWith({
      resultHome: 2,
      resultAway: 1,
      betHome: 2,
      betAway: 1,
    })

    expect(result).toEqual([
      {
        name: "john",
        total: 5,
      },
    ])
  })

  it("should calculate totals for multiple players", () => {
    const players: PlayersData[] = [
      {
        id: "user-1",
        username: null,
        email: "john@example.com",
        userBolaoId: "userbolao-1",
      },
      {
        id: "user-2",
        username: null,
        email: "jane@example.com",
        userBolaoId: "userbolao-2",
      },
    ]

    const fixtures: FixtureData[] = [
      {
        fixture: {
          id: 123,
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
      },
    ]

    const bets: Bet[] = [
      {
        id: "bet-1",
        user_bolao_id: "userbolao-1",
        fixture_id: "123",
        value: 2,
        type: "home",
      },
      {
        id: "bet-2",
        user_bolao_id: "userbolao-1",
        fixture_id: "123",
        value: 1,
        type: "away",
      },
      {
        id: "bet-3",
        user_bolao_id: "userbolao-2",
        fixture_id: "123",
        value: 1,
        type: "home",
      },
      {
        id: "bet-4",
        user_bolao_id: "userbolao-2",
        fixture_id: "123",
        value: 2,
        type: "away",
      },
    ]

    // Mock findBetObj for John's bets
    mockFindBetObj
      .mockReturnValueOnce(bets[0]) // John home
      .mockReturnValueOnce(bets[1]) // John away
      .mockReturnValueOnce(bets[2]) // Jane home
      .mockReturnValueOnce(bets[3]) // Jane away

    // Mock calcScore for each player
    mockCalcScore
      .mockReturnValueOnce(5) // John's score
      .mockReturnValueOnce(3) // Jane's score

    const result = calcLead({ players, fixtures, bets })

    expect(result).toEqual([
      { name: "john", total: 5 },
      { name: "jane", total: 3 },
    ])
  })

  it("should only count finished fixtures", () => {
    const players: PlayersData[] = [
      {
        id: "user-1",
        username: null,

        email: "john@example.com",
        userBolaoId: "userbolao-1",
      },
    ]

    const fixtures: FixtureData[] = [
      {
        fixture: {
          id: 123,
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
      },
      {
        fixture: {
          id: 456,
          referee: null,
          timezone: "UTC",
          date: new Date("2024-01-16"),
          timestamp: 1705420800,
          periods: { first: 0, second: 0 },
          venue: { id: 2, name: "Stadium 2", city: "City 2" },
          status: { long: "Not Started", short: "NS", elapsed: 0 },
        },
        league: {
          id: 2,
          name: "Champions League",
          country: "World",
          logo: "logo.png",
          flag: "flag.png",
          season: 2024,
          round: "Group Stage - 1",
        },
        teams: {
          home: { id: 3, name: "Team C", logo: "c.png", winner: null },
          away: { id: 4, name: "Team D", logo: "d.png", winner: null },
        },
        goals: { home: null, away: null },
        score: {
          halftime: { home: null, away: null },
          fulltime: { home: null, away: null },
          extratime: { home: null, away: null },
          penalty: { home: null, away: null },
        },
      },
    ]

    const bets: Bet[] = [
      {
        id: "bet-1",
        user_bolao_id: "userbolao-1",
        fixture_id: "123",
        value: 2,
        type: "home",
      },
      {
        id: "bet-2",
        user_bolao_id: "userbolao-1",
        fixture_id: "123",
        value: 1,
        type: "away",
      },
    ]

    mockFindBetObj
      .mockReturnValueOnce(bets[0]) // home bet for fixture 123
      .mockReturnValueOnce(bets[1]) // away bet for fixture 123

    mockCalcScore.mockReturnValue(5)

    const result = calcLead({ players, fixtures, bets })

    // Should only call findBetObj for the finished fixture
    expect(mockFindBetObj).toHaveBeenCalledTimes(2)
    expect(mockCalcScore).toHaveBeenCalledTimes(1)

    expect(result).toEqual([
      {
        name: "john",
        total: 5,
      },
    ])
  })

  it("should skip fixtures where home bet is missing", () => {
    const players: PlayersData[] = [
      {
        id: "user-1",
        username: null,

        email: "john@example.com",
        userBolaoId: "userbolao-1",
      },
    ]

    const fixtures: FixtureData[] = [
      {
        fixture: {
          id: 123,
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
      },
    ]

    const bets: Bet[] = []

    mockFindBetObj.mockReturnValue(null) // No bets found

    const result = calcLead({ players, fixtures, bets })

    expect(mockCalcScore).not.toHaveBeenCalled()
    expect(result).toEqual([
      {
        name: "john",
        total: 0,
      },
    ])
  })

  it("should skip fixtures where away bet is missing", () => {
    const players: PlayersData[] = [
      {
        id: "user-1",
        username: null,

        email: "john@example.com",
        userBolaoId: "userbolao-1",
      },
    ]

    const fixtures: FixtureData[] = [
      {
        fixture: {
          id: 123,
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
      },
    ]

    const homeBet: Bet = {
      id: "bet-1",
      user_bolao_id: "userbolao-1",
      fixture_id: "123",
      value: 2,
      type: "home",
    }

    mockFindBetObj
      .mockReturnValueOnce(homeBet) // home bet exists
      .mockReturnValueOnce(null) // away bet missing

    const result = calcLead({ players, fixtures, bets: [] })

    expect(mockCalcScore).not.toHaveBeenCalled()
    expect(result).toEqual([
      {
        name: "john",
        total: 0,
      },
    ])
  })

  it("should skip fixtures where home bet value is undefined", () => {
    const players: PlayersData[] = [
      {
        id: "user-1",
        username: null,

        email: "john@example.com",
        userBolaoId: "userbolao-1",
      },
    ]

    const fixtures: FixtureData[] = [
      {
        fixture: {
          id: 123,
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
      },
    ]

    const homeBet = {
      id: "bet-1",
      user_bolao_id: "userbolao-1",
      fixture_id: "123",
      value: undefined,
      type: "home" as const,
    }

    const awayBet: Bet = {
      id: "bet-2",
      user_bolao_id: "userbolao-1",
      fixture_id: "123",
      value: 1,
      type: "away",
    }

    mockFindBetObj
      .mockReturnValueOnce(homeBet as any)
      .mockReturnValueOnce(awayBet)

    const result = calcLead({ players, fixtures, bets: [] })

    expect(mockCalcScore).not.toHaveBeenCalled()
    expect(result).toEqual([
      {
        name: "john",
        total: 0,
      },
    ])
  })

  it("should skip fixtures where away bet value is undefined", () => {
    const players: PlayersData[] = [
      {
        id: "user-1",
        username: null,

        email: "john@example.com",
        userBolaoId: "userbolao-1",
      },
    ]

    const fixtures: FixtureData[] = [
      {
        fixture: {
          id: 123,
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
      },
    ]

    const homeBet: Bet = {
      id: "bet-1",
      user_bolao_id: "userbolao-1",
      fixture_id: "123",
      value: 2,
      type: "home",
    }

    const awayBet = {
      id: "bet-2",
      user_bolao_id: "userbolao-1",
      fixture_id: "123",
      value: undefined,
      type: "away" as const,
    }

    mockFindBetObj
      .mockReturnValueOnce(homeBet)
      .mockReturnValueOnce(awayBet as any)

    const result = calcLead({ players, fixtures, bets: [] })

    expect(mockCalcScore).not.toHaveBeenCalled()
    expect(result).toEqual([
      {
        name: "john",
        total: 0,
      },
    ])
  })

  it("should handle multiple fixtures and accumulate scores correctly", () => {
    const players: PlayersData[] = [
      {
        id: "user-1",
        username: null,

        email: "john@example.com",
        userBolaoId: "userbolao-1",
      },
    ]

    const fixtures: FixtureData[] = [
      {
        fixture: {
          id: 123,
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
      },
      {
        fixture: {
          id: 456,
          referee: null,
          timezone: "UTC",
          date: new Date("2024-01-16"),
          timestamp: 1705420800,
          periods: { first: 0, second: 0 },
          venue: { id: 2, name: "Stadium 2", city: "City 2" },
          status: { long: "Match Finished", short: "FT", elapsed: 90 },
        },
        league: {
          id: 2,
          name: "Champions League",
          country: "World",
          logo: "logo.png",
          flag: "flag.png",
          season: 2024,
          round: "Group Stage - 1",
        },
        teams: {
          home: { id: 3, name: "Team C", logo: "c.png", winner: null },
          away: { id: 4, name: "Team D", logo: "d.png", winner: null },
        },
        goals: { home: 3, away: 3 },
        score: {
          halftime: { home: 2, away: 1 },
          fulltime: { home: 3, away: 3 },
          extratime: { home: null, away: null },
          penalty: { home: null, away: null },
        },
      },
    ]

    const bets: Bet[] = [
      {
        id: "bet-1",
        user_bolao_id: "userbolao-1",
        fixture_id: "123",
        value: 2,
        type: "home",
      },
      {
        id: "bet-2",
        user_bolao_id: "userbolao-1",
        fixture_id: "123",
        value: 1,
        type: "away",
      },
      {
        id: "bet-3",
        user_bolao_id: "userbolao-1",
        fixture_id: "456",
        value: 3,
        type: "home",
      },
      {
        id: "bet-4",
        user_bolao_id: "userbolao-1",
        fixture_id: "456",
        value: 3,
        type: "away",
      },
    ]

    mockFindBetObj
      .mockReturnValueOnce(bets[0]) // fixture 123 home
      .mockReturnValueOnce(bets[1]) // fixture 123 away
      .mockReturnValueOnce(bets[2]) // fixture 456 home
      .mockReturnValueOnce(bets[3]) // fixture 456 away

    mockCalcScore
      .mockReturnValueOnce(5) // fixture 123 score
      .mockReturnValueOnce(10) // fixture 456 score

    const result = calcLead({ players, fixtures, bets })

    expect(mockCalcScore).toHaveBeenCalledTimes(2)
    expect(result).toEqual([
      {
        name: "john",
        total: 15, // 5 + 10
      },
    ])
  })

  it("should handle fixtures with different status codes (AET, PEN)", () => {
    const players: PlayersData[] = [
      {
        id: "user-1",
        username: null,

        email: "john@example.com",
        userBolaoId: "userbolao-1",
      },
    ]

    const fixtures: FixtureData[] = [
      {
        fixture: {
          id: 123,
          referee: null,
          timezone: "UTC",
          date: new Date("2024-01-15"),
          timestamp: 1705334400,
          periods: { first: 0, second: 0 },
          venue: { id: 1, name: "Stadium", city: "City" },
          status: { long: "After Extra Time", short: "AET", elapsed: 120 },
        },
        league: {
          id: 2,
          name: "Champions League",
          country: "World",
          logo: "logo.png",
          flag: "flag.png",
          season: 2024,
          round: "Final",
        },
        teams: {
          home: { id: 1, name: "Team A", logo: "a.png", winner: null },
          away: { id: 2, name: "Team B", logo: "b.png", winner: null },
        },
        goals: { home: 2, away: 2 },
        score: {
          halftime: { home: 1, away: 1 },
          fulltime: { home: 1, away: 1 },
          extratime: { home: 2, away: 2 },
          penalty: { home: null, away: null },
        },
      },
      {
        fixture: {
          id: 456,
          referee: null,
          timezone: "UTC",
          date: new Date("2024-01-16"),
          timestamp: 1705420800,
          periods: { first: 0, second: 0 },
          venue: { id: 2, name: "Stadium 2", city: "City 2" },
          status: { long: "After Penalty", short: "PEN", elapsed: 120 },
        },
        league: {
          id: 2,
          name: "Champions League",
          country: "World",
          logo: "logo.png",
          flag: "flag.png",
          season: 2024,
          round: "Final",
        },
        teams: {
          home: { id: 3, name: "Team C", logo: "c.png", winner: null },
          away: { id: 4, name: "Team D", logo: "d.png", winner: null },
        },
        goals: { home: 1, away: 1 },
        score: {
          halftime: { home: 0, away: 1 },
          fulltime: { home: 1, away: 1 },
          extratime: { home: 1, away: 1 },
          penalty: { home: 4, away: 3 },
        },
      },
    ]

    const bets: Bet[] = [
      {
        id: "bet-1",
        user_bolao_id: "userbolao-1",
        fixture_id: "123",
        value: 2,
        type: "home",
      },
      {
        id: "bet-2",
        user_bolao_id: "userbolao-1",
        fixture_id: "123",
        value: 2,
        type: "away",
      },
      {
        id: "bet-3",
        user_bolao_id: "userbolao-1",
        fixture_id: "456",
        value: 1,
        type: "home",
      },
      {
        id: "bet-4",
        user_bolao_id: "userbolao-1",
        fixture_id: "456",
        value: 1,
        type: "away",
      },
    ]

    mockFindBetObj
      .mockReturnValueOnce(bets[0])
      .mockReturnValueOnce(bets[1])
      .mockReturnValueOnce(bets[2])
      .mockReturnValueOnce(bets[3])

    mockCalcScore.mockReturnValueOnce(10).mockReturnValueOnce(10)

    const result = calcLead({ players, fixtures, bets })

    expect(result).toEqual([
      {
        name: "john",
        total: 20,
      },
    ])
  })

  it("should handle null fulltime scores by defaulting to 0", () => {
    const players: PlayersData[] = [
      {
        id: "user-1",
        username: null,

        email: "john@example.com",
        userBolaoId: "userbolao-1",
      },
    ]

    const fixtures: FixtureData[] = [
      {
        fixture: {
          id: 123,
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
          round: "Group Stage - 1",
        },
        teams: {
          home: { id: 1, name: "Team A", logo: "a.png", winner: null },
          away: { id: 2, name: "Team B", logo: "b.png", winner: null },
        },
        goals: { home: null, away: null },
        score: {
          halftime: { home: null, away: null },
          fulltime: { home: null, away: null },
          extratime: { home: null, away: null },
          penalty: { home: null, away: null },
        },
      },
    ]

    const bets: Bet[] = [
      {
        id: "bet-1",
        user_bolao_id: "userbolao-1",
        fixture_id: "123",
        value: 0,
        type: "home",
      },
      {
        id: "bet-2",
        user_bolao_id: "userbolao-1",
        fixture_id: "123",
        value: 0,
        type: "away",
      },
    ]

    mockFindBetObj.mockReturnValueOnce(bets[0]).mockReturnValueOnce(bets[1])

    mockCalcScore.mockReturnValue(10)

    const result = calcLead({ players, fixtures, bets })

    expect(mockCalcScore).toHaveBeenCalledWith({
      resultHome: 0,
      resultAway: 0,
      betHome: 0,
      betAway: 0,
    })

    expect(result).toEqual([
      {
        name: "john",
        total: 10,
      },
    ])
  })
})
