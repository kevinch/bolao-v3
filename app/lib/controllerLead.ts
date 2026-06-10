import {
  fetchBolao,
  fetchUsersBolao,
  fetchFixtures,
  fetchUsersBets,
  fetchChampionPicks,
  fetchLeague,
} from "@/app/lib/data"
import { FixtureData, UserBolao, Bet } from "./definitions"
import { getPlayersFromUsersBolao } from "./players"
import { resolveChampionTeamId } from "./championPick"
import { isChampionPickLocked } from "./utils"

export async function getData({ bolaoId }: { bolaoId: string }) {
  const [bolao, usersBolao] = await Promise.all([
    fetchBolao(bolaoId),
    fetchUsersBolao(bolaoId),
  ])

  const year: number = bolao.year
  const leagueId: string = bolao.competition_id

  const players = await getPlayersFromUsersBolao(usersBolao)

  const userBoloesIds: string[] = usersBolao.map((el: UserBolao) => el.id)

  const [fixtures, bets, championPicks, league] = await Promise.all([
    fetchFixtures({ leagueId, year }),
    fetchUsersBets(userBoloesIds),
    fetchChampionPicks(userBoloesIds),
    fetchLeague(Number(leagueId)),
  ])

  const leagueWinnerTeamId = await resolveChampionTeamId({
    leagueType: league?.league?.type,
    leagueId,
    year,
    fixtures,
  })

  return {
    bolao,
    fixtures: fixtures as FixtureData[],
    players,
    bets,
    championPicks,
    isChampionPickLocked: isChampionPickLocked(fixtures),
    leagueWinnerTeamId,
  }
}
