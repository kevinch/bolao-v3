import type { ScoringTierId } from "@/app/lib/definitions"
import { SCORING_TIER_IDS } from "@/app/lib/scoresCalcFactory"
import type { TierBreakdownEntry, TierComparisonRow, ZeroPointsBreakdown } from "@/app/lib/statsFactory"

export const TIER_Y_AXIS_WIDTH = 148
export const TIER_CHART_MARGIN = { top: 8, right: 16, left: 4, bottom: 8 }
export const TIER_ROW_HEIGHT = 52
export const TIER_CHART_BASE_HEIGHT = 56
export const TIER_LEGEND_HEIGHT = 28
export const TIER_GROUP_BAR_MAX_SIZE = 14

export type TierChartRow = {
  tier: ScoringTierId
  youPoints: number
  youPercentage: number
  groupAveragePercentage: number | null
}

export type TierBreakdownDisplayRow = {
  tier: ScoringTierId | "zeroPoints"
  youPoints: number
  youPercentage: number
}

export function buildTierBreakdownListRows(
  breakdown: TierBreakdownEntry[],
  zeroPoints?: ZeroPointsBreakdown | null
): TierBreakdownDisplayRow[] {
  const byTier = new Map(breakdown.map((entry) => [entry.tier, entry]))

  const rows: TierBreakdownDisplayRow[] = SCORING_TIER_IDS.map((tier) => ({
    tier,
    youPoints: byTier.get(tier)?.points ?? 0,
    youPercentage: byTier.get(tier)?.percentage ?? 0,
  }))

  if (zeroPoints) {
    rows.push({
      tier: "zeroPoints",
      youPoints: zeroPoints.points,
      youPercentage: zeroPoints.percentage,
    })
  }

  return rows
}

export function mergeTierChartRows({
  breakdown,
  comparison,
}: {
  breakdown: TierBreakdownEntry[]
  comparison?: TierComparisonRow[] | null
}): TierChartRow[] {
  const byTier = new Map<ScoringTierId, TierChartRow>()

  for (const entry of breakdown) {
    byTier.set(entry.tier, {
      tier: entry.tier,
      youPoints: entry.points,
      youPercentage: entry.percentage,
      groupAveragePercentage: null,
    })
  }

  for (const row of comparison ?? []) {
    byTier.set(row.tier, {
      tier: row.tier,
      youPoints: row.youPoints,
      youPercentage: row.youPercentage,
      groupAveragePercentage: row.groupAveragePercentage,
    })
  }

  return SCORING_TIER_IDS.filter((tier) =>
    comparison?.some((row) => row.tier === tier)
  ).map((tier) => byTier.get(tier)!)
}

export function getTierChartHeight(
  rowCount: number,
  options?: { withLegend?: boolean }
): number {
  const legendHeight = options?.withLegend ? TIER_LEGEND_HEIGHT : 0
  return Math.max(
    280,
    TIER_CHART_BASE_HEIGHT + rowCount * TIER_ROW_HEIGHT + legendHeight
  )
}
