import { Bet, FixtureData, PlayersData } from "./definitions"
import { calcScore } from "./scoresCalcFactory"
import {
  findBetObj,
  getEmailUsername,
  getFixtureResultScores,
  INITIAL_BET_VALUE,
  STATUSES_FINISHED,
  STATUSES_IN_PLAY,
} from "./utils"

export type ResultsPlayerColumn = {
  displayName: string
  isCurrentUser: boolean
}

export type ResultsBetCell = {
  home: string
  away: string
  points: number | null
}

export type ResultsFixtureRow = {
  fixture: FixtureData
  cells: ResultsBetCell[]
}

export type ResultsTableView = {
  players: ResultsPlayerColumn[]
  rows: ResultsFixtureRow[]
  totals: number[]
}

function calculatePlayerTotal({
  fixtures,
  bets,
  userBolaoId,
}: {
  fixtures: FixtureData[]
  bets: Bet[]
  userBolaoId: string
}): number {
  let total = 0

  fixtures.forEach((fixtureData) => {
    const statusShort = fixtureData.fixture.status.short
    const scoresVisible =
      STATUSES_IN_PLAY.includes(statusShort) ||
      STATUSES_FINISHED.includes(statusShort)

    if (!scoresVisible) return

    const homeBetObj = findBetObj({
      bets,
      fixtureId: fixtureData.fixture.id.toString(),
      type: "home",
      userBolaoId,
    })

    const awayBetObj = findBetObj({
      bets,
      fixtureId: fixtureData.fixture.id.toString(),
      type: "away",
      userBolaoId,
    })

    if (homeBetObj?.value !== undefined && awayBetObj?.value !== undefined) {
      const { resultHome, resultAway } = getFixtureResultScores(
        fixtureData,
        statusShort
      )

      total += calcScore({
        resultHome,
        resultAway,
        betHome: homeBetObj.value,
        betAway: awayBetObj.value,
      })
    }
  })

  return total
}

export function buildResultsTableView({
  fixtures,
  bets,
  players,
  currentUserId,
}: {
  fixtures: FixtureData[]
  bets: Bet[]
  players: PlayersData[]
  currentUserId: string
}): ResultsTableView {
  const playerColumns: ResultsPlayerColumn[] = players.map((player) => ({
    displayName: player.username || getEmailUsername(player.email),
    isCurrentUser: player.id === currentUserId,
  }))

  const rows: ResultsFixtureRow[] = fixtures.map((fixtureData) => {
    const statusShort = fixtureData.fixture.status.short
    const canShowScores =
      STATUSES_IN_PLAY.includes(statusShort) ||
      STATUSES_FINISHED.includes(statusShort)

    const cells: ResultsBetCell[] = players.map((player) => {
      const showScores = player.id === currentUserId || canShowScores

      const homeBetObj = findBetObj({
        bets,
        fixtureId: fixtureData.fixture.id.toString(),
        type: "home",
        userBolaoId: player.userBolaoId,
      })

      const awayBetObj = findBetObj({
        bets,
        fixtureId: fixtureData.fixture.id.toString(),
        type: "away",
        userBolaoId: player.userBolaoId,
      })

      const betHome = homeBetObj
        ? homeBetObj.value.toString()
        : INITIAL_BET_VALUE
      const betAway = awayBetObj
        ? awayBetObj.value.toString()
        : INITIAL_BET_VALUE

      let points: number | null = null
      if (canShowScores) {
        if (
          homeBetObj?.value !== undefined &&
          awayBetObj?.value !== undefined
        ) {
          const { resultHome, resultAway } = getFixtureResultScores(
            fixtureData,
            statusShort
          )

          points = calcScore({
            resultHome,
            resultAway,
            betHome: homeBetObj.value,
            betAway: awayBetObj.value,
          })
        } else {
          points = 0
        }
      }

      return {
        home: showScores ? betHome : INITIAL_BET_VALUE,
        away: showScores ? betAway : INITIAL_BET_VALUE,
        points,
      }
    })

    return { fixture: fixtureData, cells }
  })

  const totals = players.map((player) =>
    calculatePlayerTotal({
      fixtures,
      bets,
      userBolaoId: player.userBolaoId,
    })
  )

  return {
    players: playerColumns,
    rows,
    totals,
  }
}
