import {
  fetchBolao,
  fetchUserBolao,
  fetchRounds,
  fetchFixtures,
  fetchBets,
} from "@/app/lib/data"
import { sortFixtures, cleanRounds } from "@/app/lib/utils"
import { Bet } from "@/app/lib/definitions"

export async function getData({
  bolaoId,
  roundParam,
  userId,
}: {
  bolaoId: string
  roundParam?: string
  userId: string
}) {
  const [bolao, userBolao] = await Promise.all([
    fetchBolao(bolaoId),
    fetchUserBolao({ bolaoId, userId }),
  ])

  const year: number = bolao.year
  const leagueId: string = bolao.competition_id
  const userBolaoId: string = userBolao.id

  const bets: Bet[] = await fetchBets(userBolaoId)

  const allRoundsUncleaned: string[] = await fetchRounds({ leagueId, year }) // HAS TO GO TO STORE
  const allRounds: string[] = cleanRounds(allRoundsUncleaned)

  const currentRoundObj: string[] = await fetchRounds({
    leagueId,
    year,
    current: true,
  }) // HAS TO GO TO STORE
  const currentRound = currentRoundObj[0] // HAS TO GO TO STORE

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
  // END

  const unSortedFixtures = await fetchFixtures({
    leagueId,
    year,
    round,
  })
  const fixtures = sortFixtures(unSortedFixtures)

  return {
    bolao,
    userBolao,
    currentRound: round,
    allRounds,
    fixtures,
    isLastRound,
    isFirstRound,
    bets,
  }
}
