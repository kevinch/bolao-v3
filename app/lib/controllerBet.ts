import {
  fetchBetPageContext,
  fetchUsersBolao,
  fetchRounds,
  fetchFixtures,
  fetchUserBets,
} from "@/app/lib/data"
import {
  sortFixtures,
  cleanRounds,
  pickCurrentRoundFromApiCurrent,
  isChampionPickLocked,
  getChampionPickLockDate,
  getTeamsFromFixtures,
} from "@/app/lib/utils"
import { Bet, FixtureData, PlayersData, UserBolao } from "@/app/lib/definitions"
import { getUserRole } from "./authRole"
import { getPlayersFromUsersBolao } from "./players"

function filterFixturesByRound(
  fixtures: FixtureData[],
  round: string
): FixtureData[] {
  return fixtures.filter(
    (fixture) => fixture.league.round.toLowerCase() === round.toLowerCase()
  )
}

export async function getData({
  bolaoId,
  roundParam,
  userId,
  selectedUserBolaoId,
}: {
  bolaoId: string
  roundParam?: string
  userId: string
  selectedUserBolaoId?: string
}) {
  const context = await fetchBetPageContext({ bolaoId, userId })

  if (!context) {
    throw new Error("User is not a member of this bolao.")
  }

  const { bolao, userBolao, championPick: userChampionPick } = context
  const userRole = await getUserRole(userId)
  const isAdmin = userRole === "admin"
  const year: number = bolao.year
  const leagueId: string = bolao.competition_id

  let selectedUserBolao: UserBolao = userBolao
  let players: PlayersData[] = []

  if (isAdmin) {
    const usersBolao: UserBolao[] = await fetchUsersBolao(bolaoId)
    players = await getPlayersFromUsersBolao(usersBolao)

    selectedUserBolao =
      usersBolao.find((el) => el.id === selectedUserBolaoId) || userBolao
  }

  const [bets, allSeasonFixtures, allRoundsUncleaned, currentRoundObj] =
    await Promise.all([
      fetchUserBets(selectedUserBolao.id),
      fetchFixtures({ leagueId, year }),
      fetchRounds({ leagueId, year }),
      fetchRounds({ leagueId, year, current: true }),
    ])

  const allRounds: string[] = cleanRounds(allRoundsUncleaned)
  const currentRound = pickCurrentRoundFromApiCurrent(
    currentRoundObj,
    allRounds,
    "last"
  )

  let isFirstRound: boolean = false
  let isLastRound: boolean = false

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

  const fixtures = sortFixtures(filterFixturesByRound(allSeasonFixtures, round))

  return {
    bolao,
    userBolao: selectedUserBolao,
    currentUserBolao: userBolao,
    userRole,
    isAdmin,
    currentRound: round,
    allRounds,
    fixtures,
    isLastRound,
    isFirstRound,
    bets,
    players,
    championPickTeams: getTeamsFromFixtures(allSeasonFixtures),
    isChampionPickLocked: isChampionPickLocked(allSeasonFixtures),
    championPickLockDate: getChampionPickLockDate(allSeasonFixtures),
    userChampionPick,
  }
}
