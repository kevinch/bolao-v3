"use server"

import { QueryResultRow } from "pg"
import { unstable_noStore as noStore } from "next/cache"
import { sql } from "@vercel/postgres"
import { FOOTBALL_API_SPORTS } from "./utils"
import { Bolao, Bet } from "./definitions"
import { FOOTBALL_API_SPORTS_LEAGUES } from "./utils"

export async function fetchBoloes() {
  noStore()

  try {
    const data = await sql`SELECT *
      FROM boloes
    `

    return data.rows as Bolao[]
  } catch (error) {
    console.error("Database Error:", error)
    throw new Error("Failed to fetch boloes.")
  }
}

export async function fetchBoloesByUserId(userId: string) {
  noStore()

  if (!userId) {
    throw new Error("Missing userid.")
  }

  try {
    const data =
      await sql`SELECT boloes.name, boloes.id, boloes.competition_id, boloes.start, boloes.end, boloes.year, boloes.created_by
      FROM boloes
      INNER JOIN user_bolao ON CAST(boloes.id AS VARCHAR) = user_bolao.bolao_id
      WHERE CAST(user_bolao.user_id AS VARCHAR) = ${userId}
    `

    return data.rows as Bolao[]
  } catch (error) {
    console.error("Database Error:", error)
    throw new Error("Failed to fetch boloes by user id.")
  }
}

export async function fetchBolao(bolaoId: string) {
  noStore()

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

export async function fetchUserBolao({
  bolaoId,
  userId,
}: {
  bolaoId: string
  userId: string
}) {
  noStore()

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
  noStore()

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
  noStore()

  return FOOTBALL_API_SPORTS_LEAGUES.sort((a, b) =>
    a.name.localeCompare(b.name)
  )
}

export async function fetchLeague(leagueId: number) {
  noStore()

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
  noStore()

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
  noStore()

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

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

  let url = `${FOOTBALL_API_SPORTS}/fixtures?league=${leagueId}&season=${year}&timezone=${timezone}`
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
  noStore()

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
  noStore()

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
  noStore()

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
    // This will activate the closest `error.js` Error Boundary
    throw new Error("Failed to fetch data")
  }

  const data = await res.json()

  // the shape of the data comes from the api's response
  return data.response[0].league
}
