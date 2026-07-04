import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import TierChartsSection from "../tierChartsSection"
import type { TierBreakdownEntry, TierComparisonRow } from "@/app/lib/statsFactory"

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}))

vi.mock("../tierBreakdownList", () => ({
  default: ({ rows }: { rows: { tier: string }[] }) => (
    <div data-testid="tier-breakdown-list" data-row-count={rows.length} />
  ),
}))

vi.mock("../tierComparisonChart", () => ({
  default: ({ rows }: { rows: { tier: string }[] }) => (
    <div data-testid="tier-comparison-chart" data-row-count={rows.length} />
  ),
}))

describe("TierChartsSection", () => {
  const breakdown: TierBreakdownEntry[] = [
    { tier: "exact", points: 200, percentage: 100 },
    { tier: "winnerScore", points: 0, percentage: 0 },
    { tier: "draw", points: 0, percentage: 0 },
    { tier: "winnerLoser", points: 0, percentage: 0 },
    { tier: "goalDiff", points: 0, percentage: 0 },
    { tier: "winnerOnly", points: 0, percentage: 0 },
  ]

  const comparison: TierComparisonRow[] = [
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
  ]

  it("renders the personal breakdown list with all tiers and zero points", () => {
    render(
      <TierChartsSection
        breakdown={breakdown}
        zeroPoints={{ points: 0, percentage: 0 }}
        comparison={null}
      />
    )

    expect(screen.getByText("tierTitle")).toBeInTheDocument()
    expect(screen.getByText("tierSubtitle")).toBeInTheDocument()
    expect(screen.getByTestId("tier-breakdown-list")).toHaveAttribute(
      "data-row-count",
      "7"
    )
    expect(screen.queryByTestId("tier-comparison-chart")).not.toBeInTheDocument()
  })

  it("renders comparison chart with aligned row count", () => {
    render(
      <TierChartsSection
        breakdown={breakdown}
        zeroPoints={{ points: 0, percentage: 0 }}
        comparison={comparison}
      />
    )

    expect(screen.getByText("tierComparisonTitle")).toBeInTheDocument()
    expect(screen.getByTestId("tier-breakdown-list")).toHaveAttribute(
      "data-row-count",
      "7"
    )
    expect(screen.getByTestId("tier-comparison-chart")).toHaveAttribute(
      "data-row-count",
      "2"
    )
  })
})
