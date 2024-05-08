import { Season, FixtureData, Bet } from "./definitions"

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

export const sortFixtures = (fixtures: FixtureData[]) => {
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

const ROUNDS_TO_REMOVE = [
  "Preliminary Round",
  "1st Qualifying Round",
  "2nd Qualifying Round",
  "3rd Qualifying Round",
  "Play-offs",
]

export const cleanRounds = (rounds: string[]): string[] => {
  const filteredRounds: string[] = rounds.filter(
    (round: string) => !ROUNDS_TO_REMOVE.includes(round)
  )

  return filteredRounds
}

export const INITIAL_BET_VALUE = "."

export const findBetObj = ({
  bets,
  fixtureId,
  type,
  userBolaoId,
}: {
  bets: Bet[]
  fixtureId: string
  type: "home" | "away"
  userBolaoId?: string
}): Bet | null => {
  const result = bets.find((bet: Bet) => {
    if (userBolaoId) {
      return (
        bet.type === type &&
        bet.fixture_id === fixtureId &&
        bet.user_bolao_id === userBolaoId
      )
    }

    return bet.type === type && bet.fixture_id === fixtureId
  })

  return result ?? null
}

export const isNil = (value: any) => value === null || value === undefined

// FIXTURES STATUSES
// api-football.com/documentation-v3#tag/Fixtures/operation/get-fixtures-rounds
export const STATUSES_OPEN_TO_PLAY = ["TBD", "NS", "PST", "AWD"]
export const STATUSES_IN_PLAY = ["1H", "HT", "2H", "ET", "BT", "LIVE"]
export const STATUSES_FINISHED = ["FT", "AET", "PEN", "CANC", ""]
export const STATUSES_ERROR = ["CANC", "PST", "ABD", "AWD"]

export const STYLES_BOX_SHADOW = "shadow bg-white p-4 mb-6"
