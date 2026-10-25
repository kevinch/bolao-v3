import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import AdminUsageDashboard from "../adminUsageDashboard"
import enMessages from "@/messages/en.json"
import ptBrMessages from "@/messages/pt-br.json"

vi.mock("@/components/ui/select", () => ({
  Select: ({
    value,
    onValueChange,
  }: {
    value: string
    onValueChange: (value: string) => void
  }) => (
    <select
      aria-label="Period"
      value={value}
      onChange={(event) => onValueChange(event.target.value)}
    >
      <option value="6">6 months</option>
      <option value="12">12 months</option>
      <option value="24">24 months</option>
    </select>
  ),
  SelectContent: () => null,
  SelectItem: () => null,
  SelectTrigger: () => null,
  SelectValue: () => null,
}))

function makeData() {
  const monthly = Array.from({ length: 24 }, (_, index) => {
    const date = new Date(2024, 10 + index, 1)
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
    return {
      month,
      label: `${date.toLocaleDateString("en", { month: "short" })} ${String(date.getFullYear()).slice(-2)}`,
      count: 0,
      members: 0,
    }
  })

  monthly[0] = { ...monthly[0], count: 5, members: 10 }
  monthly[12] = { ...monthly[12], count: 4, members: 8 }
  monthly[18] = { ...monthly[18], count: 2, members: 4 }
  monthly[19] = { ...monthly[19], count: 1, members: 3 }

  return {
    summary: { totalBoloes: 106, totalUsers: 17 },
    monthly,
    competitions: [
      {
        id: "world-cup",
        month: monthly[0].month,
        name: "World Cup",
        country: "World",
        count: 5,
      },
      {
        id: "euro",
        month: monthly[12].month,
        name: "Euro Championship",
        country: "World",
        count: 4,
      },
      {
        id: "serie-a",
        month: monthly[19].month,
        name: "Serie A",
        country: "Brazil",
        count: 1,
      },
    ],
  }
}

describe("AdminUsageDashboard", () => {
  it("has matching translation keys for every supported locale", () => {
    expect(Object.keys(ptBrMessages.adminUsage).sort()).toEqual(
      Object.keys(enMessages.adminUsage).sort()
    )
  })

  it("shows six-month metrics and championships by default", () => {
    render(<AdminUsageDashboard data={makeData()} />)

    expect(screen.getByText("Total bolões (all-time)")).toBeInTheDocument()
    expect(screen.getByText("106")).toBeInTheDocument()
    expect(screen.getByText("Bolões created (6 months)")).toBeInTheDocument()
    expect(screen.getByText("3", { selector: "p" })).toBeInTheDocument()
    expect(
      screen.getByText("Average members per bolão (6 months)")
    ).toBeInTheDocument()
    expect(screen.getByText("2.3")).toBeInTheDocument()
    expect(screen.getByText("Serie A")).toBeInTheDocument()
    expect(screen.getByText("Brazil")).toBeInTheDocument()
    expect(screen.queryByText("World Cup")).not.toBeInTheDocument()
  })

  it("updates the creation totals, average and championships for the selected period", async () => {
    const user = userEvent.setup()
    render(<AdminUsageDashboard data={makeData()} />)

    await user.selectOptions(screen.getByRole("combobox", { name: "Period" }), "12")

    expect(screen.getByText("Bolões created (12 months)")).toBeInTheDocument()
    expect(screen.getByText("7", { selector: "p" })).toBeInTheDocument()
    expect(screen.getByText("2.1")).toBeInTheDocument()
    expect(screen.getByText("Euro Championship")).toBeInTheDocument()
    expect(screen.getByText("Serie A")).toBeInTheDocument()
    expect(screen.queryByText("World Cup")).not.toBeInTheDocument()
  })

  it("shows all-time championship history when 24 months is selected", async () => {
    const user = userEvent.setup()
    render(<AdminUsageDashboard data={makeData()} />)

    await user.selectOptions(screen.getByRole("combobox", { name: "Period" }), "24")

    expect(screen.getByText("Bolões created (24 months)")).toBeInTheDocument()
    expect(screen.getByText("12", { selector: "p" })).toBeInTheDocument()
    expect(screen.getByText("World Cup")).toBeInTheDocument()
    expect(screen.getByText("Euro Championship")).toBeInTheDocument()
    expect(screen.getByText("Serie A")).toBeInTheDocument()
  })

  it("shows an empty-state and a zero average when the selected period has no activity", () => {
    const data = makeData()
    data.monthly = data.monthly.map((month) => ({ ...month, count: 0, members: 0 }))
    data.competitions = []

    render(<AdminUsageDashboard data={data} />)

    expect(screen.getByText("0", { selector: "p" })).toBeInTheDocument()
    expect(screen.getByText("0.0")).toBeInTheDocument()
    expect(screen.getByText("No bolões were created in this period.")).toBeInTheDocument()
  })
})
