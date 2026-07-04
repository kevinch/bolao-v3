import { describe, it, expect } from "vitest"
import { buildPlayerColors } from "../chartTheme"

describe("buildPlayerColors", () => {
  it("returns an empty array for zero players", () => {
    expect(buildPlayerColors(0)).toEqual([])
  })

  it("returns one color for a single player", () => {
    expect(buildPlayerColors(1)).toHaveLength(1)
  })

  it("generates unique colors for 30 players", () => {
    const colors = buildPlayerColors(30)
    expect(colors).toHaveLength(30)
    expect(new Set(colors).size).toBe(30)
  })

  it("generates unique colors for 50 players", () => {
    const colors = buildPlayerColors(50)
    expect(colors).toHaveLength(50)
    expect(new Set(colors).size).toBe(50)
  })

  it("uses multiple lightness layers for large groups", () => {
    const colors = buildPlayerColors(50)
    const lightnessValues = colors.map((color) => {
      const match = color.match(/(\d+)%\)$/)
      return match ? Number(match[1]) : 0
    })

    expect(new Set(lightnessValues).size).toBeGreaterThan(1)
  })
})
