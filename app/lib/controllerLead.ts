import {
  fetchBolao,
  fetchUsersBolao,
  fetchFixtures,
  fetchUsersBets,
  fetchPlayersForBolao,
} from "@/app/lib/data"
import { FixtureData, UserBolao, PlayersData, Bet } from "./definitions"

export async function getData({ bolaoId }: { bolaoId: string }) {
  const [bolao, usersBolao] = await Promise.all([
    fetchBolao(bolaoId),
    fetchUsersBolao(bolaoId),
  ])

  const year: number = bolao.year
  const leagueId: string = bolao.competition_id

  const userBoloesIds: string[] = usersBolao.map((el: UserBolao) => el.id)

  const [players, fixtures, bets]: [PlayersData[], FixtureData[], Bet[]] =
    await Promise.all([
      fetchPlayersForBolao({ bolaoId, usersBolao }),
      fetchFixtures({ leagueId, year }),
      fetchUsersBets(userBoloesIds),
    ])

  return {
    bolao,
    fixtures,
    players,
    bets,
  }
}
