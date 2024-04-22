"use server"

import { unstable_noStore as noStore } from "next/cache"
import { sql } from "@vercel/postgres"

export async function fetchBoloes(userId: string) {
  noStore()

  console.log("FETCHBOLOES()")
  console.log("userId:", userId)

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
