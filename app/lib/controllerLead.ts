import {
  fetchBolao,
  fetchUsersBolao,
  fetchFixtures,
  fetchUsersBets,
} from "@/app/lib/data"
import { FixtureData, UserBolao, PlayersData, Bet } from "./definitions"
import { clerkClient } from "@clerk/nextjs/server"

export async function getData({ bolaoId }: { bolaoId: string }) {
  const [bolao, usersBolao] = await Promise.all([
    fetchBolao(bolaoId),
    fetchUsersBolao(bolaoId),
  ])

  const year: number = bolao.year
  const leagueId: string = bolao.competition_id

  // Fetch players infos
  const userIds: string[] = usersBolao.map((el: UserBolao) => el.user_id)
  const users = await clerkClient.users.getUserList({ userId: userIds })

  const players: PlayersData[] = []
  users.data.map((el) => {
    // TODO: fix the "any" type
    const userBolaoObj: any = usersBolao.find(
      (ub: UserBolao) => ub.user_id === el.id
    )

    const obj = {
      id: el.id,
      firstName: el.firstName,
      email: el.emailAddresses[0].emailAddress,
      userBolaoId: userBolaoObj.id,
    }

    players.push(obj)
  })

  // Fetch all fixtures
  const fixtures: FixtureData[] = await fetchFixtures({ leagueId, year })

  // Fetch bets
  const userBoloesIds: string[] = usersBolao.map((el: UserBolao) => el.id)
  const bets: Bet[] = await fetchUsersBets(userBoloesIds)

  return {
    bolao,
    fixtures,
    players,
    bets,
  }
}
