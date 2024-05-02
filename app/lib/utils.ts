import { Season, Match } from "./definitions"

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
    name: "Euro Championship",
    id: 4,
  },
  {
    name: "Ligue 1",
    id: 61,
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

export const sortFixtures = (fixtures: Match[]) => {
  return fixtures.sort((a, b) => {
    const dateA = new Date(a.fixture.date).getTime()
    const dateB = new Date(b.fixture.date).getTime()
    if (dateA < dateB) return -1
    if (dateA > dateB) return 1
    return 0
  })
}

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)

  const formattedDate = date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })

  const formattedTime = date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  })

  return `${formattedDate} ${formattedTime}`
}

const stringsToRemove = [
  "Preliminary Round",
  "1st Qualifying Round",
  "2nd Qualifying Round",
  "3rd Qualifying Round",
  "Play-offs",
]

export const cleanRounds = (rounds: string[]): string[] => {
  const filteredRounds: string[] = rounds.filter(
    (round: string) => !stringsToRemove.includes(round)
  )

  return filteredRounds
}
