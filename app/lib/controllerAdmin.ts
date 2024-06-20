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
  console.log("usersBolao", usersBolao)

  // retrieve user boloes ids
  const usersBoloesIds: string[] = []
  usersBolao.forEach((el: UserBolao) => {
    usersBoloesIds.push(el.id)
  })
  console.log("usersBoloesIds", usersBoloesIds)

  // find bets
  const usersBets = await fetchUsersBets(usersBoloesIds)
  console.log("usersBets", usersBets)

  // retrieve bets ids
  const usersBetsIds: string[] = []
  usersBets.forEach((el: Bet) => {
    usersBetsIds.push(el.id)
  })
  console.log("usersBetsIds", usersBetsIds)

  // delete bets
  const deleteBetsPromises = usersBetsIds.map((betId) => deleteBet(betId))
  await Promise.all(deleteBetsPromises)

  // delete user boloes
  const deleteUsersBolaoPromises = usersBoloesIds.map((userBolaoId) =>
    deleteUserBolao(userBolaoId)
  )
  await Promise.all(deleteUsersBolaoPromises)

  // delete bolao
  // TODO

  return true
}
