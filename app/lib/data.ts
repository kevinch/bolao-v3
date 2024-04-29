"use server"

import { QueryResultRow } from "pg"
import { unstable_noStore as noStore } from "next/cache"
import { sql } from "@vercel/postgres"
import { FOOTBALL_DATA_API, FOOTBALL_API_SPORTS } from "./utils"
import { Bolao } from "./definitions"
import { FOOTBALL_API_SPORTS_LEAGUES } from "./utils"

export async function fetchBoloes(userId: string) {
  noStore()

  if (!userId) {
    throw new Error("Missing userid.")
  }

  try {
    const data = await sql`SELECT boloes.name, boloes.id, boloes.competition_id
      FROM boloes
      INNER JOIN user_bolao ON CAST(boloes.id AS VARCHAR) = user_bolao.bolao_id
      WHERE CAST(user_bolao.user_id AS VARCHAR) = ${userId}
    `

    return data.rows as Bolao[]
  } catch (error) {
    console.error("Database Error:", error)
    throw new Error("Failed to fetch boloes.")
  }
}

export async function fetchBolao(bolaoId: string) {
  try {
    const data: { rows: QueryResultRow[] } =
      await sql`SELECT name, id, competition_id, year
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
    }
  } catch (error) {
    console.error("Database Error:", error)
    throw new Error("Failed to fetch boloes.")
  }
}

export async function fetchUserBoloes(bolaoId: string) {
  try {
    const data: { rows: QueryResultRow[] } = await sql`SELECT user_id
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

export async function getLeagues() {
  return FOOTBALL_API_SPORTS_LEAGUES
}

export async function getLeague(leagueId: number) {
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

export async function getRounds({
  leagueId,
  season,
  current,
}: {
  leagueId: string
  season: number
  current?: boolean
}) {
  if (current) {
    return ["Regular Season - 32"]
  }
  return [
    "Regular Season - 1",
    "Regular Season - 2",
    "Regular Season - 3",
    "Regular Season - 4",
    "Regular Season - 5",
    "Regular Season - 6",
    "Regular Season - 7",
    "Regular Season - 8",
    "Regular Season - 9",
    "Regular Season - 10",
    "Regular Season - 11",
    "Regular Season - 12",
    "Regular Season - 13",
    "Regular Season - 14",
    "Regular Season - 15",
    "Regular Season - 16",
    "Regular Season - 17",
    "Regular Season - 18",
    "Regular Season - 19",
    "Regular Season - 20",
    "Regular Season - 21",
    "Regular Season - 22",
    "Regular Season - 23",
    "Regular Season - 24",
    "Regular Season - 25",
    "Regular Season - 26",
    "Regular Season - 27",
    "Regular Season - 28",
    "Regular Season - 29",
    "Regular Season - 30",
    "Regular Season - 31",
    "Regular Season - 32",
    "Regular Season - 33",
    "Regular Season - 34",
  ]

  // let token: string
  // if (process.env.RAPID_API_KEY) {
  //   token = process.env.RAPID_API_KEY
  // } else {
  //   throw new Error("RAPID_API_KEY environment variable is not set")
  // }

  // const myHeaders = new Headers()
  // myHeaders.append("x-rapidapi-key", token)
  // myHeaders.append("x-rapidapi-host", "v3.football.api-sports.io")

  // const requestOptions = {
  //   method: "GET",
  //   headers: myHeaders,
  // }

  // let url = `${FOOTBALL_API_SPORTS}/fixtures/rounds?league=${leagueId}&season=${season}`
  // if (current) {
  //   url += "&current=true"
  // }

  // const res = await fetch(url, requestOptions)

  // if (!res.ok) {
  //   // This will activate the closest `error.js` Error Boundary
  //   throw new Error("Failed to fetch data")
  // }

  // const data = await res.json()

  // return data.response
}

export async function getFootballData({
  path,
  params,
}: {
  path: string
  params?: string
}) {
  let token: string
  if (process.env.NEXT_PUBLIC_FOOTBALLDATA_TOKEN) {
    token = process.env.NEXT_PUBLIC_FOOTBALLDATA_TOKEN
  } else {
    throw new Error("FOOTBALLDATA_TOKEN environment variable is not set")
  }

  const myHeaders = new Headers()
  myHeaders.append("X-Auth-Token", token)

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
  }

  let url = `${FOOTBALL_DATA_API}/${path}`
  if (params) {
    url += `?${params}`
  }

  const res = await fetch(url, requestOptions)

  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error("Failed to fetch data")
  }

  return res.json()
}
