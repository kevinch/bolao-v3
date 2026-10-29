import { fetchHomeCurrentSeason, fetchHomeFixtures, fetchHomeSeason } from "./homeFootball"
import { fetchHomeMemberships, fetchUsersBets } from "./data"
import { FOOTBALL_API_SPORTS_LEAGUES, isFixtureOpenToBet } from "./utils"
import {
  missingPredictions,
  upcomingMatches,
  selectChampionships,
  selectBolaoPreviews,
  type BolaoPreview,
  championshipStatus,
} from "./homeMatches"

/** Keep schedule discovery bounded for both visitors and members with many bolões. */
async function mapWithConcurrency<T, R>(items: T[], mapper: (item: T) => Promise<R>): Promise<R[]> {
  let next = 0
  const results = new Array<R>(items.length)
  await Promise.all(Array.from({ length: Math.min(3, items.length) }, async () => {
    while (next < items.length) {
      const index = next++
      results[index] = await mapper(items[index])
    }
  }))
  return results
}

export async function getChampionshipPreviews() {
  let hasErrors = false
  const previews = await mapWithConcurrency(FOOTBALL_API_SPORTS_LEAGUES, async (league) => {
    try {
      const season = await fetchHomeCurrentSeason(league.id)
      if (!season) return null
      const fixtures = await fetchHomeFixtures(String(league.id), season.year)
      // Public cards don't link to betting rounds, so no extra rounds request is needed.
      const rounds = [...new Set(fixtures.map((fixture) => fixture.league.round))]
      return {
        id: league.id,
        name: league.name,
        country: league.countryName,
        season: season.year,
        status: championshipStatus(season.start),
        matches: upcomingMatches(fixtures, rounds),
      }
    } catch {
      hasErrors = true
      return null
    }
  })
  return {
    championships: selectChampionships(previews.flatMap((preview) => preview ? [preview] : [])),
    hasErrors,
  }
}

export async function getPersonalPreviews(userId: string) {
  const memberships = await fetchHomeMemberships(userId)
  if (!memberships.length) return { hasBoloes: false, previews: [], notices: [] }

  // Request-local deduplication, including users with several bolões for one season.
  const seasons = new Map<string, ReturnType<typeof fetchHomeSeason>>()
  const results = await mapWithConcurrency(memberships, async (membership): Promise<BolaoPreview> => {
    const { user_bolao_id, ...bolao } = membership
    // Dates saved at creation may cover only the fixtures published at the time.
    // Actual upcoming fixtures, rather than bolao.end, determine eligibility.
    try {
      const key = `${bolao.competition_id}:${bolao.year}`
      let season = seasons.get(key)
      if (!season) {
        season = fetchHomeSeason(bolao.competition_id, bolao.year)
        seasons.set(key, season)
      }
      const data = await season
      if (upcomingMatches(data.fixtures, data.rounds).length === 0) {
        return {
          bolao,
          matches: [],
          state: data.fixtures.length === 0 || (data.rounds.length === 0 && data.fixtures.some(isFixtureOpenToBet)) ? "awaitingData" : "caughtUp",
        }
      }
      const bets = await fetchUsersBets([user_bolao_id])
      const matches = missingPredictions(data.fixtures, data.rounds, bets)
      return {
        bolao,
        matches,
        state: matches.length ? "pending" : "caughtUp",
      }
    } catch {
      return { bolao, matches: [], state: "unavailable" }
    }
  })

  return {
    hasBoloes: true,
    previews: selectBolaoPreviews(results),
    notices: results.filter((preview) =>
      preview.state === "awaitingData" || preview.state === "unavailable"
    ),
  }
}
