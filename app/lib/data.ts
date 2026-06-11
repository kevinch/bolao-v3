"use server"

import { QueryResultRow } from "pg"
import { sql } from "@vercel/postgres"
import { FOOTBALL_API_SPORTS } from "./utils"
import { Bolao, Bet, User, ChampionPick, BetPageContext } from "./definitions"
import { FOOTBALL_API_SPORTS_LEAGUES } from "./utils"

export async function fetchBoloes() {
  try {
    const data = await sql`SELECT *
      FROM boloes
      ORDER BY created_at DESC
    `

    return data.rows as Bolao[]
  } catch (error) {
    console.error("Database Error:", error)
    throw new Error("Failed to fetch boloes.")
  }
}

export async function fetchBoloesByUserId(userId: string) {
  if (!userId) {
    throw new Error("Missing userid.")
  }

  try {
    const data =
      await sql`SELECT boloes.name, boloes.id, boloes.competition_id, boloes.start, boloes.end, boloes.year, boloes.created_by
      FROM boloes
      INNER JOIN user_bolao ON CAST(boloes.id AS VARCHAR) = user_bolao.bolao_id
      WHERE CAST(user_bolao.user_id AS VARCHAR) = ${userId}
      ORDER BY boloes.year DESC, boloes.start DESC
    `

    return data.rows as Bolao[]
  } catch (error) {
    console.error("Database Error:", error)
    throw new Error("Failed to fetch boloes by user id.")
  }
}

export async function fetchBolao(bolaoId: string) {
  try {
    const data: { rows: QueryResultRow[] } = await sql`SELECT *
      FROM boloes
      WHERE CAST(id AS VARCHAR) = ${bolaoId}
    `

    const row = data.rows[0]

    if (!row) {
      throw new Error("No bolao found for the given ID.")
    }

    return {
      id: row.id as string,
      name: row.name as string,
      competition_id: row.competition_id as string,
      year: row.year as number,
      start: row.start,
      end: row.end,
      created_by: row.created_by,
      created_at: row.created_at,
    }
  } catch (error) {
    console.error("Database Error:", error)
    throw new Error("Failed to fetch bolao.")
  }
}

export async function fetchUsers() {
  try {
    const data = await sql`SELECT *
      FROM users
    `

    return data.rows as User[]
  } catch (error) {
    console.error("Database Error:", error)
    throw new Error("Failed to fetch users.")
  }
}

export async function fetchUserBolao({
  bolaoId,
  userId,
}: {
  bolaoId: string
  userId: string
}) {
  if (!userId || !bolaoId) {
    throw new Error("Missing userid or bolaoId")
  }

  try {
    const data: { rows: QueryResultRow[] } =
      await sql`SELECT id, bolao_id, user_id
      FROM user_bolao
      WHERE CAST(bolao_id AS VARCHAR) = ${bolaoId}
      AND CAST(user_id AS VARCHAR) = ${userId}
    `

    const result = data.rows[0]

    return result as { id: string; bolao_id: string; user_id: string }
  } catch (error) {
    console.error("Database Error:", error)
    throw new Error("Failed to fetch user bolões.")
  }
}

export async function fetchUsersBolao(bolaoId: string) {
  try {
    const data: { rows: QueryResultRow[] } = await sql`SELECT *
      FROM user_bolao
      WHERE CAST(bolao_id AS VARCHAR) = ${bolaoId}
    `

    const rows = data.rows

    if (!rows) {
      throw new Error("No user bolões found for the given ID.")
    }

    return rows as []
  } catch (error) {
    console.error("Database Error:", error)
    throw new Error("Failed to fetch user bolões.")
  }
}

export async function fetchLeagues() {
  return FOOTBALL_API_SPORTS_LEAGUES.sort((a, b) =>
    a.name.localeCompare(b.name)
  )
}

export async function fetchLeague(leagueId: number) {
  let token: string

  if (process.env.RAPID_API_KEY) {
    token = process.env.RAPID_API_KEY
  } else {
    throw new Error("RAPID_API_KEY environment variable is not set")
  }

  const myHeaders = new Headers()
  myHeaders.append("x-rapidapi-key", token)
  myHeaders.append("x-rapidapi-host", "v3.football.api-sports.io")

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
  }

  const url = `${FOOTBALL_API_SPORTS}/leagues?id=${leagueId}`

  const res = await fetch(url, requestOptions)

  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error("Failed to fetch data")
  }

  const data = await res.json()

  return data.response[0]
}

export async function fetchRounds({
  leagueId,
  year,
  current,
}: {
  leagueId: string
  year: number
  current?: boolean
}) {
  let token: string

  if (process.env.RAPID_API_KEY) {
    token = process.env.RAPID_API_KEY
  } else {
    throw new Error("RAPID_API_KEY environment variable is not set")
  }

  const myHeaders = new Headers()
  myHeaders.append("x-rapidapi-key", token)
  myHeaders.append("x-rapidapi-host", "v3.football.api-sports.io")

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
  }

  let url = `${FOOTBALL_API_SPORTS}/fixtures/rounds?league=${leagueId}&season=${year}`
  if (current) {
    url += "&current=true"
  }

  const res = await fetch(url, requestOptions)

  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error("Failed to fetch data")
  }

  const data = await res.json()

  return data.response
}

export async function fetchFixtures({
  leagueId,
  year,
  round,
}: {
  leagueId: string
  year: number
  round?: string
}) {
  let token: string

  if (process.env.RAPID_API_KEY) {
    token = process.env.RAPID_API_KEY
  } else {
    throw new Error("RAPID_API_KEY environment variable is not set")
  }

  const myHeaders = new Headers()
  myHeaders.append("x-rapidapi-key", token)
  myHeaders.append("x-rapidapi-host", "v3.football.api-sports.io")

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
  }

  let url = `${FOOTBALL_API_SPORTS}/fixtures?league=${leagueId}&season=${year}&timezone=UTC`
  if (round) {
    url += `&round=${round}`
  }

  const res = await fetch(url, requestOptions)

  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error("Failed to fetch data")
  }

  const data = await res.json()

  return data.response
}

export async function fetchUserBets(userBolaoId: string) {
  if (!userBolaoId) {
    throw new Error("Missing userBolaoId")
  }

  try {
    const data: { rows: QueryResultRow[] } = await sql`SELECT *
      FROM bets
      WHERE CAST(user_bolao_id AS VARCHAR) = ${userBolaoId}
    `

    const result = data.rows

    if (!result) {
      throw new Error("No bets found for the given user_bolao_id.")
    }

    return result as Bet[]
  } catch (error) {
    console.error("Database Error:", error)
    throw new Error("Failed to fetch bets.")
  }
}

export async function fetchUsersBets(userBoloesIds: string[]) {
  if (!userBoloesIds) {
    throw new Error("Missing userBoloesIds")
  }

  try {
    const data: { rows: QueryResultRow[] } = await sql`SELECT *
      FROM bets
      WHERE CAST(user_bolao_id AS VARCHAR) = ANY(${userBoloesIds as any})
    `

    const result = data.rows

    if (!result) {
      throw new Error("No bets found for the given user_bolao_id.")
    }

    return result as Bet[]
  } catch (error) {
    console.error("Database Error:", error)
    throw new Error("Failed to fetch bets.")
  }
}

export async function fetchStandings({
  leagueId,
  year,
}: {
  leagueId: string
  year: number
}) {
  let token: string

  if (process.env.RAPID_API_KEY) {
    token = process.env.RAPID_API_KEY
  } else {
    throw new Error("RAPID_API_KEY environment variable is not set")
  }

  const myHeaders = new Headers()
  myHeaders.append("x-rapidapi-key", token)
  myHeaders.append("x-rapidapi-host", "v3.football.api-sports.io")

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
  }

  const url = `${FOOTBALL_API_SPORTS}/standings?league=${leagueId}&season=${year}`

  const res = await fetch(url, requestOptions)

  if (!res.ok) {
    throw new Error("Failed to fetch data")
  }

  const data = await res.json()

  if (Array.isArray(data.response) && data.response.length > 0) {
    return data.response[0].league
  } else {
    return []
  }
}

export async function fetchBetPageContext({
  bolaoId,
  userId,
}: {
  bolaoId: string
  userId: string
}): Promise<BetPageContext | null> {
  if (!userId || !bolaoId) {
    throw new Error("Missing userid or bolaoId")
  }

  try {
    const data = await sql`
      SELECT
        b.id,
        b.name,
        b.competition_id,
        b.created_by,
        b.created_at,
        b.year,
        b.start,
        b.end,
        ub.id AS user_bolao_id,
        ub.bolao_id,
        ub.user_id,
        cp.id AS champion_pick_id,
        cp.team_id,
        cp.team_name,
        cp.team_logo,
        cp.created_at AS champion_pick_created_at,
        cp.updated_at AS champion_pick_updated_at
      FROM boloes b
      INNER JOIN user_bolao ub
        ON CAST(b.id AS VARCHAR) = CAST(ub.bolao_id AS VARCHAR)
      LEFT JOIN champion_picks cp
        ON CAST(cp.user_bolao_id AS VARCHAR) = CAST(ub.id AS VARCHAR)
      WHERE CAST(b.id AS VARCHAR) = ${bolaoId}
        AND CAST(ub.user_id AS VARCHAR) = ${userId}
    `

    const row = data.rows[0]
    if (!row) return null

    const championPick = row.champion_pick_id
      ? ({
          id: row.champion_pick_id as string,
          user_bolao_id: row.user_bolao_id as string,
          team_id: row.team_id as number,
          team_name: row.team_name as string,
          team_logo: row.team_logo as string,
          created_at: row.champion_pick_created_at as string,
          updated_at: row.champion_pick_updated_at as string,
        } satisfies ChampionPick)
      : null

    return {
      bolao: {
        id: row.id as string,
        name: row.name as string,
        competition_id: row.competition_id as string,
        created_by: row.created_by as string,
        created_at: row.created_at as Date,
        year: row.year as number,
        start: row.start as string | undefined,
        end: row.end as string | undefined,
      },
      userBolao: {
        id: row.user_bolao_id as string,
        bolao_id: row.bolao_id as string,
        user_id: row.user_id as string,
      },
      championPick,
    }
  } catch (error) {
    console.error("Database Error:", error)
    throw new Error("Failed to fetch bet page context.")
  }
}

export async function fetchChampionPick(
  userBolaoId: string
): Promise<ChampionPick | null> {
  if (!userBolaoId) return null

  try {
    const data = await sql`
      SELECT * FROM champion_picks
      WHERE CAST(user_bolao_id AS VARCHAR) = ${userBolaoId}
    `

    return (data.rows[0] as ChampionPick) ?? null
  } catch (error) {
    console.error("Database Error:", error)
    throw new Error("Failed to fetch champion pick.")
  }
}

export async function fetchChampionPicks(
  userBolaoIds: string[]
): Promise<ChampionPick[]> {
  if (!userBolaoIds.length) return []

  try {
    const data = await sql`
      SELECT * FROM champion_picks
      WHERE CAST(user_bolao_id AS VARCHAR) = ANY(${userBolaoIds as any})
    `

    return data.rows as ChampionPick[]
  } catch (error) {
    console.error("Database Error:", error)
    throw new Error("Failed to fetch champion picks.")
  }
}
