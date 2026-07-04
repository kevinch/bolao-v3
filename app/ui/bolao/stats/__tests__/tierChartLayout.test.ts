import { describe, it, expect } from "vitest"
import { mergeTierChartRows, getTierChartHeight, buildTierBreakdownListRows } from "../tierChartLayout"

describe("tierChartLayout", () => {
  it("merges breakdown and comparison rows in tier order", () => {
    const rows = mergeTierChartRows({
      breakdown: [
        { tier: "exact", points: 200, percentage: 100 },
      ],
      comparison: [
        {
          tier: "exact",
          youPoints: 200,
          youPercentage: 100,
          groupAveragePercentage: 50,
        },
        {
          tier: "winnerOnly",
          youPoints: 0,
          youPercentage: 0,
          groupAveragePercentage: 50,
        },
      ],
    })

    expect(rows).toHaveLength(2)
    expect(rows[0]).toMatchObject({
      tier: "exact",
      youPoints: 200,
      youPercentage: 100,
      groupAveragePercentage: 50,
    })
    expect(rows[1]).toMatchObject({
      tier: "winnerOnly",
      youPoints: 0,
      youPercentage: 0,
      groupAveragePercentage: 50,
    })
  })

  it("adds legend height when requested", () => {
    expect(getTierChartHeight(4, { withLegend: true })).toBeGreaterThan(
      getTierChartHeight(4)
    )
  })

  it("builds breakdown list rows for all tiers plus zero points", () => {
    const rows = buildTierBreakdownListRows(
      [
        { tier: "exact", points: 200, percentage: 100 },
        { tier: "winnerScore", points: 0, percentage: 0 },
        { tier: "draw", points: 0, percentage: 0 },
        { tier: "winnerLoser", points: 0, percentage: 0 },
        { tier: "goalDiff", points: 0, percentage: 0 },
        { tier: "winnerOnly", points: 0, percentage: 0 },
      ],
      { points: 0, percentage: 25 }
    )

    expect(rows).toHaveLength(7)
    expect(rows[0]).toMatchObject({
      tier: "exact",
      youPoints: 200,
      youPercentage: 100,
    })
    expect(rows[6]).toEqual({
      tier: "zeroPoints",
      youPoints: 0,
      youPercentage: 25,
    })
  })
})
