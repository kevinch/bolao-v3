import { Season } from "./definitions"

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

export const getCurrentSeason = (seasons: Season[]): number | undefined => {
  const year: number | undefined = seasons.find(
    (el: Season) => el.current
  )?.year

  return year
}
