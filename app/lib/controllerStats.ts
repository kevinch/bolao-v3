import {
  fetchBolao,
  fetchUsersBolao,
  fetchFixtures,
  fetchUsersBets,
  fetchChampionPicks,
  fetchLeague,
  fetchRounds,
} from "@/app/lib/data"
import { FixtureData, UserBolao } from "./definitions"
import { getPlayersFromUsersBolao } from "./players"
import { resolveChampionTeamId } from "./championPick"
import { cleanRounds } from "./utils"
import { buildStatsViewModel, StatsViewModel } from "./statsFactory"

export async function getData({
  bolaoId,
  userId,
  seasonEndLabel,
}: {
  bolaoId: string
  userId: string | null
  seasonEndLabel: string
}) {
  const [bolao, usersBolaoRaw] = await Promise.all([
    fetchBolao(bolaoId),
    fetchUsersBolao(bolaoId),
  ])

  const usersBolao: UserBolao[] = usersBolaoRaw

  const year: number = bolao.year
  const leagueId: string = bolao.competition_id

  const players = await getPlayersFromUsersBolao(usersBolao)
  const userBoloesIds: string[] = usersBolao.map((el: UserBolao) => el.id)
  const currentUserBolao = usersBolao.find((entry) => entry.user_id === userId)

  const [fixtures, bets, championPicks, league, allRoundsUncleaned] =
    await Promise.all([
      fetchFixtures({ leagueId, year }),
      fetchUsersBets(userBoloesIds),
      fetchChampionPicks(userBoloesIds),
      fetchLeague(Number(leagueId)),
      fetchRounds({ leagueId, year }),
    ])

  const allRounds = cleanRounds(allRoundsUncleaned)

  const leagueWinnerTeamId = await resolveChampionTeamId({
    leagueType: league?.league?.type,
    leagueId,
    year,
    fixtures: fixtures as FixtureData[],
  })

  const stats: StatsViewModel = buildStatsViewModel({
    players,
    fixtures: fixtures as FixtureData[],
    bets,
    allRounds,
    championPicks,
    leagueWinnerTeamId,
    seasonEndLabel,
    currentUserBolaoId: currentUserBolao?.id ?? null,
  })

  return {
    bolao,
    fixtures: fixtures as FixtureData[],
    stats,
  }
}
