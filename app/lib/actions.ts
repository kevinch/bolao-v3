"use server"

import { sql } from "@vercel/postgres"
import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { fetchLeague } from "./data"
import { getCurrentSeason } from "./utils"

const { userId }: { userId: string | null } = auth()

export async function createUser({ id, role }: { id: string; role: string }) {
  try {
    await sql`
      INSERT INTO users (id, role)
      VALUES (${id}, ${role})
      ON CONFLICT (id) DO NOTHING;
    `
    // add "RETURNING *" to SQL query to get inserted data'
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

export async function createBolao(formData: any) {
  // type should be FormData

  const competitionId = formData.get("competitionId")
  const name = formData.get("name")
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

    createUserBolao(insertedData.id)
  } catch (error) {
    console.log(error)
    return {
      message: "Database Error: Failed to Create Bolao.",
    }
  }
}

export async function createUserBolao(bolaoId: number) {
  try {
    const result = await sql`
      INSERT INTO user_bolao (bolao_id, user_id)
      VALUES (${bolaoId}, ${userId})
    `

    const insertedData = result.rows
    // console.log("INSERTED DATA ON createUserBolao():", insertedData)

    return insertedData
  } catch (error) {
    console.log(error)
    return {
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
  console.log("userBolaoId", userBolaoId)
  console.log("fixtureId", fixtureId)
  console.log("value", value)
  console.log("type", type)

  try {
    const result = await sql`
      INSERT INTO bets (user_bolao_id, fixture_id, value, type)
      VALUES (${userBolaoId}, ${fixtureId}, ${value}, ${type})
    `

    const insertedData = result.rows

    return insertedData
  } catch (error) {
    console.log(error)
    return {
      message: "Database Error: Failed to set a bet.",
    }
  }
}
