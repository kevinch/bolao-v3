import { getTranslations } from "next-intl/server"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { StatsViewModel } from "@/app/lib/statsFactory"
import PositionEvolutionChart from "./positionEvolutionChart"
import TierChartsSection from "./tierChartsSection"
import { buildPlayerColors, getPlayerColor } from "./chartTheme"

type Props = {
  stats: StatsViewModel
}

async function StatsContent({ stats }: Props) {
  const t = await getTranslations("statsPage")

  if (!stats.hasFinishedRound) {
    return (
      <Card className="max-md:rounded-none max-md:border-0 max-md:shadow-none md:rounded-xl md:border-x md:shadow-sm">
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="flex items-center gap-2">
            {t("title")}
            <Badge variant="secondary">{t("beta")}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-6 text-sm text-muted-foreground">
          {t("emptyState")}
        </CardContent>
      </Card>
    )
  }

  // Reuse the member's line-chart color (assigned by their order in the first
  // snapshot) for the "You" bars and legend in the comparison chart.
  const firstRanks = stats.positionSnapshots[0]?.ranks ?? []
  const youIndex = firstRanks.findIndex(
    (entry) => entry.userBolaoId === stats.currentUserBolaoId
  )
  const playerColors = buildPlayerColors(firstRanks.length)
  const youColor =
    youIndex >= 0 ? getPlayerColor(playerColors, youIndex) : "hsl(221 83% 48%)"

  return (
    <div className="space-y-6">
      <Card className="max-md:rounded-none max-md:border-0 max-md:shadow-none md:rounded-xl md:border-x md:shadow-sm">
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="flex items-center gap-2">
            {t("title")}
            <Badge variant="secondary">{t("beta")}</Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {t("positionSubtitle")}
          </p>
        </CardHeader>
        <CardContent className="pb-6">
          <PositionEvolutionChart snapshots={stats.positionSnapshots} />
        </CardContent>
      </Card>

      {stats.tierBreakdown && stats.tierBreakdown.length > 0 && (
        <Card className="max-md:rounded-none max-md:border-0 max-md:shadow-none md:rounded-xl md:border-x md:shadow-sm">
          <CardContent className="p-4 pb-6 md:p-6">
            <TierChartsSection
              breakdown={stats.tierBreakdown}
              zeroPoints={stats.zeroPointsBreakdown}
              comparison={stats.tierComparison}
              youColor={youColor}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default StatsContent
