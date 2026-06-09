import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi, beforeEach } from "vitest"
import ChampionPickSelector from "../championPickSelector"
import type { ChampionPick, ChampionTeam } from "@/app/lib/definitions"

const mockCreateOrUpdateChampionPick = vi.fn()

vi.mock("@/app/lib/actions", () => ({
  createOrUpdateChampionPick: (...args: unknown[]) =>
    mockCreateOrUpdateChampionPick(...args),
}))

const mockToast = vi.fn()

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: mockToast }),
}))

vi.mock("@/components/ui/select", () => ({
  Select: ({
    value,
    onValueChange,
    disabled,
    children,
  }: {
    value?: string
    onValueChange: (value: string) => void
    disabled?: boolean
    children: React.ReactNode
  }) => (
    <select
      aria-label="Select championship winner"
      value={value ?? ""}
      disabled={disabled}
      onChange={(event) => onValueChange(event.target.value)}
    >
      {children}
    </select>
  ),
  SelectTrigger: () => null,
  SelectValue: () => null,
  SelectContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectItem: ({
    value,
    children,
  }: {
    value: string
    children: React.ReactNode
  }) => <option value={value}>{children}</option>,
}))

describe("ChampionPickSelector", () => {
  const teams: ChampionTeam[] = [
    { id: 10, name: "Brazil", logo: "brazil.png" },
    { id: 20, name: "Mexico", logo: "mexico.png" },
  ]

  const baseProps = {
    bolaoId: "bolao-1",
    userBolaoId: "ub-1",
    teams,
    userChampionPick: null,
    isLocked: false,
    lockDate: new Date("2026-06-11T19:00:00Z"),
    leagueWinnerTeamId: null,
    locale: "en",
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateOrUpdateChampionPick.mockResolvedValue({ success: true })
  })

  it("renders label and team options", () => {
    render(<ChampionPickSelector {...baseProps} />)

    expect(screen.getByText("Winner (+500 pts)")).toBeInTheDocument()
    expect(screen.getByRole("option", { name: "Brazil" })).toBeInTheDocument()
    expect(screen.getByRole("option", { name: "Mexico" })).toBeInTheDocument()
  })

  it("calls createOrUpdateChampionPick when a team is selected", async () => {
    const user = userEvent.setup()
    render(<ChampionPickSelector {...baseProps} />)

    await user.selectOptions(
      screen.getByLabelText("Select championship winner"),
      "10"
    )

    expect(mockCreateOrUpdateChampionPick).toHaveBeenCalledWith({
      userBolaoId: "ub-1",
      bolaoId: "bolao-1",
      teamId: 10,
      teamName: "Brazil",
      teamLogo: "brazil.png",
    })
  })

  it("hides the selector when locked", () => {
    const { container } = render(
      <ChampionPickSelector {...baseProps} isLocked={true} />
    )

    expect(container).toBeEmptyDOMElement()
  })

  it("returns null when there are no teams", () => {
    const { container } = render(
      <ChampionPickSelector {...baseProps} teams={[]} />
    )

    expect(container).toBeEmptyDOMElement()
  })

  it("shows success toast when pick is saved", async () => {
    const user = userEvent.setup()
    render(<ChampionPickSelector {...baseProps} />)

    await user.selectOptions(
      screen.getByLabelText("Select championship winner"),
      "10"
    )

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: "success",
        title: "Pick saved",
        description: "Brazil is your championship winner pick.",
      })
    )
    expect(screen.getByText(/You picked Brazil/)).toBeInTheDocument()
  })

  it("shows current pick as selected value", () => {
    const userChampionPick: ChampionPick = {
      id: "cp-1",
      user_bolao_id: "ub-1",
      team_id: 20,
      team_name: "Mexico",
      team_logo: "mexico.png",
      created_at: "",
      updated_at: "",
    }

    render(
      <ChampionPickSelector
        {...baseProps}
        userChampionPick={userChampionPick}
      />
    )

    expect(screen.getByLabelText("Select championship winner")).toHaveValue("20")
  })
})
