import { Bet, FixtureData, PlayersData } from "./definitions"
import { calcScore } from "./scoresCalcFactory"
import { STATUSES_FINISHED, findBetObj } from "./utils"

const getTotal = ({
  fixtures,
  player,
  bets,
}: {
  fixtures: FixtureData[]
  player: { userBolaoId: string }
  bets: Bet[]
}) => {
  let totalMatchDay = 0

  fixtures.forEach((fixtureData) => {
    if (STATUSES_FINISHED.includes(fixtureData.fixture.status.short)) {
      const homeBetObj: Bet | null = findBetObj({
        bets,
        fixtureId: fixtureData.fixture.id.toString(),
        type: "home",
        userBolaoId: player.userBolaoId,
      })

      const awayBetObj: Bet | null = findBetObj({
        bets,
        fixtureId: fixtureData.fixture.id.toString(),
        type: "away",
        userBolaoId: player.userBolaoId,
      })

      // const multiplier = findBetData({
      //   userBolaoId: player.userBolaoId,
      //   fixtureId: fixture.id,
      //   type: "home",
      //   key: "multiplier",
      //   bets,
      // })

      // const isJoker = findBetData({
      //   userBolaoId: player.userBolaoId,
      //   fixtureId: fixture.id,
      //   type: "home",
      //   key: "isJoker",
      //   bets,
      // })

      if (homeBetObj?.value && awayBetObj?.value) {
        const fixtureScore = calcScore({
          resultHome: fixtureData.score.fulltime.home,
          resultAway: fixtureData.score.fulltime.away,
          betHome: homeBetObj.value,
          betAway: awayBetObj.value,
          // multiplier,
          // isJoker,
        })

        totalMatchDay = totalMatchDay + fixtureScore
      }
    }
  })

  return totalMatchDay
}

export const calcLead = ({
  players,
  fixtures,
  bets,
}: {
  players: PlayersData[]
  fixtures: FixtureData[]
  bets: Bet[]
}) => {
  const lead: any = []

  players.forEach((player: PlayersData) => {
    let matchdaysTotals = []
    let total = 0

    const totalMatchDay = getTotal({ bets, fixtures, player })

    total = total + totalMatchDay
    matchdaysTotals.push(totalMatchDay)

    lead.push({
      name: player.firstName || player.email.split("@")[0],
      matchdaysTotals,
      total,
    })
  })

  return lead
}
