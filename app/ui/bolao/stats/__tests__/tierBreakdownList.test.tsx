import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import TierBreakdownList from "../tierBreakdownList"
import type { TierBreakdownDisplayRow } from "../tierChartLayout"

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, values?: Record<string, string>) => {
    if (key.startsWith("tiers.")) return key.replace("tiers.", "")
    if (key === "tierBreakdownPoints") return `${values?.points} pts`
    if (key === "tierBreakdownPercentage") return `${values?.percentage}%`
    if (key === "tierBreakdownMissPercentage") return `${values?.percentage}% of bets`
    return key
  },
}))

describe("TierBreakdownList", () => {
  const rows: TierBreakdownDisplayRow[] = [
    {
      tier: "exact",
      youPoints: 200,
      youPercentage: 66.7,
    },
    {
      tier: "winnerOnly",
      youPoints: 100,
      youPercentage: 33.3,
    },
    {
      tier: "zeroPoints",
      youPoints: 0,
      youPercentage: 25,
    },
  ]

  it("renders tier labels with points and percentages", () => {
    render(<TierBreakdownList rows={rows} />)

    expect(screen.getByText("exact")).toBeInTheDocument()
    expect(screen.getByText("winnerOnly")).toBeInTheDocument()
    expect(screen.getByText("zeroPoints")).toBeInTheDocument()
    expect(screen.getByText("200 pts")).toBeInTheDocument()
    expect(screen.getByText("66.7%")).toBeInTheDocument()
    expect(screen.getByText("100 pts")).toBeInTheDocument()
    expect(screen.getByText("33.3%")).toBeInTheDocument()
    expect(screen.getByText("25.0% of bets")).toBeInTheDocument()
  })
})
