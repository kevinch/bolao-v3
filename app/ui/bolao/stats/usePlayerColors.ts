import { useMemo } from "react"
import { buildPlayerColors } from "./chartTheme"

export function usePlayerColors(playerCount: number): string[] {
  return useMemo(() => buildPlayerColors(playerCount), [playerCount])
}
