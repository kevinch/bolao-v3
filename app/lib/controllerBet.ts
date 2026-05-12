import {
  fetchBolao,
  fetchUserBolao,
  fetchUsersBolao,
  fetchRounds,
  fetchFixtures,
  fetchUserBets,
} from "@/app/lib/data"
import {
  sortFixtures,
  cleanRounds,
  pickCurrentRoundFromApiCurrent,
} from "@/app/lib/utils"
import { Bet, PlayersData, UserBolao } from "@/app/lib/definitions"
import { clerkClient } from "@clerk/nextjs/server"

async function getPlayers(usersBolao: UserBolao[]) {
  const userIds: string[] = usersBolao.map((el: UserBolao) => el.user_id)
  const client = await clerkClient()
  const users = await client.users.getUserList({ userId: userIds })

  return users.data.map((el) => {
    const userBolaoObj = usersBolao.find(
      (ub: UserBolao) => ub.user_id === el.id
    )

    return {
      id: el.id,
      username: el.username,
      email: el.emailAddresses[0]?.emailAddress || "",
      userBolaoId: userBolaoObj?.id || "",
    }
  })
}

export async function getData({
  bolaoId,
  roundParam,
  userId,
  isAdmin = false,
  selectedUserBolaoId,
}: {
  bolaoId: string
  roundParam?: string
  userId: string
  isAdmin?: boolean
  selectedUserBolaoId?: string
}) {
  const [bolao, userBolao] = await Promise.all([
    fetchBolao(bolaoId),
    fetchUserBolao({ bolaoId, userId }),
  ])

  const year: number = bolao.year
  const leagueId: string = bolao.competition_id

  let selectedUserBolao: UserBolao = userBolao
  let players: PlayersData[] = []

  if (isAdmin) {
    const usersBolao: UserBolao[] = await fetchUsersBolao(bolaoId)
    players = await getPlayers(usersBolao)

    selectedUserBolao =
      usersBolao.find((el) => el.id === selectedUserBolaoId) || userBolao
  }

  const bets: Bet[] = await fetchUserBets(selectedUserBolao.id)

  const allRoundsUncleaned: string[] = await fetchRounds({ leagueId, year }) // HAS TO GO TO STORE
  const allRounds: string[] = cleanRounds(allRoundsUncleaned)

  const currentRoundObj: string[] = await fetchRounds({
    leagueId,
    year,
    current: true,
  }) // HAS TO GO TO STORE
  const currentRound = pickCurrentRoundFromApiCurrent(
    currentRoundObj,
    allRounds,
    "last"
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
  // END

  const unSortedFixtures = await fetchFixtures({
    leagueId,
    year,
    round,
  })
  const fixtures = sortFixtures(unSortedFixtures)

  return {
    bolao,
    userBolao: selectedUserBolao,
    currentUserBolao: userBolao,
    currentRound: round,
    allRounds,
    fixtures,
    isLastRound,
    isFirstRound,
    bets,
    players,
  }
}
