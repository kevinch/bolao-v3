import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import PositionEvolutionChart from "../positionEvolutionChart"
import type { PositionSnapshot } from "@/app/lib/statsFactory"

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}))

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  LineChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="line-chart">{children}</div>
  ),
  CartesianGrid: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  Line: () => null,
}))

describe("PositionEvolutionChart", () => {
  const snapshots: PositionSnapshot[] = [
    {
      label: "Group Stage - 1",
      isSeasonEnd: false,
      ranks: [
        { userBolaoId: "ub-1", name: "alice", rank: 1, total: 200 },
        { userBolaoId: "ub-2", name: "bob", rank: 2, total: 0 },
      ],
    },
  ]

  it("renders chart and player legend", () => {
    render(<PositionEvolutionChart snapshots={snapshots} />)

    expect(screen.getByTestId("responsive-container")).toBeInTheDocument()
    expect(screen.getByTestId("line-chart")).toBeInTheDocument()
    expect(screen.getByText("alice")).toBeInTheDocument()
    expect(screen.getByText("bob")).toBeInTheDocument()
  })
})
