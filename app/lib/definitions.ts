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

export type Team = {
  id: number
  name: string
  shortName?: string
  tla?: string
  crest?: string
  coach?: unknown
  leagueRank?: unknown
  formation?: string
  lineup: []
  bench: []
}

type Score = {
  home: number
  away: number
}

export type Match = {
  area: {}
  competition: {}
  season: {}
  id: number
  utcDate: string
  status: string
  minute?: number
  injuryTime?: unknown
  attendance?: unknown
  venue?: string
  matchday: number
  stage?: string
  group?: unknown
  lastUpdated?: string
  homeTeam: Team
  awayTeam: Team
  score: {
    winner: string
    duration: string
    fullTime: Score
    halfTime: Score
    regularTime: Score
    extraTime: Score
    penalties: Score
  }
  goals?: []
  penalties?: []
  bookings?: []
  substitutions?: []
  odds?: {}
  referees?: []
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
