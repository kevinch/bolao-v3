import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
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

  it("toggles a player and reflects the hidden state", () => {
    const onToggle = vi.fn()
    render(
      <ChartPlayerLegend
        playerNames={["alice", "bob"]}
        playerColors={["hsl(221 83% 48%)", "hsl(0 84% 50%)"]}
        hiddenPlayers={new Set(["bob"])}
        onToggle={onToggle}
      />
    )

    const aliceButton = screen.getByRole("button", { name: /alice/i })
    const bobButton = screen.getByRole("button", { name: /bob/i })

    // aria-pressed is true for visible players, false for hidden ones.
    expect(aliceButton).toHaveAttribute("aria-pressed", "true")
    expect(bobButton).toHaveAttribute("aria-pressed", "false")

    fireEvent.click(aliceButton)
    expect(onToggle).toHaveBeenCalledWith("alice")
  })
})
