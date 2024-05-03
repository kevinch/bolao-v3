// TODO: update Match(es) to Fixture(s)

export type Competition = {
  name: string
  id: string
  area: {
    id: number
    name: string
    code: string
    flag: string
  }
  code: string
  type: string
  emblem?: string
  plan: string
  currentSeason: {
    id: number
    startDate: string
    endDate: string
    currentMatchDay: number
    winner?: string
    stages: []
  }
  numberOfAvailableSeasons?: number
  lastUpdated?: string
}

export type User = {
  name: string
  id: string
  role: string
}

export type Bolao = {
  id: string
  name: string
  competition_id: string
}

export type UserBolao = {
  id: string
  bolao_id: string
  user_id: string
}

type SuccessUserBolaoResult = {
  success: boolean
} & UserBolao

type ErrorResult = {
  success: boolean
  message: string
}

export type CreateUserBolaoResult = SuccessUserBolaoResult | ErrorResult

type Score = {
  home: number
  away: number
}

type Team = {
  id: number
  name: string
  logo: string
  winner: unknown
}

export type Match = {
  fixture: {
    id: number
    referee: unknown
    timezone: string
    date: Date
    timestamp: number
    periods: {
      first: number
      second: number
    }
    venue: {
      id: number
      name: string
      city: string
    }
    status: {
      long: string
      short: string
      elapsed: number
    }
  }
  league: {
    id: number
    name: string
    country: string
    logo: string
    flag: string
    season: number
    round: string
  }
  teams: {
    home: Team
    away: Team
  }
  goals: {
    home: number
    away: number
  }
  score: {
    halftime: Score
    fulltime: Score
    extratime: Score
    penalty: Score
  }
}

export type MatchesData = {
  filters: {
    season: string
    matchday?: string
  }
  resultSet: {
    count: number
    first: string
    last: string
    played: number
  }
  competition: {
    id: number
    name: string
    code: string
    type: string
    emblem: string
  }
  matches: Match[]
}

export type Season = {
  year: number
  start: string
  end: string
  current: boolean
  coveragge: {}
}

export type BetResult = SuccessBetResult | ErrorResult

type SuccessBetResult = {
  id: string
  user_bolao_id: string
  fixture_id: string
  value: number
  type: "away" | "home"
}

export type Bet = {
  id: string
  user_bolao_id: string
  fixture_id: string
  value: number
  type: "away" | "home"
}
