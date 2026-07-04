import type { ScoringTierId } from "@/app/lib/definitions"

export const CHART_GRID_STROKE = "hsl(240 5.9% 85%)"
export const CHART_AXIS_STROKE = "hsl(240 3.8% 46.1%)"
export const CHART_TOOLTIP_BG = "hsl(0 0% 100%)"
export const CHART_TOOLTIP_BORDER = "hsl(240 5.9% 82%)"

/** Semantic tier colors — ordered best → worst, all WCAG-friendly on white. */
export const TIER_BAR_COLORS: Record<ScoringTierId, string> = {
  exact: "hsl(221 83% 48%)",
  winnerScore: "hsl(142 71% 36%)",
  draw: "hsl(32 95% 44%)",
  winnerLoser: "hsl(271 81% 56%)",
  goalDiff: "hsl(189 94% 37%)",
  winnerOnly: "hsl(215 16% 47%)",
}

type ColorLayer = {
  saturation: number
  lightness: number
}

const COLOR_LAYERS: ColorLayer[] = [
  { saturation: 74, lightness: 44 },
  { saturation: 62, lightness: 52 },
  { saturation: 54, lightness: 38 },
]

/**
 * Builds N distinct line colors for white backgrounds.
 * Hues are evenly distributed; when count is high we add S/L layers
 * so 30–50+ players stay separable without repeating hues.
 */
export function buildPlayerColors(playerCount: number): string[] {
  if (playerCount <= 0) return []
  if (playerCount === 1) return ["hsl(221 83% 48%)"]

  const layerCount =
    playerCount > 36 ? 3 : playerCount > 18 ? 2 : 1
  const colors: string[] = []
  let assigned = 0

  for (let layer = 0; layer < layerCount && assigned < playerCount; layer++) {
    const remaining = playerCount - assigned
    const slotsInLayer = Math.ceil(remaining / (layerCount - layer))
    const { saturation, lightness } = COLOR_LAYERS[layer]
    const hueShift = layer * (360 / layerCount) * 0.45

    for (let slot = 0; slot < slotsInLayer && assigned < playerCount; slot++) {
      const hue = (hueShift + slot * (360 / slotsInLayer)) % 360
      colors.push(
        `hsl(${Math.round(hue)} ${saturation}% ${lightness}%)`
      )
      assigned++
    }
  }

  return colors
}

export function getPlayerColor(
  colors: string[],
  index: number
): string {
  return colors[index] ?? "hsl(215 16% 47%)"
}
