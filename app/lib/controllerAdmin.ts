import { fetchBoloes, fetchUsersBolao, fetchUsersBets } from "@/app/lib/data"
import { unstable_noStore as noStore } from "next/cache"
import { deleteBolao, deleteUserBolao, deleteBet } from "./actions"
import { UserBolao, Bet } from "./definitions"

export async function getData() {
  noStore()

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
