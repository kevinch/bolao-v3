"use server"

import { QueryResultRow } from "pg"
import { unstable_noStore as noStore } from "next/cache"
import { sql } from "@vercel/postgres"

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

    return data.rows
  } catch (error) {
    console.error("Database Error:", error)
    throw new Error("Failed to fetch boloes.")
  }
}

export async function fetchBolao(bolaoId: string) {
  try {
    const data: { rows: QueryResultRow[] } =
      await sql`SELECT name, id, competition_id
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
    }
  } catch (error) {
    console.error("Database Error:", error)
    throw new Error("Failed to fetch boloes.")
  }
}
