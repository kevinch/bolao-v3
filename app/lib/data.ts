"use server"

import { QueryResultRow } from "pg"
import { sql } from "@vercel/postgres"
import { clerkClient } from "@clerk/nextjs/server"
import { unstable_cache } from "next/cache"
import { FOOTBALL_API_SPORTS } from "./utils"
import { Bolao, Bet, User, UserBolao, PlayersData } from "./definitions"
import { FOOTBALL_API_SPORTS_LEAGUES } from "./utils"
import { CACHE_REVALIDATE, cacheTags } from "./cache"

type CachedPlayer = {
  id: string
  username: string | null
  email: string
}

function getFootballHeaders(token: string) {
  return {
    "x-rapidapi-key": token,
    "x-rapidapi-host": "v3.football.api-sports.io",
  }
}

function createBolaoCacheKey(prefix: string, bolaoId: string) {
  return [prefix, bolaoId]
}

async function fetchCachedClerkUsers(
  bolaoId: string,
  userIds: string[]
): Promise<CachedPlayer[]> {
  const normalizedUserIds = [...userIds].sort()

  return unstable_cache(
    async () => {
      const client = await clerkClient()
      const users = await client.users.getUserList({ userId: normalizedUserIds })

      return users.data.map((user) => ({
        id: user.id,
        username: user.username,
        email: user.emailAddresses[0]?.emailAddress || "",
      }))
    },
    ["players", bolaoId, normalizedUserIds.join(":")],
    {
      revalidate: CACHE_REVALIDATE.players,
      tags: [cacheTags.players(bolaoId)],
    }
  )()
}

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
    return await unstable_cache(
      async () => {
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
      },
      createBolaoCacheKey("bolao", bolaoId),
      {
        revalidate: CACHE_REVALIDATE.bolao,
        tags: [cacheTags.bolao(bolaoId)],
      }
    )()
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
    return await unstable_cache(
      async () => {
        const data: { rows: QueryResultRow[] } = await sql`SELECT *
          FROM user_bolao
          WHERE CAST(bolao_id AS VARCHAR) = ${bolaoId}
        `

        const rows = data.rows

        if (!rows) {
          throw new Error("No user bolões found for the given ID.")
        }

        return rows as UserBolao[]
      },
      createBolaoCacheKey("bolao-users", bolaoId),
      {
        revalidate: CACHE_REVALIDATE.bolao,
        tags: [cacheTags.bolao(bolaoId)],
      }
    )()
  } catch (error) {
    console.error("Database Error:", error)
    throw new Error("Failed to fetch user bolões.")
  }
}

export async function fetchPlayersForBolao({
  bolaoId,
  usersBolao,
}: {
  bolaoId: string
  usersBolao: UserBolao[]
}) {
  if (usersBolao.length === 0) {
    return [] as PlayersData[]
  }

  try {
    const users = await fetchCachedClerkUsers(
      bolaoId,
      usersBolao.map((userBolao) => userBolao.user_id)
    )

    return users.map((user) => {
      const userBolao = usersBolao.find((entry) => entry.user_id === user.id)

      return {
        id: user.id,
        username: user.username,
        email: user.email,
        userBolaoId: userBolao?.id || "",
      }
    })
  } catch (error) {
    console.error("Clerk Error:", error)
    throw new Error("Failed to fetch players.")
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

  const url = `${FOOTBALL_API_SPORTS}/leagues?id=${leagueId}`

  const res = await fetch(url, {
    method: "GET",
    headers: getFootballHeaders(token),
    next: {
      revalidate: CACHE_REVALIDATE.league,
      tags: [cacheTags.league(leagueId)],
    },
  })

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

  let url = `${FOOTBALL_API_SPORTS}/fixtures/rounds?league=${leagueId}&season=${year}`
  if (current) {
    url += "&current=true"
  }

  const res = await fetch(url, {
    method: "GET",
    headers: getFootballHeaders(token),
    next: {
      revalidate: CACHE_REVALIDATE.rounds,
      tags: [cacheTags.rounds({ leagueId, year, current })],
    },
  })

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

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

  let url = `${FOOTBALL_API_SPORTS}/fixtures?league=${leagueId}&season=${year}&timezone=${timezone}`
  if (round) {
    url += `&round=${round}`
  }

  const res = await fetch(url, {
    method: "GET",
    headers: getFootballHeaders(token),
    next: {
      revalidate: round
        ? CACHE_REVALIDATE.fixtures
        : CACHE_REVALIDATE.fixturesAll,
      tags: [cacheTags.fixtures({ leagueId, year, round })],
    },
  })

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

  const url = `${FOOTBALL_API_SPORTS}/standings?league=${leagueId}&season=${year}`

  const res = await fetch(url, {
    method: "GET",
    headers: getFootballHeaders(token),
    next: {
      revalidate: CACHE_REVALIDATE.standings,
      tags: [cacheTags.standings({ leagueId, year })],
    },
  })

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
