import { render, screen, cleanup, act } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import Championships from "../championships"
import PersonalMatches from "../personalMatches"
import MatchPreview from "../matchPreview"
import { getChampionshipPreviews, getPersonalPreviews } from "@/app/lib/controllerHome"
import type { FixtureData, Bolao } from "@/app/lib/definitions"

vi.mock("@/app/lib/controllerHome", () => ({ getChampionshipPreviews: vi.fn(), getPersonalPreviews: vi.fn() }))
vi.mock("@/app/ui/bolao/teamCodeLogo", () => ({ default: ({ name }: { name: string }) => <span>{name}</span> }))
vi.mock("@/app/ui/bolao/fixtureDate", () => ({ default: () => <time>Tomorrow 15:00</time> }))
const match = {
  fixture: { id: 1, timestamp: 5000000000, status: { short: "NS" } },
  league: { name: "Serie A", round: "Round 1" },
  teams: { home: { name: "Flamengo" }, away: { name: "Botafogo" } },
} as FixtureData
const preview = { bolao: { id: "group-a", name: "Work friends", competition_id: "71", year: 2026 } as Bolao, matches: [{ fixture: match, incomplete: true, roundIndex: 2 }], state: "pending" as const }

describe("homepage previews", () => {
  beforeEach(() => { vi.resetAllMocks() })
  afterEach(() => { cleanup(); vi.useRealTimers() })

  it("shows real fixtures with a small championship-specific signup link", async () => {
    vi.mocked(getChampionshipPreviews).mockResolvedValue({ championships: [{ id: 71, name: "Serie A", country: "Brazil", season: 2026, status: "inProgress", matches: [{ fixture: match }] }], hasErrors: false })
    render(await Championships())
    expect(screen.getByRole("heading", { name: "Serie A" })).toBeInTheDocument()
    expect(screen.getByText("Flamengo")).toBeInTheDocument()
    expect(screen.getByText("In progress")).toBeInTheDocument()
    expect(screen.getAllByAltText("").some((image) => decodeURIComponent(image.getAttribute("src") ?? "").includes("/logos/leagues/71-light.svg"))).toBe(true)
    expect(screen.getByRole("link", { name: "Create a bolão for Serie A" })).toHaveAttribute("href", "/sign-up?competitionId=71")
  })

  it("welcomes new members with real games and direct championship-prefilled creation links", async () => {
    vi.mocked(getChampionshipPreviews).mockResolvedValue({ championships: [{ id: 71, name: "Serie A", country: "Brazil", season: 2026, matches: [{ fixture: match }] }], hasErrors: false })
    render(await Championships({ onboarding: true }))
    expect(screen.getByRole("heading", { name: "Start your first bolão" })).toBeInTheDocument()
    expect(screen.getByText("Choose a championship, predict the scores and invite your friends.")).toBeInTheDocument()
    expect(screen.getByText("Joining friends? Open the invite link they shared with you.")).toBeInTheDocument()
    expect(screen.getByText("Flamengo")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Create a bolão for Serie A" })).toHaveAttribute("href", "/bolao/create?competitionId=71")
    expect(screen.queryByRole("link", { name: /^Create a bolão$/ })).not.toBeInTheDocument()
    expect(screen.queryByRole("heading", { name: "Predictions to make" })).not.toBeInTheDocument()
  })

  it("keeps creation available to new members when fixtures cannot load", async () => {
    vi.mocked(getChampionshipPreviews).mockResolvedValue({ championships: [], hasErrors: true })
    render(await Championships({ onboarding: true }))
    expect(screen.getByRole("heading", { name: "Start your first bolão" })).toBeInTheDocument()
    expect(screen.getByText(/couldn’t load match details/)).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /^Create a bolão$/ })).toHaveAttribute("href", "/bolao/create")
    expect(screen.getByText(/Joining friends/)).toBeInTheDocument()
  })

  it("hides the entire visitor section when no fixtures load or failures leave it incomplete", async () => {
    vi.mocked(getChampionshipPreviews).mockResolvedValue({ championships: [], hasErrors: true })
    expect(await Championships()).toBeNull()
    vi.mocked(getChampionshipPreviews).mockResolvedValue({ championships: [], hasErrors: false })
    expect(await Championships()).toBeNull()
    vi.mocked(getChampionshipPreviews).mockResolvedValue({ championships: [{
      id: 71, name: "Serie A", country: "Brazil", season: 2026, matches: [{ fixture: match }],
    }], hasErrors: true })
    expect(await Championships()).toBeNull()
  })

  it("keeps three available visitor cards despite failures in undisplayed championships", async () => {
    vi.mocked(getChampionshipPreviews).mockResolvedValue({ championships: [71, 39, 140].map((id) => ({
      id, name: `League ${id}`, country: "World", season: 2026, matches: [{ fixture: match }],
    })), hasErrors: true })
    const view = render(await Championships())
    expect(view.container.querySelectorAll("article")).toHaveLength(3)
    expect(screen.queryByText(/couldn’t load/)).not.toBeInTheDocument()
  })

  it("shows incomplete predictions under the right bolão and links to its betting round", async () => {
    vi.mocked(getPersonalPreviews).mockResolvedValue({ hasBoloes: true, previews: [preview, { ...preview, bolao: { ...preview.bolao, id: "group-b", name: "Family" } }], notices: [] })
    render(await PersonalMatches({ userId: "user" }))
    expect(screen.getByRole("heading", { name: "Work friends" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Family" })).toBeInTheDocument()
    expect(screen.getAllByText("Incomplete prediction")).toHaveLength(2)
    expect(screen.getAllByAltText("").filter((image) => decodeURIComponent(image.getAttribute("src") ?? "").includes("/logos/leagues/71-light.svg"))).toHaveLength(2)
    const links = screen.getAllByRole("link", { name: "Predict Flamengo vs Botafogo" })
    expect(links[0]).toHaveAttribute("href", "/bolao/group-a/bet?roundIndex=2")
    expect(links[1]).toHaveAttribute("href", "/bolao/group-b/bet?roundIndex=2")
    expect(screen.queryByRole("spinbutton")).not.toBeInTheDocument()
  })

  it("distinguishes empty states without listing unavailable bolões", async () => {
    vi.mocked(getPersonalPreviews).mockResolvedValue({ hasBoloes: false, previews: [], notices: [] })
    render(await PersonalMatches({ userId: "user" }))
    expect(screen.getByText(/Create your first bolão below/)).toBeInTheDocument()
    cleanup()
    vi.mocked(getPersonalPreviews).mockResolvedValue({ hasBoloes: true, previews: [], notices: [] })
    render(await PersonalMatches({ userId: "user" }))
    expect(screen.getByText(/You’re all caught up!/)).toBeInTheDocument()
    cleanup()
    vi.mocked(getPersonalPreviews).mockResolvedValue({ hasBoloes: true, previews: [], notices: [{ ...preview, matches: [], state: "awaitingData" }] })
    render(await PersonalMatches({ userId: "user" }))
    expect(screen.queryByText(/Match details will be available soon/)).not.toBeInTheDocument()
    expect(screen.queryByRole("link", { name: "Work friends" })).not.toBeInTheDocument()
    expect(screen.queryByText(/You’re all caught up!/)).not.toBeInTheDocument()
    cleanup()
    vi.mocked(getPersonalPreviews).mockRejectedValue(new Error("DB error"))
    render(await PersonalMatches({ userId: "user" }))
    expect(screen.getByText(/couldn’t load match details/)).toBeInTheDocument()
  })

  it("removes prediction links at kickoff while the page is left open", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-10-28T12:00:00Z"))
    const expiring = { ...match, fixture: { ...match.fixture, timestamp: Date.now() / 1000 + 30 } }
    render(<MatchPreview bolaoId="group-a" matches={[{ fixture: expiring, roundIndex: 1 }]} />)
    expect(screen.getByRole("link")).toBeInTheDocument()
    act(() => { vi.advanceTimersByTime(30000) })
    expect(screen.queryByRole("link")).not.toBeInTheDocument()
  })
})
