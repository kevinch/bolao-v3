"use server"

import { sql } from "@vercel/postgres"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { fetchLeague, fetchBolao, fetchFixtures } from "./data"
import { getUserRole } from "./authRole"
import {
  getCurrentSeasonObject,
  isChampionPickLocked,
  isFixtureOpenToBet,
} from "./utils"
import {
  BetResult,
  UpdateBolaoResult,
  CreateUserBolaoResult,
  CreateBolaoResult,
  ChampionPickResult,
  ChampionPick,
  FixtureData,
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

    revalidatePath("/")

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

type BetMutationError = { success: false; message: string }

type BetMutationContext =
  | BetMutationError
  | {
      userId: string
      userBolaoId: string
      fixtureId: string
    }

function isBetMutationError(
  context: BetMutationContext
): context is BetMutationError {
  return "success" in context && context.success === false
}

async function assertCanMutateBet({
  userId,
  userBolaoId,
  fixtureId,
}: {
  userId: string
  userBolaoId: string
  fixtureId: string
}): Promise<BetMutationError | null> {
  const isAdmin = (await getUserRole(userId)) === "admin"

  const ownership = await sql`
    SELECT ub.bolao_id, ub.user_id
    FROM user_bolao ub
    WHERE CAST(ub.id AS VARCHAR) = ${userBolaoId}
  `
  const row = ownership.rows[0]

  if (!row) {
    return { success: false, message: "Forbidden." }
  }

  if (String(row.user_id) !== userId && !isAdmin) {
    return { success: false, message: "Forbidden." }
  }

  if (isAdmin) {
    return null
  }

  const bolao = await fetchBolao(String(row.bolao_id))
  const fixtures = await fetchFixtures({
    leagueId: bolao.competition_id,
    year: bolao.year,
  })
  const fixture = fixtures.find(
    (entry: FixtureData) => entry.fixture.id.toString() === fixtureId
  )

  if (!fixture) {
    return { success: false, message: "Fixture not found." }
  }

  if (!isFixtureOpenToBet(fixture)) {
    return { success: false, message: "Betting is locked for this fixture." }
  }

  return null
}

async function getBetMutationContext(
  betId: string
): Promise<BetMutationContext> {
  const { userId } = await auth()

  if (!userId) {
    return { success: false, message: "Unauthorized." }
  }

  const betLookup = await sql`
    SELECT b.fixture_id, b.user_bolao_id, ub.user_id
    FROM bets b
    INNER JOIN user_bolao ub ON CAST(b.user_bolao_id AS VARCHAR) = CAST(ub.id AS VARCHAR)
    WHERE CAST(b.id AS VARCHAR) = ${betId}
  `
  const row = betLookup.rows[0]

  if (!row) {
    return { success: false, message: "Bet not found." }
  }

  const validation = await assertCanMutateBet({
    userId,
    userBolaoId: String(row.user_bolao_id),
    fixtureId: String(row.fixture_id),
  })

  if (validation) {
    return validation
  }

  return {
    userId,
    userBolaoId: String(row.user_bolao_id),
    fixtureId: String(row.fixture_id),
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
  const { userId } = await auth()

  if (!userId) {
    return { success: false, message: "Unauthorized." } as BetResult
  }

  try {
    const validation = await assertCanMutateBet({
      userId,
      userBolaoId,
      fixtureId,
    })

    if (validation) {
      return validation as BetResult
    }

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
    const context = await getBetMutationContext(betId)

    if (isBetMutationError(context)) {
      return context as BetResult
    }

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

export async function createOrUpdateChampionPick({
  userBolaoId,
  bolaoId,
  teamId,
  teamName,
  teamLogo,
}: {
  userBolaoId: string
  bolaoId: string
  teamId: number
  teamName: string
  teamLogo: string
}): Promise<ChampionPickResult> {
  const { userId } = await auth()

  if (!userId) {
    return { success: false, message: "Unauthorized." }
  }

  try {
    const bolao = await fetchBolao(bolaoId)
    const fixtures = await fetchFixtures({
      leagueId: bolao.competition_id,
      year: bolao.year,
    })

    if (isChampionPickLocked(fixtures)) {
      return { success: false, message: "Champion pick is locked." }
    }

    const result = await sql`
      INSERT INTO champion_picks (user_bolao_id, team_id, team_name, team_logo)
      SELECT ub.id, ${teamId}, ${teamName}, ${teamLogo}
      FROM user_bolao ub
      WHERE CAST(ub.id AS VARCHAR) = ${userBolaoId}
        AND CAST(ub.bolao_id AS VARCHAR) = ${bolaoId}
        AND CAST(ub.user_id AS VARCHAR) = ${userId}
      ON CONFLICT (user_bolao_id) DO UPDATE SET
        team_id = EXCLUDED.team_id,
        team_name = EXCLUDED.team_name,
        team_logo = EXCLUDED.team_logo,
        updated_at = NOW()
      RETURNING *
    `

    if (!result.rows[0]) {
      return { success: false, message: "Forbidden." }
    }

    return { ...(result.rows[0] as ChampionPick), success: true }
  } catch (error) {
    console.log(error)
    return {
      success: false,
      message: "Database Error: failed to save champion pick.",
    }
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

    revalidatePath("/")

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
    const context = await getBetMutationContext(betId)

    if (isBetMutationError(context)) {
      return context
    }

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
