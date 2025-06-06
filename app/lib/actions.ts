"use server"

import { sql } from "@vercel/postgres"
import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { fetchLeague } from "./data"
import { getCurrentSeasonObject } from "./utils"
import {
  BetResult,
  UpdateBolaoResult,
  CreateUserBolaoResult,
  CreateBolaoResult,
} from "./definitions"

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
      message: "Database Error: failed to Create User.",
    }
  }
}

export async function navigate(path: string) {
  redirect(path)
}

export async function createBolao(
  formData: FormData
): Promise<CreateBolaoResult> {
  const { userId }: { userId: string | null } = await auth()

  const competitionId = formData.get("competitionId")
  const name = formData.get("name")
  const date = new Date().toISOString().split("T")[0]

  if (typeof name !== "string" || typeof competitionId !== "string") {
    return {
      success: false,
      message: "Invalid data: name or compeitionId is not a string.",
    }
  }

  const competitionIdNumber = Number(competitionId)
  const league = await fetchLeague(competitionIdNumber)

  const currentSeason = getCurrentSeasonObject(league.seasons)
  let year
  let start
  let end

  if (currentSeason) {
    year = currentSeason.year
    start = currentSeason.start
    end = currentSeason.end
  }

  try {
    const result = await sql`
      INSERT INTO boloes (name, competition_id, created_by, created_at, year, start, "end")
      VALUES (${name}, ${competitionId}, ${userId}, ${date}, ${year}, ${start}, ${end})
      RETURNING *
    `

    const insertedData = result.rows[0]

    const userBolaoResult = await createUserBolao(insertedData.id)

    if (userBolaoResult.success) {
      return {
        success: true,
      }
    }
    return {
      success: false,
      message: "Database Error: failed to create a Bolao.",
    }
  } catch (error) {
    console.log(error)
    return {
      success: false,
      message: "Database Error: failed to create a Bolao.",
    }
  }
}

export async function updateBolao({
  bolaoId,
  name,
}: {
  bolaoId: string
  name: string
}): Promise<UpdateBolaoResult> {
  try {
    const data = await sql`
        UPDATE boloes
        SET name = ${name}
        WHERE CAST(id AS VARCHAR) = ${bolaoId}
        RETURNING *
      `
    const result = {
      success: true,
    }

    return result
  } catch (error) {
    console.log(error)
    return {
      success: false,
      message: "Database Error: failed to update a bolao.",
    }
  }
}

export async function createUserBolao(
  bolaoId: number | string
): Promise<CreateUserBolaoResult> {
  const { userId }: { userId: string | null } = await auth()

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
      message: "Database Error: failed to Create UserBolao.",
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
      message: "Database Error: failed to set a bet.",
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
      message: "Database Error: failed to set a bet.",
    } as BetResult
  }
}

export async function deleteBolao(bolaoId: string) {
  try {
    const result = await sql`
      DELETE FROM boloes
      WHERE CAST(id AS VARCHAR) = ${bolaoId}
      RETURNING *
    `

    const data = result.rows

    return {
      data,
      message: "bolao deleted",
      success: true,
    }
  } catch (error) {
    console.log(error)
    return {
      message: "Database Error: failed to delete a bolao.",
      success: false,
    }
  }
}

export async function deleteUserBolao(userBolaoId: string) {
  try {
    const result = await sql`
      DELETE FROM user_bolao
      WHERE CAST(id AS VARCHAR) = ${userBolaoId}
    `

    const data = result.rows

    return data
  } catch (error) {
    console.log(error)
    return {
      message: "Database Error: failed to delete a user bolao.",
    }
  }
}

export async function deleteBet(betId: string) {
  try {
    const result = await sql`
      DELETE FROM bets
      WHERE CAST(id AS VARCHAR) = ${betId}
    `

    const data = result.rows

    return data
  } catch (error) {
    console.log(error)
    return {
      message: "Database Error: failed to delete a bet.",
    }
  }
}
