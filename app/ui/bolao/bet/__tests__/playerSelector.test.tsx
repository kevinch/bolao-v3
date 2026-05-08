import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi, beforeEach } from "vitest"
import PlayerSelector from "../playerSelector"
import type { PlayersData } from "@/app/lib/definitions"

const mockPush = vi.fn()
const mockUsePathname = vi.fn()
const mockUseSearchParams = vi.fn()

vi.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => mockUseSearchParams(),
}))

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const messages: Record<string, string> = {
      bettingAs: "Betting as",
      selectPlayer: "Select player",
      selectPlayerToBetAs: "Select player to bet as",
    }

    return messages[key] || key
  },
}))

vi.mock("@/components/ui/select", () => ({
  Select: ({
    value,
    onValueChange,
    children,
  }: {
    value: string
    onValueChange: (value: string) => void
    children: React.ReactNode
  }) => (
    <select
      aria-label="Select player to bet as"
      value={value}
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

describe("PlayerSelector", () => {
  const players: PlayersData[] = [
    {
      id: "user-1",
      username: "kevin",
      email: "kevin@example.com",
      userBolaoId: "user-bolao-1",
    },
    {
      id: "user-2",
      username: null,
      email: "jane@example.com",
      userBolaoId: "user-bolao-2",
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    mockUsePathname.mockReturnValue("/bolao/123/bet")
    mockUseSearchParams.mockReturnValue(new URLSearchParams("roundIndex=4"))
  })

  it("should render the translated label", () => {
    render(
      <PlayerSelector players={players} selectedUserBolaoId="user-bolao-1" />
    )

    expect(screen.getByText("Betting as")).toBeInTheDocument()
  })

  it("should render player usernames and fallback to email username", () => {
    render(
      <PlayerSelector players={players} selectedUserBolaoId="user-bolao-1" />
    )

    expect(screen.getByRole("option", { name: "kevin" })).toBeInTheDocument()
    expect(screen.getByRole("option", { name: "jane" })).toBeInTheDocument()
  })

  it("should select the provided userBolaoId", () => {
    render(
      <PlayerSelector players={players} selectedUserBolaoId="user-bolao-2" />
    )

    expect(screen.getByLabelText("Select player to bet as")).toHaveValue(
      "user-bolao-2"
    )
  })

  it("should preserve existing query params when selecting another player", async () => {
    const user = userEvent.setup()
    render(
      <PlayerSelector players={players} selectedUserBolaoId="user-bolao-1" />
    )

    await user.selectOptions(
      screen.getByLabelText("Select player to bet as"),
      "user-bolao-2"
    )

    expect(mockPush).toHaveBeenCalledWith(
      "/bolao/123/bet?roundIndex=4&userBolaoId=user-bolao-2"
    )
  })

  it("should replace an existing selected player query param", async () => {
    const user = userEvent.setup()
    mockUseSearchParams.mockReturnValue(
      new URLSearchParams("roundIndex=4&userBolaoId=user-bolao-1")
    )

    render(
      <PlayerSelector players={players} selectedUserBolaoId="user-bolao-1" />
    )

    await user.selectOptions(
      screen.getByLabelText("Select player to bet as"),
      "user-bolao-2"
    )

    expect(mockPush).toHaveBeenCalledWith(
      "/bolao/123/bet?roundIndex=4&userBolaoId=user-bolao-2"
    )
  })
})
