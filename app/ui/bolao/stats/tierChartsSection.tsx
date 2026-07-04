"use client"

import { useMemo } from "react"
import { useTranslations } from "next-intl"
import type {
  TierBreakdownEntry,
  TierComparisonRow,
  ZeroPointsBreakdown,
} from "@/app/lib/statsFactory"
import TierBreakdownList from "./tierBreakdownList"
import TierComparisonChart from "./tierComparisonChart"
import { buildTierBreakdownListRows, mergeTierChartRows } from "./tierChartLayout"

type Props = {
  breakdown: TierBreakdownEntry[]
  zeroPoints?: ZeroPointsBreakdown | null
  comparison?: TierComparisonRow[] | null
}

function TierChartsSection({ breakdown, zeroPoints, comparison }: Props) {
  const t = useTranslations("statsPage")

  const breakdownRows = useMemo(
    () => buildTierBreakdownListRows(breakdown, zeroPoints),
    [breakdown, zeroPoints]
  )

  const comparisonRows = useMemo(
    () => mergeTierChartRows({ breakdown, comparison }),
    [breakdown, comparison]
  )

  const showComparison = Boolean(comparison && comparison.length > 0)

  return (
    <div className="space-y-10">
      <section>
        <h4 className="text-sm font-medium">{t("tierTitle")}</h4>
        <p className="mt-1 mb-4 text-sm text-muted-foreground">
          {t("tierSubtitle")}
        </p>
        <TierBreakdownList rows={breakdownRows} />
      </section>

      {showComparison && (
        <section>
          <h4 className="text-sm font-medium">{t("tierComparisonTitle")}</h4>
          <p className="mt-1 mb-4 text-sm text-muted-foreground">
            {t("tierComparisonSubtitle")}
          </p>
          <TierComparisonChart rows={comparisonRows} />
        </section>
      )}
    </div>
  )
}

export default TierChartsSection
