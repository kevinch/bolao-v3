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
  created_by: string
  created_at: Date
  year: number
  start?: string
  end?: string
}

export type UserBolao = {
  id: string
  bolao_id: string
  user_id: string
}

type SuccessBolaoResult = {
  success: boolean
}

type SuccessCreateUserBolaoResult = {
  success: boolean
} & UserBolao

type ErrorResult = {
  success: boolean
  message: string
}

type SuccessCreateBolaoResult = {
  success: boolean
}

export type CreateBolaoResult = SuccessCreateBolaoResult | ErrorResult

export type CreateUserBolaoResult = SuccessCreateUserBolaoResult | ErrorResult

export type UpdateBolaoResult = SuccessBolaoResult | ErrorResult

type Score = {
  home: number | null
  away: number | null
}

type Team = {
  id: number
  name: string
  logo: string
  winner: unknown
}

export type ScoreGroup = {
  halftime: Score
  fulltime: Score
  extratime: Score
  penalty: Score
}

export type FixtureStatus = {
  long: string
  short: string
  elapsed: number
}

export type FixtureData = {
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
    status: FixtureStatus
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
    home: number | null
    away: number | null
  }
  score: ScoreGroup
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

export type StandingsLeague = {
  id: number
  name: string
  country: string
  logo: string
  flag: string
  season: number
  standings: Standings[]
}

type Standings = []

export type StandingsGroup = Standing[]

export type Standing = {
  rank: number
  team: {
    id: number
    name: string
    logo: string
  }
  points: number
  goalsDiff: number
  group: string
  form: string
  status: string
  description: string
  all: StandingGames
  home: StandingGames
  away: StandingGames
  update: string
}

type StandingGames = {
  played: number
  win: number
  draw: number
  lose: number
  goals: {
    for: number
    against: number
  }
}

export type PlayersData = {
  id: string
  email: string
  userBolaoId: string
}

export type ScoreArgs = {
  resultHome: number
  betHome: number
  resultAway: number
  betAway: number
}

export type LeadData = {
  name: string
  total: number
}

export type League = {
  id: number
  name: string
  countryName: string
}
