type LeagueSeason = {
  year: number
  current: boolean
  winner?: { id: number; name: string } | null
}

type LeagueResponse = {
  seasons: LeagueSeason[]
}

export function getLeagueWinnerTeamId(league: LeagueResponse): number | null {
  const currentSeason = league.seasons.find((season) => season.current)
  return currentSeason?.winner?.id ?? null
}
