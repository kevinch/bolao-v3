import { FixtureData, Standing } from "./definitions"
import { fetchStandings } from "./data"
import {
  sortFixtures,
  STATUSES_OPEN_TO_PLAY,
  STATUSES_IN_PLAY,
} from "./utils"

export function isSeasonFinished(fixtures: FixtureData[]): boolean {
  if (fixtures.length === 0) return false

  return fixtures.every(
    (fixture) =>
      !STATUSES_OPEN_TO_PLAY.includes(fixture.fixture.status.short) &&
      !STATUSES_IN_PLAY.includes(fixture.fixture.status.short)
  )
}

// Cup-style competitions (World Cup, Champions League...) are decided by the
// chronologically last fixture: the API flags its winner even after penalties.
export function getCupWinnerTeamId(fixtures: FixtureData[]): number | null {
  if (fixtures.length === 0) return null

  const sorted = sortFixtures([...fixtures])
  const finalFixture = sorted[sorted.length - 1]

  if (finalFixture.teams.home.winner === true) return finalFixture.teams.home.id
  if (finalFixture.teams.away.winner === true) return finalFixture.teams.away.id

  return null
}

export function getLeagueWinnerFromStandings(
  standings: Standing[][]
): number | null {
  const firstGroup = standings[0]
  if (!firstGroup) return null

  const leader = firstGroup.find((standing) => standing.rank === 1)
  return leader?.team.id ?? null
}

export async function resolveChampionTeamId({
  leagueType,
  leagueId,
  year,
  fixtures,
}: {
  leagueType: string | undefined
  leagueId: string
  year: number
  fixtures: FixtureData[]
}): Promise<number | null> {
  if (!isSeasonFinished(fixtures)) return null

  if (leagueType === "Cup") {
    return getCupWinnerTeamId(fixtures)
  }

  // Points-based leagues (Premier League, Ligue 1...): rank 1 of the final standings.
  const standingsLeague = await fetchStandings({ leagueId, year })
  const standings: Standing[][] | undefined = standingsLeague?.standings

  if (!Array.isArray(standings)) return null

  return getLeagueWinnerFromStandings(standings)
}
