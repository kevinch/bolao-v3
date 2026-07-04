"use client"

import { useTranslations } from "next-intl"
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { PositionSnapshot } from "@/app/lib/statsFactory"
import ChartPlayerLegend from "./chartPlayerLegend"
import ChartTooltip from "./chartTooltip"
import {
  CHART_AXIS_STROKE,
  CHART_GRID_STROKE,
  getPlayerColor,
} from "./chartTheme"
import { usePlayerColors } from "./usePlayerColors"

type Props = {
  snapshots: PositionSnapshot[]
}

function PositionEvolutionChart({ snapshots }: Props) {
  const t = useTranslations("statsPage")

  const playerNames = snapshots[0]?.ranks.map((entry) => entry.name) ?? []
  const playerColors = usePlayerColors(playerNames.length)

  const chartData = snapshots.map((snapshot) => {
    const point: Record<string, string | number> = {
      label: snapshot.label,
    }

    for (const rankEntry of snapshot.ranks) {
      point[rankEntry.name] = rankEntry.rank
    }

    return point
  })

  const chartHeight = playerNames.length > 12 ? 360 : 320
  const legendMaxHeight =
    playerNames.length > 30 ? "max-h-52" : playerNames.length > 18 ? "max-h-44" : "max-h-36"

  return (
    <div>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <LineChart
          data={chartData}
          margin={{ top: 8, right: 12, left: 4, bottom: 48 }}
        >
          <CartesianGrid stroke={CHART_GRID_STROKE} strokeDasharray="3 3" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: CHART_AXIS_STROKE }}
            axisLine={{ stroke: CHART_GRID_STROKE }}
            tickLine={{ stroke: CHART_GRID_STROKE }}
            interval={0}
            angle={-35}
            textAnchor="end"
            height={60}
          />
          <YAxis
            reversed
            allowDecimals={false}
            tick={{ fontSize: 11, fill: CHART_AXIS_STROKE }}
            axisLine={{ stroke: CHART_GRID_STROKE }}
            tickLine={{ stroke: CHART_GRID_STROKE }}
            label={{
              value: t("rankAxis"),
              angle: -90,
              position: "insideLeft",
              style: { fontSize: 11, fill: CHART_AXIS_STROKE },
            }}
          />
          <Tooltip
            content={
              <ChartTooltip
                playerNames={playerNames}
                playerColors={playerColors}
                valueLabel={(value) => t("rankValue", { rank: String(value) })}
                labelTitle={(label) => t("snapshotLabel", { label })}
              />
            }
          />
          {playerNames.map((name, index) => (
            <Line
              key={name}
              type="monotone"
              dataKey={name}
              stroke={getPlayerColor(playerColors, index)}
              strokeWidth={playerNames.length > 30 ? 2 : 2.5}
              dot={{
                r: playerNames.length > 30 ? 2 : 3,
                strokeWidth: 1.5,
                fill: getPlayerColor(playerColors, index),
              }}
              activeDot={{ r: 5, strokeWidth: 2 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      <ChartPlayerLegend
        playerNames={playerNames}
        playerColors={playerColors}
        maxHeightClass={legendMaxHeight}
      />
    </div>
  )
}

export default PositionEvolutionChart
