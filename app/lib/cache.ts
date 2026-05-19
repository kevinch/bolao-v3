const MINUTE = 60
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

export const CACHE_REVALIDATE = {
  league: 7 * DAY,
  rounds: 12 * HOUR,
  fixtures: 5 * MINUTE,
  fixturesAll: HOUR,
  standings: 10 * MINUTE,
  bolao: HOUR,
  players: HOUR,
} as const

export const cacheTags = {
  bolao: (bolaoId: string) => `bolao:${bolaoId}`,
  players: (bolaoId: string) => `players:${bolaoId}`,
  league: (leagueId: string | number) => `league:${leagueId}`,
  rounds: ({
    leagueId,
    year,
    current = false,
  }: {
    leagueId: string | number
    year: number
    current?: boolean
  }) => `rounds:${leagueId}:${year}${current ? ":current" : ""}`,
  fixtures: ({
    leagueId,
    year,
    round,
  }: {
    leagueId: string | number
    year: number
    round?: string
  }) => `fixtures:${leagueId}:${year}:${round || "all"}`,
  standings: ({
    leagueId,
    year,
  }: {
    leagueId: string | number
    year: number
  }) => `standings:${leagueId}:${year}`,
} as const
