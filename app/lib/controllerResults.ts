import {
  fetchBolao,
  fetchUsersBolao,
  fetchRounds,
  fetchFixtures,
  fetchUsersBets,
} from "@/app/lib/data"
import { sortFixtures, cleanRounds } from "@/app/lib/utils"
import { Bet, UserBolao, PlayersData } from "@/app/lib/definitions"
import { clerkClient } from "@clerk/nextjs/server"
import { unstable_noStore as noStore } from "next/cache"

export async function getData({
  bolaoId,
  roundParam,
}: {
  bolaoId: string
  roundParam?: string
}) {
  noStore()

  const [bolao, usersBolao] = await Promise.all([
    fetchBolao(bolaoId),
    fetchUsersBolao(bolaoId),
  ])

  const year: number = bolao.year
  const leagueId: string = bolao.competition_id

  // Fetch players infos
  const userIds: string[] = usersBolao.map((el: UserBolao) => el.user_id)
  const client = await clerkClient()
  const users = await client.users.getUserList({ userId: userIds })

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

  // Fetch bets
  const userBoloesIds: string[] = usersBolao.map((el: UserBolao) => el.id)
  const bets: Bet[] = await fetchUsersBets(userBoloesIds)

  // Fetch rounds infos
  const allRoundsUncleaned: string[] = await fetchRounds({ leagueId, year })
  const allRounds: string[] = cleanRounds(allRoundsUncleaned)

  const currentRoundObj: string[] = await fetchRounds({
    leagueId,
    year,
    current: true,
  })

  const currentRound = currentRoundObj[0] || allRounds[allRounds.length - 1]

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
