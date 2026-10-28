import { FOOTBALL_API_SPORTS_LEAGUES } from "./utils"

export const COMPETITION_INTENT_KEY = "bolao:competition-intent"
const MAX_AGE_MS = 60 * 60 * 1000

export function supportedCompetitionId(value: unknown): string | undefined {
  return typeof value === "string" &&
    FOOTBALL_API_SPORTS_LEAGUES.some((league) => String(league.id) === value)
    ? value : undefined
}

export function rememberCompetition(value: unknown) {
  const competitionId = supportedCompetitionId(value)
  if (!competitionId) return
  try {
    // Session storage survives auth redirects, without leaking intent into other tabs.
    sessionStorage.setItem(COMPETITION_INTENT_KEY, JSON.stringify({ competitionId, at: Date.now() }))
  } catch {
    // Signup remains usable when browser storage is disabled.
  }
}

export function clearCompetition() {
  try { sessionStorage.removeItem(COMPETITION_INTENT_KEY) } catch { /* Storage may be disabled. */ }
}

export function consumeCompetition(): string | undefined {
  try {
    const stored = sessionStorage.getItem(COMPETITION_INTENT_KEY)
    clearCompetition()
    if (!stored) return
    const intent = JSON.parse(stored)
    if (!intent || typeof intent.at !== "number" || intent.at > Date.now() || Date.now() - intent.at > MAX_AGE_MS) return
    return supportedCompetitionId(intent.competitionId)
  } catch {
    return undefined
  }
}
