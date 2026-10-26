import {
  fetchAdminUsageStats,
  fetchBoloes,
  fetchUsersBolao,
  fetchUsersBets,
  fetchUsers,
} from "@/app/lib/data"
import { deleteBolao, deleteUserBolao, deleteBet } from "./actions"
import { UserBolao, Bet } from "./definitions"
import { FOOTBALL_API_SPORTS_LEAGUES } from "./utils"

export async function getBoloes() {
  const boloes = await fetchBoloes()

  return {
    boloes,
  }
}

export async function deleteBolaoGroup(bolaoId: string) {
  // find user_boloes
  const usersBolao: UserBolao[] = await fetchUsersBolao(bolaoId)

  // retrieve user_boloes ids
  const usersBoloesIds: string[] = []
  usersBolao.forEach((el: UserBolao) => {
    usersBoloesIds.push(el.id)
  })

  // find bets
  const usersBets = await fetchUsersBets(usersBoloesIds)

  // retrieve bets ids
  const usersBetsIds: string[] = []
  usersBets.forEach((el: Bet) => {
    usersBetsIds.push(el.id)
  })

  // delete bets
  const deleteBetsPromises = usersBetsIds.map((betId) => deleteBet(betId))
  await Promise.all(deleteBetsPromises)

  // delete user_boloes
  const deleteUsersBolaoPromises = usersBoloesIds.map((userBolaoId) =>
    deleteUserBolao(userBolaoId)
  )
  await Promise.all(deleteUsersBolaoPromises)

  // delete bolao
  const result = await deleteBolao(bolaoId)

  return result
}

export async function getUsers() {
  const users = await fetchUsers()

  return {
    users,
  }
}

export async function getAdminUsageStats() {
  const data = await fetchAdminUsageStats()
  const leagueNames = new Map<
    string,
    { name: string; country: string }
  >(
    FOOTBALL_API_SPORTS_LEAGUES.map((league) => [
      String(league.id),
      { name: league.name, country: league.countryName },
    ])
  )

  const currentDate = new Date()
  const monthCounts = new Map(
    data.monthly.map((row) => [String(row.month), Number(row.count)])
  )
  const monthMembers = new Map(
    data.monthly.map((row) => [String(row.month), Number(row.members)])
  )
  const monthly = Array.from({ length: 24 }, (_, index) => {
    const monthDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - (23 - index),
      1
    )
    const month = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, "0")}`
    return {
      month,
      count: monthCounts.get(month) ?? 0,
      members: monthMembers.get(month) ?? 0,
    }
  })

  const competitions = data.competitions.map((row) => ({
    id: String(row.competition_id),
    month: String(row.month),
    name: leagueNames.get(String(row.competition_id))?.name ??
      `Competition ${row.competition_id}`,
    country: leagueNames.get(String(row.competition_id))?.country ?? null,
    count: Number(row.count),
  }))

  return {
    summary: {
      totalBoloes: Number(data.summary.total_boloes),
    },
    monthly,
    competitions,
  }
}
