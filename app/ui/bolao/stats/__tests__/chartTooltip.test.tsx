import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import ChartTooltip from "../chartTooltip"

describe("ChartTooltip", () => {
  const playerNames = ["alice", "bob"]
  const playerColors = ["hsl(0 100% 50%)", "hsl(120 100% 50%)"]
  const valueLabel = (value: string | number) => `${value} pts`
  const labelTitle = (label: string) => `Round: ${label}`

  it("returns null when inactive", () => {
    const { container } = render(
      <ChartTooltip
        active={false}
        payload={[{ name: "alice", value: 10 }]}
        label="R1"
        playerNames={playerNames}
        playerColors={playerColors}
        valueLabel={valueLabel}
        labelTitle={labelTitle}
      />
    )

    expect(container.firstChild).toBeNull()
  })

  it("returns null when payload is empty", () => {
    const { container } = render(
      <ChartTooltip
        active
        payload={[]}
        label="R1"
        playerNames={playerNames}
        playerColors={playerColors}
        valueLabel={valueLabel}
        labelTitle={labelTitle}
      />
    )

    expect(container.firstChild).toBeNull()
  })

  it("renders label and entries sorted by value ascending", () => {
    render(
      <ChartTooltip
        active
        payload={[
          { name: "bob", value: 50 },
          { name: "alice", value: 100 },
        ]}
        label="Group Stage - 1"
        playerNames={playerNames}
        playerColors={playerColors}
        valueLabel={valueLabel}
        labelTitle={labelTitle}
      />
    )

    expect(screen.getByText("Round: Group Stage - 1")).toBeInTheDocument()
    expect(screen.getByText("100 pts")).toBeInTheDocument()
    expect(screen.getByText("50 pts")).toBeInTheDocument()

    const items = screen.getAllByRole("listitem")
    expect(items[0]).toHaveTextContent("bob")
    expect(items[1]).toHaveTextContent("alice")
  })

  it("filters entries without values", () => {
    render(
      <ChartTooltip
        active
        payload={[
          { name: "alice", value: 10 },
          { name: "bob", value: undefined },
        ]}
        playerNames={playerNames}
        playerColors={playerColors}
        valueLabel={valueLabel}
        labelTitle={labelTitle}
      />
    )

    expect(screen.getByText("alice")).toBeInTheDocument()
    expect(screen.queryByText("bob")).not.toBeInTheDocument()
  })

  it("omits label when not provided", () => {
    render(
      <ChartTooltip
        active
        payload={[{ name: "alice", value: 10 }]}
        playerNames={playerNames}
        playerColors={playerColors}
        valueLabel={valueLabel}
        labelTitle={labelTitle}
      />
    )

    expect(screen.queryByText(/Round:/)).not.toBeInTheDocument()
    expect(screen.getByText("alice")).toBeInTheDocument()
  })
})
