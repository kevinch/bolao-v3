import { cache } from "react"
import { unstable_cache } from "next/cache"
import type { FixtureData, Season } from "./definitions"
import { FOOTBALL_API_SPORTS, isFixtureOpenToBet } from "./utils"

async function footballRequest(path: string): Promise<unknown[]> {
  const token = process.env.RAPID_API_KEY
  if (!token) throw new Error("Football data is not configured")

  const response = await fetch(`${FOOTBALL_API_SPORTS}/${path}`, {
    headers: {
      "x-rapidapi-key": token,
      "x-rapidapi-host": "v3.football.api-sports.io",
    },
    // Cache validated results below: the provider can return rate-limit errors with HTTP 200.
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
  })
  if (!response.ok) throw new Error("Football data is unavailable")
  const data = await response.json()
  if (
    (data.errors && Object.keys(data.errors).length > 0) ||
    !Array.isArray(data.response)
  ) {
    throw new Error("Invalid football data response")
  }
  return data.response
}

// This app has not enabled Cache Components; use its supported Data Cache API.
// Public football data only. Failed requests throw before they can enter the cache.
export const fetchHomeCurrentSeason = cache(unstable_cache(async (leagueId: number) => {
  const response = await footballRequest(`leagues?id=${leagueId}`)
  const league = response[0] as { seasons?: Season[] } | undefined
  if (!league) return null
  if (!Array.isArray(league.seasons)) throw new Error("Invalid championship data")
  return league.seasons.find((season) => season.current) ?? null
}, ["home-current-season-v2"], { revalidate: 3600 }))

export const fetchHomeFixtures = cache(unstable_cache(async (leagueId: string, year: number) => {
  const query = `league=${encodeURIComponent(leagueId)}&season=${year}`
  const fixtures = await footballRequest(`fixtures?${query}&timezone=UTC`)
  if (!fixtures.every((item) => {
    const match = item as FixtureData | null
    return match?.fixture && Number.isFinite(match.fixture.timestamp) &&
      match.fixture.status && typeof match.fixture.status.short === "string" &&
      match.league?.id === Number(leagueId) && match.league.season === year &&
      typeof match.league.round === "string" &&
      typeof match.teams?.home?.name === "string" &&
      typeof match.teams?.away?.name === "string"
  })) {
    throw new Error("Invalid fixture data")
  }
  return fixtures as FixtureData[]
}, ["home-fixtures-v2"], { revalidate: 300 }))

const fetchHomeRounds = cache(unstable_cache(async (leagueId: string, year: number) => {
  const rounds = await footballRequest(`fixtures/rounds?league=${encodeURIComponent(leagueId)}&season=${year}`)
  if (!rounds.every((round) => typeof round === "string")) throw new Error("Invalid round data")
  return rounds as string[]
}, ["home-rounds-v2"], { revalidate: 300 }))

export const fetchHomeSeason = cache(async (leagueId: string, year: number) => {
  const fixtures = await fetchHomeFixtures(leagueId, year)
  // Avoid round requests for seasons with no remaining open games.
  if (!fixtures.some(isFixtureOpenToBet)) return { fixtures, rounds: [] }
  const rounds = await fetchHomeRounds(leagueId, year)
  return { fixtures, rounds }
})
