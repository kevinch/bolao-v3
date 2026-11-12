"use client"

import { useState } from "react"
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
  const [hiddenPlayers, setHiddenPlayers] = useState<Set<string>>(
    () => new Set()
  )

  const togglePlayer = (name: string) =>
    setHiddenPlayers((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })

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

  return (
    <div>
      <table className="sr-only">
        <caption>{t("positionTableCaption")}</caption>
        <thead>
          <tr>
            <th scope="col">{t("playerColumn")}</th>
            {chartData.map((point) => (
              <th scope="col" key={String(point.label)}>
                {String(point.label)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {playerNames.map((name) => (
            <tr key={name}>
              <th scope="row">{name}</th>
              {chartData.map((point) => (
                <td key={String(point.label)}>
                  {t("rankValue", { rank: String(point[name] ?? "-") })}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="md:mx-4" aria-hidden="true">
        <ResponsiveContainer width="100%" height={chartHeight}>
          <LineChart
            accessibilityLayer
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
                  valueLabel={(value) =>
                    t("rankValue", { rank: String(value) })
                  }
                  labelTitle={(label) => t("snapshotLabel", { label })}
                />
              }
            />
            {playerNames.map((name, index) => (
              <Line
                key={name}
                type="monotone"
                dataKey={name}
                hide={hiddenPlayers.has(name)}
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
      </div>
      <ChartPlayerLegend
        playerNames={playerNames}
        playerColors={playerColors}
        hiddenPlayers={hiddenPlayers}
        onToggle={togglePlayer}
      />
    </div>
  )
}

export default PositionEvolutionChart
