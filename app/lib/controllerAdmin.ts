import { fetchBoloes, fetchUsersBolao, fetchUsersBets } from "@/app/lib/data"
import { unstable_noStore as noStore } from "next/cache"
import { deleteBolao, deleteUserBolao, deleteBet } from "./actions"
import { UserBolao } from "./definitions"

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

  // find bets
  const usersBoloesIds: string[] = []
  usersBolao.forEach((el: UserBolao) => {
    usersBoloesIds.push(el.id)
  })

  const usersBets = await fetchUsersBets(usersBoloesIds)

  console.log("usersBets", usersBets)

  // delete bets
  // TODO updatre for all ids
  const deletedBet = await deleteBet(usersBets[0].id)
  console.log("deletedBet", deletedBet)

  // delete user boloes
  // delete bolao
  return true
}
