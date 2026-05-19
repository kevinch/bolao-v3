import {
  fetchBolao,
  fetchUsersBolao,
  fetchRounds,
  fetchFixtures,
  fetchUsersBets,
  fetchPlayersForBolao,
} from "@/app/lib/data"
import {
  sortFixtures,
  cleanRounds,
  pickCurrentRoundFromApiCurrent,
} from "@/app/lib/utils"
import { Bet, UserBolao, PlayersData } from "@/app/lib/definitions"

export async function getData({
  bolaoId,
  roundParam,
}: {
  bolaoId: string
  roundParam?: string
}) {
  const [bolao, usersBolao] = await Promise.all([
    fetchBolao(bolaoId),
    fetchUsersBolao(bolaoId),
  ])

  const year: number = bolao.year
  const leagueId: string = bolao.competition_id

  const userBoloesIds: string[] = usersBolao.map((el: UserBolao) => el.id)
  const [players, bets, allRoundsUncleaned, currentRoundObj]: [
    PlayersData[],
    Bet[],
    string[],
    string[],
  ] = await Promise.all([
    fetchPlayersForBolao({ bolaoId, usersBolao }),
    fetchUsersBets(userBoloesIds),
    fetchRounds({ leagueId, year }),
    fetchRounds({
      leagueId,
      year,
      current: true,
    }),
  ])

  const allRounds: string[] = cleanRounds(allRoundsUncleaned)

  const currentRound = pickCurrentRoundFromApiCurrent(
    currentRoundObj,
    allRounds,
    "first"
  )

  let isFirstRound: boolean = false
  let isLastRound: boolean = false

  // PARAM HANDLING FOR PAGINATION
  // We use round as an index because there are spaces in the round names
  let round = currentRound

  if (roundParam) {
    const index: number = Number(roundParam) - 1
    round = allRounds[index]

    isFirstRound = Number(roundParam) === 1
    isLastRound = Number(roundParam) === allRounds.length
  } else {
    isFirstRound = currentRound === allRounds[0]
    isLastRound = currentRound === allRounds[allRounds.length - 1]
  }

  // Fetch fixtures via parameters
  const unSortedFixtures = await fetchFixtures({
    leagueId,
    year,
    round,
  })
  const fixtures = sortFixtures(unSortedFixtures)

  return {
    bolao,
    usersBolao,
    currentRound: round,
    allRounds,
    fixtures,
    isLastRound,
    isFirstRound,
    players,
    bets,
  }
}
