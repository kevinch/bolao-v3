import { Season, FixtureData, Bet, ChampionTeam } from "./definitions"
import { format } from "date-fns"
import { enUS, ptBR } from "date-fns/locale"

const dateFnsLocales: Record<string, typeof enUS> = {
  en: enUS,
  "pt-br": ptBR,
}

export const FOOTBALL_API_SPORTS = "https://v3.football.api-sports.io"

export const FOOTBALL_API_SPORTS_LEAGUES = [
  {
    name: "UEFA Champions League",
    countryName: "World",
    id: 2,
  },
  {
    name: "UEFA Europa League",
    countryName: "World",
    id: 3,
  },
  { name: "UEFA Europa Conference League", countryName: "World", id: 848 },
  {
    name: "Euro Championship",
    countryName: "World",
    id: 4,
  },
  {
    name: "Ligue 1",
    countryName: "France",
    id: 61,
  },
  {
    name: "Coupe de France",
    countryName: "France",
    id: 66,
  },
  {
    name: "Serie A",
    countryName: "Brazil",
    id: 71,
  },
  {
    name: "Serie B",
    countryName: "Brazil",
    id: 72,
  },
  {
    name: "Serie C",
    countryName: "Brazil",
    id: 75,
  },
  {
    name: "Premier League",
    countryName: "England",
    id: 39,
  },
  {
    name: "Primeira Liga",
    countryName: "Portugal",
    id: 94,
  },
  {
    name: "La Liga",
    countryName: "Spain",
    id: 140,
  },
  {
    name: "Copa do Brasil",
    countryName: "Brazil",
    id: 73,
  },
  {
    name: "Copa America",
    countryName: "World",
    id: 9,
  },
  {
    name: "CONMEBOL Libertadores",
    countryName: "World",
    id: 13,
  },
  { name: "FIFA Club World Cup", countryName: "World", id: 15 },
  { name: "World Cup", countryName: "World", id: 1 },
]

export const getCurrentSeasonObject = (
  seasons: Season[]
): Season | undefined => {
  return seasons.find((el: Season) => el.current)
}

function getFixtureTimestamp(fixture: FixtureData["fixture"]): number {
  if (fixture.timestamp) return fixture.timestamp
  return Math.floor(new Date(fixture.date).getTime() / 1000)
}

export function getChampionPickLockDate(fixtures: FixtureData[]): Date | null {
  if (fixtures.length === 0) return null
  const sorted = sortFixtures([...fixtures])
  return new Date(getFixtureTimestamp(sorted[0].fixture) * 1000)
}

export function isChampionPickLocked(fixtures: FixtureData[]): boolean {
  const lockDate = getChampionPickLockDate(fixtures)
  if (!lockDate) return false
  return Date.now() >= lockDate.getTime()
}

export function getTeamsFromFixtures(fixtures: FixtureData[]): ChampionTeam[] {
  const byId = new Map<number, ChampionTeam>()
  for (const fixture of fixtures) {
    for (const team of [fixture.teams.home, fixture.teams.away]) {
      if (!byId.has(team.id)) {
        byId.set(team.id, { id: team.id, name: team.name, logo: team.logo })
      }
    }
  }
  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name))
}

export const sortFixtures = (fixtures: FixtureData[]) => {
  return fixtures.sort((a, b) => {
    const dateA = getFixtureTimestamp(a.fixture)
    const dateB = getFixtureTimestamp(b.fixture)
    if (dateA < dateB) return -1
    if (dateA > dateB) return 1
    return 0
  })
}

export const formatDateFixtures = (
  timestamp: number,
  locale: string = "en"
): string => {
  const date = new Date(timestamp * 1000)
  const dateFnsLocale = dateFnsLocales[locale] || enUS
  return format(date, "LLL do H:mm", { locale: dateFnsLocale })
}

export const formatDateNews = (dateString: string) => {
  const date = new Date(dateString)
  return format(date, "PPP", {})
}

const ROUNDS_TO_REMOVE: RegExp[] = [
  /^Preliminary Round$/,
  /^Play-offs$/,
  /^\d+(?:st|nd|rd|th) Qualifying Round$/,
  /^Qualification Round \d+$/,
  // API uses singular + suffixes, e.g. "Relegation round - quarter-finals"
  /^Relegation round/i,
]

export const cleanRounds = (rounds: string[]): string[] => {
  return rounds.filter(
    (round) => !ROUNDS_TO_REMOVE.some((pattern) => pattern.test(round))
  )
}

/**
 * `fixtures/rounds?current=true` can return labels we strip from the season list (e.g. relegation).
 * Choose the first or last label still allowed after {@link cleanRounds}, else the last cleaned round.
 * Returns `""` only when there are no cleaned season rounds (degenerate API data).
 */
export function pickCurrentRoundFromApiCurrent(
  apiCurrentLabels: string[],
  cleanedSeasonRounds: string[],
  strategy: "first" | "last"
): string {
  const allowed = cleanRounds(apiCurrentLabels)
  const fromApi =
    strategy === "first"
      ? allowed[0]
      : allowed.length > 0
        ? allowed[allowed.length - 1]
        : undefined
  return (
    fromApi ??
    cleanedSeasonRounds[cleanedSeasonRounds.length - 1] ??
    ""
  )
}

export const CHAMPION_PICK_BONUS_POINTS = 500

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

export const getEmailUsername = (email: string): string => {
  return email.split("@")[0]
}

// FIXTURES STATUSES
// api-football.com/documentation-v3#tag/Fixtures/operation/get-fixtures-rounds
export const STATUSES_OPEN_TO_PLAY = ["TBD", "NS", "PST", "AWD"]
export const STATUSES_IN_PLAY = ["1H", "HT", "2H", "ET", "BT", "LIVE"]
export const STATUSES_FINISHED = ["FT", "AET", "PEN", "CANC", ""]
export const STATUSES_ERROR = ["CANC", "PST", "ABD", "AWD"]

/** Scores used for bolão point calculation (live goals when in play, fulltime when finished). */
export function getFixtureResultScores(
  fixtureData: Pick<FixtureData, "goals" | "score">,
  statusShort: string
): { resultHome: number; resultAway: number } {
  if (STATUSES_FINISHED.includes(statusShort)) {
    return {
      resultHome: fixtureData.score.fulltime.home ?? 0,
      resultAway: fixtureData.score.fulltime.away ?? 0,
    }
  }

  if (STATUSES_IN_PLAY.includes(statusShort)) {
    return {
      resultHome:
        fixtureData.goals.home ??
        fixtureData.score.halftime.home ??
        fixtureData.score.fulltime.home ??
        0,
      resultAway:
        fixtureData.goals.away ??
        fixtureData.score.halftime.away ??
        fixtureData.score.fulltime.away ??
        0,
    }
  }

  return { resultHome: 0, resultAway: 0 }
}

export const STYLES_TABLE_SHADOW = "shadow-md bg-white p-0 mb-6"

// Session Storage key for the invite bug/fix
export const SESSION_STORAGE_INVITE_KEY = "bolaov3_invite_url"
