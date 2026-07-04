import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import StatsContent from "../statsContent"
import type { StatsViewModel } from "@/app/lib/statsFactory"

vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn(async () => (key: string) => key),
}))

vi.mock("../positionEvolutionChart", () => ({
  default: () => <div data-testid="position-evolution-chart" />,
}))

vi.mock("../tierChartsSection", () => ({
  default: (props: {
    breakdown: unknown
    comparison: unknown
  }) => (
    <div
      data-testid="tier-charts-section"
      data-has-breakdown={String(Boolean(props.breakdown))}
      data-has-comparison={String(Boolean(props.comparison))}
    />
  ),
}))

async function renderStatsContent(stats: StatsViewModel) {
  const Component = await StatsContent({ stats })
  return render(Component)
}

describe("StatsContent", () => {
  it("shows empty state before any finished round", async () => {
    await renderStatsContent({
      hasFinishedRound: false,
      positionSnapshots: [],
      tierBreakdown: null,
      zeroPointsBreakdown: null,
      tierComparison: null,
    })

    expect(screen.getByText("title")).toBeInTheDocument()
    expect(screen.getByText("beta")).toBeInTheDocument()
    expect(screen.getByText("emptyState")).toBeInTheDocument()
    expect(screen.queryByTestId("position-evolution-chart")).not.toBeInTheDocument()
  })

  it("renders charts when finished rounds exist", async () => {
    await renderStatsContent({
      hasFinishedRound: true,
      positionSnapshots: [
        {
          label: "Group Stage - 1",
          isSeasonEnd: false,
          ranks: [],
        },
      ],
      tierBreakdown: [{ tier: "exact", points: 200, percentage: 100 }],
      zeroPointsBreakdown: { points: 0, percentage: 0 },
      tierComparison: [
        {
          tier: "exact",
          youPoints: 200,
          youPercentage: 100,
          groupAveragePercentage: 50,
        },
      ],
    })

    expect(screen.getByTestId("position-evolution-chart")).toBeInTheDocument()
    expect(screen.getByTestId("tier-charts-section")).toHaveAttribute(
      "data-has-breakdown",
      "true"
    )
    expect(screen.getByTestId("tier-charts-section")).toHaveAttribute(
      "data-has-comparison",
      "true"
    )
  })

  it("hides tier section when breakdown is empty", async () => {
    await renderStatsContent({
      hasFinishedRound: true,
      positionSnapshots: [
        {
          label: "Group Stage - 1",
          isSeasonEnd: false,
          ranks: [],
        },
      ],
      tierBreakdown: null,
      zeroPointsBreakdown: null,
      tierComparison: null,
    })

    expect(screen.getByTestId("position-evolution-chart")).toBeInTheDocument()
    expect(screen.queryByTestId("tier-charts-section")).not.toBeInTheDocument()
  })
})
