"use client"

import { useTranslations } from "next-intl"
import { CHART_AXIS_STROKE, TIER_BAR_COLORS } from "./chartTheme"
import type { TierBreakdownDisplayRow } from "./tierChartLayout"

type Props = {
  rows: TierBreakdownDisplayRow[]
}

function getRowColor(tier: TierBreakdownDisplayRow["tier"]) {
  if (tier === "zeroPoints") return CHART_AXIS_STROKE
  return TIER_BAR_COLORS[tier]
}

function TierBreakdownList({ rows }: Props) {
  const t = useTranslations("statsPage")

  return (
    <ul className="divide-y rounded-md border text-sm">
      {rows.map((row) => (
        <li
          key={row.tier}
          className="flex items-center justify-between gap-4 px-3 py-2.5"
        >
          <span className="flex min-w-0 items-center gap-2">
            <span
              className="inline-block h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: getRowColor(row.tier) }}
            />
            <span className="truncate">
              {row.tier === "zeroPoints"
                ? t("tiers.zeroPoints")
                : t(`tiers.${row.tier}`)}
            </span>
          </span>
          <span className="flex shrink-0 items-baseline gap-2 tabular-nums">
            <span className="font-medium">
              {t("tierBreakdownPoints", { points: String(row.youPoints) })}
            </span>
            <span className="text-muted-foreground">
              {t(
                row.tier === "zeroPoints"
                  ? "tierBreakdownMissPercentage"
                  : "tierBreakdownPercentage",
                {
                  percentage: row.youPercentage.toFixed(1),
                }
              )}
            </span>
          </span>
        </li>
      ))}
    </ul>
  )
}

export default TierBreakdownList
