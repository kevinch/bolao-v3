import type { Bet, Bolao, FixtureData } from "./definitions"
import { cleanRounds, isFixtureOpenToBet } from "./utils"

export type PreviewMatch = {
  fixture: FixtureData
  incomplete?: boolean
  roundIndex?: number
}

export type ChampionshipPreview = {
  id: number
  name: string
  country: string
  season: number
  status?: "upcoming" | "inProgress"
  matches: PreviewMatch[]
}

export type BolaoPreview = {
  bolao: Bolao
  matches: PreviewMatch[]
  state: "pending" | "caughtUp" | "awaitingData" | "unavailable"
}

export function championshipStatus(start: string | undefined, now = new Date()): ChampionshipPreview["status"] {
  if (!start || !/^\d{4}-\d{2}-\d{2}$/.test(start)) return undefined
  const date = new Date(`${start}T00:00:00Z`)
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== start) return undefined
  return start > now.toISOString().slice(0, 10) ? "upcoming" : "inProgress"
}

/** Only rounds reachable through the existing betting-page navigation. */
export function upcomingMatches(fixtures: FixtureData[], rounds: string[]) {
  const allowedRounds = cleanRounds(rounds)
  return fixtures
    .filter((fixture) =>
      isFixtureOpenToBet(fixture) &&
      allowedRounds.includes(fixture.league.round)
    )
    .sort((a, b) => a.fixture.timestamp - b.fixture.timestamp)
    .map((fixture) => ({
      fixture,
      roundIndex: allowedRounds.indexOf(fixture.league.round) + 1,
    }))
}

export function missingPredictions(
  fixtures: FixtureData[],
  rounds: string[],
  bets: Bet[]
): PreviewMatch[] {
  const scores = new Map<string, Set<string>>()
  for (const bet of bets) {
    // Zero is a prediction. Missing/null/invalid values are not.
    if (!Number.isInteger(bet.value) || bet.value < 0) continue
    const sides = scores.get(String(bet.fixture_id)) ?? new Set<string>()
    sides.add(bet.type)
    scores.set(String(bet.fixture_id), sides)
  }

  return upcomingMatches(fixtures, rounds).flatMap((match) => {
    const sides = scores.get(String(match.fixture.fixture.id))
    const home = sides?.has("home") ?? false
    const away = sides?.has("away") ?? false
    return home && away ? [] : [{ ...match, incomplete: home !== away }]
  })
}

export function selectChampionships(previews: ChampionshipPreview[]) {
  // Sorting by the next kickoff naturally prefers this week, then later fixtures.
  return previews
    .filter((preview) => preview.matches.length > 0)
    .sort((a, b) =>
      a.matches[0].fixture.fixture.timestamp - b.matches[0].fixture.fixture.timestamp ||
      a.id - b.id
    )
    .slice(0, 3)
    .map((preview) => ({ ...preview, matches: preview.matches.slice(0, 2) }))
}

export function selectBolaoPreviews(previews: BolaoPreview[]) {
  return previews
    .filter((preview) => preview.state === "pending")
    .sort((a, b) =>
      a.matches[0].fixture.fixture.timestamp - b.matches[0].fixture.fixture.timestamp ||
      a.bolao.name.localeCompare(b.bolao.name)
    )
    .slice(0, 3)
    .map((preview) => ({ ...preview, matches: preview.matches.slice(0, 2) }))
}
