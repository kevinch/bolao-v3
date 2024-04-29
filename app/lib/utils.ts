// Data relative to api.football-data.org

export const FOOTBALL_DATA_API = "https://api.football-data.org/v4"

// Data relative to football.api-sports.io

export const FOOTBALL_API_SPORTS = "https://v3.football.api-sports.io"

export const FOOTBALL_API_SPORTS_LEAGUES = [
  {
    name: "UEFA Champions League",
    id: 2,
  },
  {
    name: "UEFA Europa League",
    id: 3,
  },
  {
    name: "Ligue 1",
    id: 61,
  },
  {
    name: "Euro Championship",
    id: 4,
  },
  {
    name: "Serie A",
    id: 71,
  },
]

interface Season {
  year: number
  start: string
  end: string
  current: boolean
  coveragge: {}
}

export const getCurrentSeason = (seasons: Season[]): number | undefined => {
  const year: number | undefined = seasons.find(
    (el: Season) => el.current
  )?.year

  return year
}
