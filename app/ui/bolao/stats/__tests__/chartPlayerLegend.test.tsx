import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import ChartPlayerLegend from "../chartPlayerLegend"

describe("ChartPlayerLegend", () => {
  it("renders nothing when there are no players", () => {
    const { container } = render(
      <ChartPlayerLegend playerNames={[]} playerColors={[]} />
    )

    expect(container).toBeEmptyDOMElement()
  })

  it("renders a color swatch and truncated name per player", () => {
    render(
      <ChartPlayerLegend
        playerNames={["alice", "bob"]}
        playerColors={["hsl(221 83% 48%)", "hsl(0 84% 50%)"]}
      />
    )

    expect(screen.getByText("alice")).toBeInTheDocument()
    expect(screen.getByText("bob")).toBeInTheDocument()
    expect(screen.getByLabelText("Player chart legend")).toBeInTheDocument()
  })
})
