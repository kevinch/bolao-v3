import { fetchHomeCurrentSeason, fetchHomeFixtures, fetchHomeSeason } from "./homeFootball"
import { fetchHomeMemberships, fetchUsersBets } from "./data"
import { FOOTBALL_API_SPORTS_LEAGUES } from "./utils"
import {
  missingPredictions,
  upcomingMatches,
  selectChampionships,
  selectBolaoPreviews,
  type BolaoPreview,
  championshipStatus,
} from "./homeMatches"

export async function getChampionshipPreviews() {
  // Limit cold-cache bursts rather than requesting every championship at once.
  let next = 0
  const previews: Parameters<typeof selectChampionships>[0] = []
  let hasErrors = false
  await Promise.all(Array.from({ length: 3 }, async () => {
    while (next < FOOTBALL_API_SPORTS_LEAGUES.length) {
      const league = FOOTBALL_API_SPORTS_LEAGUES[next++]
      try {
        const season = await fetchHomeCurrentSeason(league.id)
        if (!season) continue
        const fixtures = await fetchHomeFixtures(String(league.id), season.year)
        // Public cards don't link to betting rounds, so no extra rounds request is needed.
        const rounds = [...new Set(fixtures.map((fixture) => fixture.league.round))]
        previews.push({
          id: league.id,
          name: league.name,
          country: league.countryName,
          season: season.year,
          status: championshipStatus(season.start),
          matches: upcomingMatches(fixtures, rounds),
        })
      } catch {
        hasErrors = true
      }
    }
  }))
  return {
    championships: selectChampionships(previews),
    hasErrors,
  }
}

export async function getPersonalPreviews(userId: string) {
  const memberships = await fetchHomeMemberships(userId)
  if (!memberships.length) return { hasBoloes: false, previews: [], notices: [] }

  // Request-local deduplication, including users with several bolões for one season.
  const seasons = new Map<string, ReturnType<typeof fetchHomeSeason>>()
  const results = await Promise.all(memberships.map(async (membership): Promise<BolaoPreview> => {
    const { user_bolao_id, ...bolao } = membership
    // Finished bolões cannot supply upcoming predictions; avoid historical API requests.
    const end = bolao.end ? new Date(bolao.end).getTime() : NaN
    if (Number.isFinite(end) && end < new Date().setUTCHours(0, 0, 0, 0)) {
      return { bolao, matches: [], state: "caughtUp" }
    }
    try {
      const key = `${bolao.competition_id}:${bolao.year}`
      let season = seasons.get(key)
      if (!season) {
        season = fetchHomeSeason(bolao.competition_id, bolao.year)
        seasons.set(key, season)
      }
      const [data, bets] = await Promise.all([
        season,
        fetchUsersBets([user_bolao_id]),
      ])
      const matches = missingPredictions(data.fixtures, data.rounds, bets)
      return {
        bolao,
        matches,
        state: matches.length ? "pending" :
          data.fixtures.length === 0 || data.rounds.length === 0 ? "awaitingData" : "caughtUp",
      }
    } catch {
      return { bolao, matches: [], state: "unavailable" }
    }
  }))

  return {
    hasBoloes: true,
    previews: selectBolaoPreviews(results),
    notices: results.filter((preview) =>
      preview.state === "awaitingData" || preview.state === "unavailable"
    ),
  }
}
