import {
  Bet,
  ChampionPick,
  FixtureData,
  PlayersData,
  ScoringTierId,
} from "./definitions"
import { calcLead } from "./calcLeadFactory"
import { calcScore, classifyScoringTier, SCORING_TIER_IDS } from "./scoresCalcFactory"
import {
  findBetObj,
  getEmailUsername,
  getFixtureResultScores,
  sortFixtures,
  STATUSES_FINISHED,
} from "./utils"

export type PositionRankEntry = {
  userBolaoId: string
  name: string
  rank: number
  total: number
}

export type PositionSnapshot = {
  label: string
  isSeasonEnd: boolean
  ranks: PositionRankEntry[]
}

export type TierBreakdownEntry = {
  tier: ScoringTierId
  points: number
  percentage: number
}

export type TierComparisonRow = {
  tier: ScoringTierId
  youPoints: number
  youPercentage: number
  groupAveragePercentage: number
}

export type ZeroPointsBreakdown = {
  points: number
  percentage: number
}

export type StatsViewModel = {
  hasFinishedRound: boolean
  positionSnapshots: PositionSnapshot[]
  tierBreakdown: TierBreakdownEntry[] | null
  zeroPointsBreakdown: ZeroPointsBreakdown | null
  tierComparison: TierComparisonRow[] | null
}

function groupFixturesByRound(
  fixtures: FixtureData[]
): Map<string, FixtureData[]> {
  const byRound = new Map<string, FixtureData[]>()

  for (const fixture of fixtures) {
    const round = fixture.league.round
    const existing = byRound.get(round) ?? []
    existing.push(fixture)
    byRound.set(round, existing)
  }

  return byRound
}

function isRoundFullyFinished(fixtures: FixtureData[]): boolean {
  if (fixtures.length === 0) return false

  return fixtures.every((fixture) =>
    STATUSES_FINISHED.includes(fixture.fixture.status.short)
  )
}

export function rankLeadTotals(
  players: PlayersData[],
  totalsByUserBolaoId: Map<string, number>
): PositionRankEntry[] {
  const entries = players.map((player) => ({
    userBolaoId: player.userBolaoId,
    name: player.username || getEmailUsername(player.email),
    total: totalsByUserBolaoId.get(player.userBolaoId) ?? 0,
  }))

  entries.sort((a, b) => b.total - a.total)

  return entries.map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }))
}

function snapshotFromFixtures({
  label,
  isSeasonEnd,
  players,
  fixtures,
  bets,
  championPicks = [],
  leagueWinnerTeamId = null,
}: {
  label: string
  isSeasonEnd: boolean
  players: PlayersData[]
  fixtures: FixtureData[]
  bets: Bet[]
  championPicks?: ChampionPick[]
  leagueWinnerTeamId?: number | null
}): PositionSnapshot {
  const lead = calcLead({
    players,
    fixtures,
    bets,
    championPicks: isSeasonEnd ? championPicks : [],
    leagueWinnerTeamId: isSeasonEnd ? leagueWinnerTeamId : null,
  })

  const totals = new Map<string, number>()
  players.forEach((player, index) => {
    totals.set(player.userBolaoId, lead[index]?.total ?? 0)
  })

  return {
    label,
    isSeasonEnd,
    ranks: rankLeadTotals(players, totals),
  }
}

export function buildPositionSnapshots({
  players,
  fixtures,
  bets,
  allRounds,
  championPicks = [],
  leagueWinnerTeamId = null,
  seasonEndLabel,
}: {
  players: PlayersData[]
  fixtures: FixtureData[]
  bets: Bet[]
  allRounds: string[]
  championPicks?: ChampionPick[]
  leagueWinnerTeamId?: number | null
  seasonEndLabel: string
}): PositionSnapshot[] {
  const fixturesByRound = groupFixturesByRound(fixtures)
  const snapshots: PositionSnapshot[] = []
  let cumulativeFixtures: FixtureData[] = []

  for (const roundName of allRounds) {
    const roundFixtures = fixturesByRound.get(roundName) ?? []
    if (roundFixtures.length === 0) continue

    if (!isRoundFullyFinished(roundFixtures)) break

    cumulativeFixtures = sortFixtures([
      ...cumulativeFixtures,
      ...roundFixtures,
    ])

    snapshots.push(
      snapshotFromFixtures({
        label: roundName,
        isSeasonEnd: false,
        players,
        fixtures: cumulativeFixtures,
        bets,
      })
    )
  }

  const roundSnapshots = snapshots.filter((snapshot) => !snapshot.isSeasonEnd)

  if (leagueWinnerTeamId !== null && roundSnapshots.length > 0) {
    snapshots.push(
      snapshotFromFixtures({
        label: seasonEndLabel,
        isSeasonEnd: true,
        players,
        fixtures: cumulativeFixtures,
        bets,
        championPicks,
        leagueWinnerTeamId,
      })
    )
  }

  return snapshots
}

function accumulateMemberTierPoints({
  fixtures,
  bets,
  userBolaoId,
}: {
  fixtures: FixtureData[]
  bets: Bet[]
  userBolaoId: string
}) {
  const pointsByTier = new Map<ScoringTierId, number>(
    SCORING_TIER_IDS.map((tier) => [tier, 0])
  )
  let zeroPointFixtures = 0
  let finishedBetFixtures = 0

  for (const fixtureData of fixtures) {
    if (!STATUSES_FINISHED.includes(fixtureData.fixture.status.short)) continue

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

    if (homeBetObj?.value === undefined || awayBetObj?.value === undefined) {
      continue
    }

    finishedBetFixtures++

    const { resultHome, resultAway } = getFixtureResultScores(
      fixtureData,
      fixtureData.fixture.status.short
    )

    const scoreArgs = {
      resultHome,
      resultAway,
      betHome: homeBetObj.value,
      betAway: awayBetObj.value,
    }

    const tier = classifyScoringTier(scoreArgs)
    const points = calcScore(scoreArgs)

    if (!tier || points === 0) {
      zeroPointFixtures++
      continue
    }

    pointsByTier.set(tier, (pointsByTier.get(tier) ?? 0) + points)
  }

  return { pointsByTier, zeroPointFixtures, finishedBetFixtures }
}

export function buildZeroPointsBreakdown({
  fixtures,
  bets,
  userBolaoId,
}: {
  fixtures: FixtureData[]
  bets: Bet[]
  userBolaoId: string
}): ZeroPointsBreakdown {
  const { zeroPointFixtures, finishedBetFixtures } = accumulateMemberTierPoints({
    fixtures,
    bets,
    userBolaoId,
  })

  return {
    points: 0,
    percentage:
      finishedBetFixtures > 0
        ? (zeroPointFixtures / finishedBetFixtures) * 100
        : 0,
  }
}

export function buildTierBreakdownFull({
  fixtures,
  bets,
  userBolaoId,
}: {
  fixtures: FixtureData[]
  bets: Bet[]
  userBolaoId: string
}): TierBreakdownEntry[] {
  const { pointsByTier } = accumulateMemberTierPoints({
    fixtures,
    bets,
    userBolaoId,
  })

  const totalPoints = SCORING_TIER_IDS.reduce(
    (sum, tier) => sum + (pointsByTier.get(tier) ?? 0),
    0
  )

  return SCORING_TIER_IDS.map((tier) => {
    const points = pointsByTier.get(tier) ?? 0
    return {
      tier,
      points,
      percentage: totalPoints > 0 ? (points / totalPoints) * 100 : 0,
    }
  })
}

export function buildTierBreakdown({
  fixtures,
  bets,
  userBolaoId,
}: {
  fixtures: FixtureData[]
  bets: Bet[]
  userBolaoId: string
}): TierBreakdownEntry[] {
  return buildTierBreakdownFull({ fixtures, bets, userBolaoId }).filter(
    (entry) => entry.points > 0
  )
}

export function buildGroupAverageTierBreakdown({
  players,
  fixtures,
  bets,
}: {
  players: PlayersData[]
  fixtures: FixtureData[]
  bets: Bet[]
}): TierBreakdownEntry[] {
  if (players.length === 0) return []

  const allBreakdowns = players.map((player) =>
    buildTierBreakdownFull({
      fixtures,
      bets,
      userBolaoId: player.userBolaoId,
    })
  )

  return SCORING_TIER_IDS.map((tier) => {
    const averagePercentage =
      allBreakdowns.reduce(
        (sum, breakdown) =>
          sum + (breakdown.find((entry) => entry.tier === tier)?.percentage ?? 0),
        0
      ) / players.length

    return {
      tier,
      points: 0,
      percentage: averagePercentage,
    }
  }).filter((entry) => entry.percentage > 0)
}

export function buildTierComparison({
  players,
  fixtures,
  bets,
  currentUserBolaoId,
}: {
  players: PlayersData[]
  fixtures: FixtureData[]
  bets: Bet[]
  currentUserBolaoId: string
}): TierComparisonRow[] {
  if (players.length < 2) return []

  const userBreakdown = buildTierBreakdownFull({
    fixtures,
    bets,
    userBolaoId: currentUserBolaoId,
  })
  const groupAverage = buildGroupAverageTierBreakdown({
    players,
    fixtures,
    bets,
  })

  const tiers = new Set<ScoringTierId>()
  for (const entry of userBreakdown) {
    if (entry.points > 0) tiers.add(entry.tier)
  }
  for (const entry of groupAverage) {
    if (entry.percentage > 0) tiers.add(entry.tier)
  }

  return SCORING_TIER_IDS.filter((tier) => tiers.has(tier)).map((tier) => ({
    tier,
    youPoints: userBreakdown.find((entry) => entry.tier === tier)?.points ?? 0,
    youPercentage:
      userBreakdown.find((entry) => entry.tier === tier)?.percentage ?? 0,
    groupAveragePercentage:
      groupAverage.find((entry) => entry.tier === tier)?.percentage ?? 0,
  }))
}

export function buildStatsViewModel({
  players,
  fixtures,
  bets,
  allRounds,
  championPicks = [],
  leagueWinnerTeamId = null,
  seasonEndLabel,
  currentUserBolaoId = null,
}: {
  players: PlayersData[]
  fixtures: FixtureData[]
  bets: Bet[]
  allRounds: string[]
  championPicks?: ChampionPick[]
  leagueWinnerTeamId?: number | null
  seasonEndLabel: string
  currentUserBolaoId?: string | null
}): StatsViewModel {
  const positionSnapshots = buildPositionSnapshots({
    players,
    fixtures,
    bets,
    allRounds,
    championPicks,
    leagueWinnerTeamId,
    seasonEndLabel,
  })

  const hasFinishedRound = positionSnapshots.some(
    (snapshot) => !snapshot.isSeasonEnd
  )

  const tierBreakdown =
    hasFinishedRound && currentUserBolaoId
      ? buildTierBreakdownFull({
          fixtures,
          bets,
          userBolaoId: currentUserBolaoId,
        })
      : null

  const zeroPointsBreakdown =
    hasFinishedRound && currentUserBolaoId
      ? buildZeroPointsBreakdown({
          fixtures,
          bets,
          userBolaoId: currentUserBolaoId,
        })
      : null

  const tierComparison =
    hasFinishedRound && currentUserBolaoId
      ? buildTierComparison({
          players,
          fixtures,
          bets,
          currentUserBolaoId,
        })
      : null

  return {
    hasFinishedRound,
    positionSnapshots: hasFinishedRound ? positionSnapshots : [],
    tierBreakdown,
    zeroPointsBreakdown,
    tierComparison:
      tierComparison && tierComparison.length > 0 ? tierComparison : null,
  }
}
