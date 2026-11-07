import { getPlayerColor } from "./chartTheme"

type Props = {
  playerNames: string[]
  playerColors: string[]
  hiddenPlayers?: Set<string>
  onToggle?: (name: string) => void
}

function ChartPlayerLegend({
  playerNames,
  playerColors,
  hiddenPlayers,
  onToggle,
}: Props) {
  if (playerNames.length === 0) return null

  const gridCols =
    playerNames.length > 30 ? "sm:grid-cols-3 md:grid-cols-4" : "sm:grid-cols-3"

  return (
    <div
      className="mt-3 rounded-md border border-border bg-muted/30 p-3 md:mx-4"
      aria-label="Player chart legend"
    >
      <ul className={`grid grid-cols-2 gap-x-4 gap-y-2 ${gridCols}`}>
        {playerNames.map((name, index) => {
          const color = getPlayerColor(playerColors, index)
          const hidden = hiddenPlayers?.has(name) ?? false

          return (
            <li key={name} className="flex min-w-0">
              <button
                type="button"
                onClick={() => onToggle?.(name)}
                aria-pressed={!hidden}
                className={`flex min-w-0 items-center gap-2 rounded text-xs transition-opacity hover:opacity-80 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring ${
                  hidden ? "text-muted-foreground" : "text-foreground"
                }`}
              >
                <span
                  className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{
                    backgroundColor: hidden ? "transparent" : color,
                    boxShadow: hidden
                      ? `inset 0 0 0 1.5px ${color}`
                      : undefined,
                  }}
                  aria-hidden
                />
                <span
                  className={`truncate ${hidden ? "line-through" : ""}`}
                  title={name}
                >
                  {name}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default ChartPlayerLegend
