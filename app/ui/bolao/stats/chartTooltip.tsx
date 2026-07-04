import {
  CHART_TOOLTIP_BG,
  CHART_TOOLTIP_BORDER,
  getPlayerColor,
} from "./chartTheme"

type TooltipEntry = {
  name?: string | number
  value?: string | number
  color?: string
}

type ChartTooltipProps = {
  active?: boolean
  payload?: TooltipEntry[]
  label?: string | number
  playerNames: string[]
  playerColors: string[]
  valueLabel: (value: string | number) => string
  labelTitle: (label: string) => string
}

function ChartTooltip({
  active,
  payload,
  label,
  playerNames,
  playerColors,
  valueLabel,
  labelTitle,
}: ChartTooltipProps) {
  if (!active || !payload?.length) return null

  const labelText = label != null ? String(label) : ""

  return (
    <div
      className="min-w-[10rem] rounded-md border px-3 py-2 text-xs shadow-md"
      style={{
        backgroundColor: CHART_TOOLTIP_BG,
        borderColor: CHART_TOOLTIP_BORDER,
      }}
    >
      {labelText ? (
        <p className="mb-2 font-medium text-foreground">{labelTitle(labelText)}</p>
      ) : null}
      <ul className="space-y-1">
        {payload
          .filter((entry) => entry.value != null)
          .sort((a, b) => Number(a.value) - Number(b.value))
          .map((entry) => {
            const name = String(entry.name ?? "")
            const colorIndex = playerNames.indexOf(name)
            const color =
              colorIndex >= 0
                ? getPlayerColor(playerColors, colorIndex)
                : entry.color ?? CHART_TOOLTIP_BORDER

            return (
              <li
                key={name}
                className="flex items-center justify-between gap-3 text-foreground"
              >
                <span className="flex min-w-0 items-center gap-1.5">
                  <span
                    className="inline-block h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="truncate">{name}</span>
                </span>
                <span className="shrink-0 font-medium tabular-nums">
                  {valueLabel(entry.value as string | number)}
                </span>
              </li>
            )
          })}
      </ul>
    </div>
  )
}

export default ChartTooltip
