"use client"

import { useTranslations } from "next-intl"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  CHART_AXIS_STROKE,
  CHART_GRID_STROKE,
  CHART_TOOLTIP_BG,
  CHART_TOOLTIP_BORDER,
  TIER_BAR_COLORS,
} from "./chartTheme"
import {
  getTierChartHeight,
  TIER_CHART_MARGIN,
  TIER_GROUP_BAR_MAX_SIZE,
  TIER_Y_AXIS_WIDTH,
  type TierChartRow,
} from "./tierChartLayout"

const GROUP_AVERAGE_COLOR = "hsl(215 16% 62%)"

type Props = {
  rows: TierChartRow[]
}

function TierComparisonChart({ rows }: Props) {
  const t = useTranslations("statsPage")

  const chartData = rows.map((entry) => ({
    ...entry,
    label: t(`tiers.${entry.tier}`),
    groupAveragePercentage: entry.groupAveragePercentage ?? 0,
  }))

  return (
    <ResponsiveContainer
      width="100%"
      height={getTierChartHeight(rows.length, { withLegend: true })}
    >
      <BarChart
        data={chartData}
        layout="vertical"
        margin={TIER_CHART_MARGIN}
        barGap={2}
        barCategoryGap="18%"
      >
        <CartesianGrid
          stroke={CHART_GRID_STROKE}
          strokeDasharray="3 3"
          horizontal={false}
        />
        <XAxis
          type="number"
          domain={[0, 100]}
          tick={{ fontSize: 11, fill: CHART_AXIS_STROKE }}
          axisLine={{ stroke: CHART_GRID_STROKE }}
          tickLine={{ stroke: CHART_GRID_STROKE }}
          tickFormatter={(value) => `${value}%`}
        />
        <YAxis
          type="category"
          dataKey="label"
          width={TIER_Y_AXIS_WIDTH}
          tick={{ fontSize: 10, fill: CHART_AXIS_STROKE }}
          axisLine={{ stroke: CHART_GRID_STROKE }}
          tickLine={{ stroke: CHART_GRID_STROKE }}
        />
        <Tooltip
          cursor={{ fill: "hsl(240 4.8% 95.9%)" }}
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null

            return (
              <div
                className="rounded-sm border px-3 py-2 text-xs shadow-md"
                style={{
                  backgroundColor: CHART_TOOLTIP_BG,
                  borderColor: CHART_TOOLTIP_BORDER,
                }}
              >
                <p className="mb-2 font-medium text-foreground">{label}</p>
                <ul className="space-y-1 text-muted-foreground">
                  {payload.map((entry) => {
                    const key = String(entry.dataKey ?? "")
                    const value = Number(entry.value ?? 0)
                    const row = entry.payload as (typeof chartData)[number]

                    return (
                      <li key={key}>
                        {key === "youPercentage"
                          ? t("comparisonTooltipYou", {
                              percentage: value.toFixed(1),
                              points: String(row.youPoints),
                            })
                          : t("comparisonTooltipGroup", {
                              percentage: value.toFixed(1),
                            })}
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          }}
        />
        <Legend
          wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
          formatter={(value) =>
            value === "youPercentage"
              ? t("comparisonYou")
              : t("comparisonGroupAverage")
          }
        />
        <Bar
          dataKey="youPercentage"
          name="youPercentage"
          radius={0}
          maxBarSize={TIER_GROUP_BAR_MAX_SIZE}
        >
          {chartData.map((entry) => (
            <Cell key={`you-${entry.tier}`} fill={TIER_BAR_COLORS[entry.tier]} />
          ))}
        </Bar>
        <Bar
          dataKey="groupAveragePercentage"
          name="groupAveragePercentage"
          radius={0}
          maxBarSize={TIER_GROUP_BAR_MAX_SIZE}
          fill={GROUP_AVERAGE_COLOR}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

export default TierComparisonChart
