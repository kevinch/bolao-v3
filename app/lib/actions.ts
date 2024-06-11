"use server"

import { sql } from "@vercel/postgres"
import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { fetchLeague } from "./data"
import { getCurrentSeason } from "./utils"
import { BetResult, CreateUserBolaoResult } from "./definitions"

export async function createUser({ id, role }: { id: string; role: string }) {
  try {
    await sql`
      INSERT INTO users (id, role)
      VALUES (${id}, ${role})
      ON CONFLICT (id) DO NOTHING;
    `
  } catch (error) {
    console.error("ERROR", error)
    return {
      message: "Database Error: Failed to Create User.",
    }
  }
}

export async function navigate(path: string) {
  redirect(path)
}

export async function createBolao({
  name,
  competitionId,
}: {
  name: string
  competitionId: number
}) {
  const { userId }: { userId: string | null } = auth()

  const date = new Date().toISOString().split("T")[0]

  const league = await fetchLeague(competitionId)

  const year = getCurrentSeason(league.seasons)

  try {
    const result = await sql`
      INSERT INTO boloes (name, competition_id, created_by, created_at, year)
      VALUES (${name}, ${competitionId}, ${userId}, ${date}, ${year})
      RETURNING *
    `

    const insertedData = result.rows[0]

    return await createUserBolao(insertedData.id)
  } catch (error) {
    console.log(error)
    return {
      success: false,
      message: "Database Error: Failed to Create Bolao.",
    }
  }
}

export async function createUserBolao(
  bolaoId: number | string
): Promise<CreateUserBolaoResult> {
  const { userId }: { userId: string | null } = auth()

  try {
    const data = await sql`
      INSERT INTO user_bolao (bolao_id, user_id)
      VALUES (${bolaoId}, ${userId})
      RETURNING *
    `

    const result = {
      id: data.rows[0].id,
      bolao_id: data.rows[0].bolao_id,
      user_id: data.rows[0].user_id,
      success: true,
    }

    return result
  } catch (error) {
    console.log(error)
    return {
      success: false,
      message: "Database Error: Failed to Create UserBolao.",
    }
  }
}

export async function createBet({
  userBolaoId,
  fixtureId,
  value,
  type,
}: {
  userBolaoId: string
  fixtureId: string
  value: number
  type: "away" | "home"
}) {
  try {
    const result = await sql`
        INSERT INTO bets (user_bolao_id, fixture_id, value, type)
        VALUES (${userBolaoId}, ${fixtureId}, ${value}, ${type})
        RETURNING *
      `
    const data = result.rows[0]

    return data as BetResult
  } catch (error) {
    console.log(error)
    return {
      message: "Database Error: Failed to set a bet.",
    } as BetResult
  }
}

export async function updateBet({
  value,
  betId,
}: {
  value: number
  betId: string
}) {
  try {
    const result = await sql`
        UPDATE bets
        SET value = ${value}
        WHERE CAST(id AS VARCHAR) = ${betId}
        RETURNING *
      `
    const data = result.rows[0]

    return data as BetResult
  } catch (error) {
    console.log(error)
    return {
      message: "Database Error: Failed to set a bet.",
    } as BetResult
  }
}
