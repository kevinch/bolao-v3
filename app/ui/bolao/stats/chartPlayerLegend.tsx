import { getPlayerColor } from "./chartTheme"

type Props = {
  playerNames: string[]
  playerColors: string[]
  maxHeightClass?: string
}

function ChartPlayerLegend({
  playerNames,
  playerColors,
  maxHeightClass = "max-h-36",
}: Props) {
  if (playerNames.length === 0) return null

  const gridCols =
    playerNames.length > 30
      ? "sm:grid-cols-3 md:grid-cols-4"
      : "sm:grid-cols-3"

  return (
    <div
      className={`mt-3 overflow-y-auto rounded-md border border-border bg-muted/30 p-3 md:mx-4 ${maxHeightClass}`}
      aria-label="Player chart legend"
    >
      <ul className={`grid grid-cols-2 gap-x-4 gap-y-2 ${gridCols}`}>
        {playerNames.map((name, index) => {
          const color = getPlayerColor(playerColors, index)

          return (
            <li
              key={name}
              className="flex min-w-0 items-center gap-2 text-xs text-foreground"
            >
              <span
                className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: color }}
                aria-hidden
              />
              <span className="truncate" title={name}>
                {name}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default ChartPlayerLegend
