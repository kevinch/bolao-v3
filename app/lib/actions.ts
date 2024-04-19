"use server"

import { sql } from "@vercel/postgres"
import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"

const { userId } = auth()

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

export async function createBolao(formData: any) {
  // type should be FormData

  const competitionId = formData.get("competitionId")
  const name = formData.get("name")
  const date = new Date().toISOString().split("T")[0]

  try {
    const result = await sql`
      INSERT INTO boloes (name, competition_id, created_by, created_at)
      VALUES (${name}, ${competitionId}, ${userId}, ${date})
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
    await sql`
      INSERT INTO user_bolao (bolao_id, user_id)
      VALUES (${bolaoId}, ${userId})
    `
  } catch (error) {
    console.log(error)
    return {
      message: "Database Error: Failed to Create UserBolao.",
    }
  }
}
