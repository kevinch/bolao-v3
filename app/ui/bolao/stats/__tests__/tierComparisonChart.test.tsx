import { render, screen, within } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import TierComparisonChart from "../tierComparisonChart"
import type { TierChartRow } from "../tierChartLayout"

type TooltipProps = {
  content?: (props: {
    active?: boolean
    payload?: Array<{
      dataKey?: string
      value?: number
      payload?: Record<string, unknown>
    }>
    label?: string
  }) => React.ReactNode
}

const sampleTooltipPayload = [
  {
    dataKey: "youPercentage",
    value: 100,
    payload: {
      tier: "exact",
      label: "Exact score (200)",
      youPoints: 200,
      youPercentage: 100,
      groupAveragePercentage: 50,
    },
  },
  {
    dataKey: "groupAveragePercentage",
    value: 50,
    payload: {
      tier: "exact",
      label: "Exact score (200)",
      youPoints: 200,
      youPercentage: 100,
      groupAveragePercentage: 50,
    },
  },
]

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  BarChart: ({
    children,
    data,
  }: {
    children: React.ReactNode
    data: Array<{ groupAveragePercentage: number }>
  }) => (
    <div
      data-testid="bar-chart"
      data-row-count={data.length}
      data-first-group-average={String(data[0]?.groupAveragePercentage ?? "")}
    >
      {children}
    </div>
  ),
  CartesianGrid: () => null,
  XAxis: ({
    tickFormatter,
  }: {
    tickFormatter?: (value: number) => string
  }) => <div data-testid="x-axis">{tickFormatter?.(75)}</div>,
  YAxis: () => null,
  Tooltip: ({ content }: TooltipProps) => (
    <div data-testid="tooltip">
      <div data-testid="tooltip-inactive">
        {content?.({
          active: false,
          payload: sampleTooltipPayload,
          label: "Exact score (200)",
        })}
      </div>
      <div data-testid="tooltip-empty">
        {content?.({
          active: true,
          payload: [],
          label: "Exact score (200)",
        })}
      </div>
      <div data-testid="tooltip-active">
        {content?.({
          active: true,
          payload: sampleTooltipPayload,
          label: "Exact score (200)",
        })}
      </div>
      <div data-testid="tooltip-fallback">
        {content?.({
          active: true,
          payload: [{ payload: sampleTooltipPayload[0].payload }],
          label: "Exact score (200)",
        })}
      </div>
    </div>
  ),
  Legend: ({
    formatter,
  }: {
    formatter?: (value: string) => React.ReactNode
  }) => (
    <div data-testid="legend">
      <span data-testid="legend-you">{formatter?.("youPercentage")}</span>
      <span data-testid="legend-group">
        {formatter?.("groupAveragePercentage")}
      </span>
    </div>
  ),
  Bar: ({
    children,
    dataKey,
  }: {
    children?: React.ReactNode
    dataKey?: string
  }) => (
    <div data-testid={`bar-${dataKey}`}>{children}</div>
  ),
  Cell: ({ fill }: { fill?: string }) => (
    <span data-testid="bar-cell" data-fill={fill} />
  ),
}))

describe("TierComparisonChart", () => {
  const rows: TierChartRow[] = [
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
      groupAveragePercentage: 25,
    },
  ]

  it("renders a grouped bar chart with comparison rows", () => {
    render(<TierComparisonChart rows={rows} />)

    expect(screen.getByTestId("responsive-container")).toBeInTheDocument()
    expect(screen.getByTestId("bar-chart")).toHaveAttribute("data-row-count", "2")
  })

  it("defaults missing group averages to zero in chart data", () => {
    render(
      <TierComparisonChart
        rows={[
          {
            tier: "exact",
            youPoints: 200,
            youPercentage: 100,
            groupAveragePercentage: null,
          },
        ]}
      />
    )

    expect(screen.getByTestId("bar-chart")).toHaveAttribute(
      "data-first-group-average",
      "0"
    )
  })

  it("formats x-axis ticks as percentages", () => {
    render(<TierComparisonChart rows={rows} />)

    expect(screen.getByTestId("x-axis")).toHaveTextContent("75%")
  })

  it("renders legend labels for you and group average", () => {
    render(<TierComparisonChart rows={rows} />)

    expect(screen.getByTestId("legend-you")).toHaveTextContent("You")
    expect(screen.getByTestId("legend-group")).toHaveTextContent("Group average")
  })

  it("returns null for inactive or empty tooltip states", () => {
    render(<TierComparisonChart rows={rows} />)

    expect(within(screen.getByTestId("tooltip-inactive")).queryByRole("list")).toBeNull()
    expect(within(screen.getByTestId("tooltip-empty")).queryByRole("list")).toBeNull()
  })

  it("renders tooltip rows for you and group average", () => {
    render(<TierComparisonChart rows={rows} />)

    const tooltip = within(screen.getByTestId("tooltip-active"))

    expect(tooltip.getByText("Exact score (200)")).toBeInTheDocument()
    expect(tooltip.getByText("You: 100.0% (200 pts)")).toBeInTheDocument()
    expect(tooltip.getByText("Group average: 50.0%")).toBeInTheDocument()
  })

  it("falls back to group tooltip when payload keys are missing", () => {
    render(<TierComparisonChart rows={rows} />)

    const tooltip = within(screen.getByTestId("tooltip-fallback"))

    expect(tooltip.getByText("Group average: 0.0%")).toBeInTheDocument()
  })

  it("renders tier-colored cells for the you bar series", () => {
    render(<TierComparisonChart rows={rows} />)

    const cells = within(screen.getByTestId("bar-youPercentage")).getAllByTestId(
      "bar-cell"
    )

    expect(cells).toHaveLength(2)
    expect(cells[0]).toHaveAttribute("data-fill", "hsl(221 83% 48%)")
    expect(cells[1]).toHaveAttribute("data-fill", "hsl(215 16% 47%)")
  })
})
