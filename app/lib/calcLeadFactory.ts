import { Bet, FixtureData, PlayersData, ChampionPick, LeadData } from "./definitions"
import { calcScore } from "./scoresCalcFactory"
import {
  STATUSES_FINISHED,
  findBetObj,
  getEmailUsername,
  CHAMPION_PICK_BONUS_POINTS,
} from "./utils"

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

      if (homeBetObj?.value !== undefined && awayBetObj?.value !== undefined) {
        const fixtureScore = calcScore({
          resultHome: fixtureData.score.fulltime.home || 0,
          resultAway: fixtureData.score.fulltime.away || 0,
          betHome: homeBetObj.value,
          betAway: awayBetObj.value,
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
  championPicks = [],
  leagueWinnerTeamId = null,
}: {
  players: PlayersData[]
  fixtures: FixtureData[]
  bets: Bet[]
  championPicks?: ChampionPick[]
  leagueWinnerTeamId?: number | null
}) => {
  const picksByUserBolaoId = new Map(
    championPicks.map((pick) => [pick.user_bolao_id, pick])
  )

  const lead: {
    name: string
    total: number
    championPick?: { id: number; name: string; logo: string } | null
  }[] = []

  players.forEach((player: PlayersData) => {
    const totalMatchDay = getTotal({ bets, fixtures, player })
    const pick = picksByUserBolaoId.get(player.userBolaoId)
    const championBonus =
      leagueWinnerTeamId !== null && pick?.team_id === leagueWinnerTeamId
        ? CHAMPION_PICK_BONUS_POINTS
        : 0

    const entry: {
      name: string
      total: number
      championPick?: { id: number; name: string; logo: string } | null
    } = {
      name: player.username || getEmailUsername(player.email),
      total: totalMatchDay + championBonus,
    }

    if (championPicks.length > 0) {
      entry.championPick = pick
        ? { id: pick.team_id, name: pick.team_name, logo: pick.team_logo }
        : null
    }

    lead.push(entry)
  })

  return lead
}

export function prepareLeadForDisplay(
  lead: LeadData[],
  isChampionPickLocked: boolean
): LeadData[] {
  if (isChampionPickLocked) return lead

  return lead.map((entry) => ({ ...entry, championPick: null }))
}
