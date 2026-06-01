import {
  fetchBolao,
  fetchUsersBolao,
  fetchFixtures,
  fetchUsersBets,
} from "@/app/lib/data"
import { FixtureData, UserBolao, Bet } from "./definitions"
import { getPlayersFromUsersBolao } from "./players"

export async function getData({ bolaoId }: { bolaoId: string }) {
  const [bolao, usersBolao] = await Promise.all([
    fetchBolao(bolaoId),
    fetchUsersBolao(bolaoId),
  ])

  const year: number = bolao.year
  const leagueId: string = bolao.competition_id

  const players = await getPlayersFromUsersBolao(usersBolao)

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
