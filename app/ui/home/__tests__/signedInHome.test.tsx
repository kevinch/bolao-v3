import { render, screen, cleanup } from "@testing-library/react"
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest"
import SignedInHome from "../signedInHome"
import { fetchBoloesByUserId } from "@/app/lib/data"
import type { Bolao } from "@/app/lib/definitions"

vi.mock("@/app/lib/data", () => ({ fetchBoloesByUserId: vi.fn() }))
vi.mock("../championships", () => ({
  default: ({ onboarding }: { onboarding?: boolean }) => onboarding ? <h2>Start your first bolão</h2> : <h2>Coming up on Bolão.io</h2>,
}))
vi.mock("../personalMatches", () => ({ default: () => <h2>Predictions to make</h2> }))
vi.mock("../boloesList", () => ({ default: ({ boloes }: { boloes: Bolao[] }) => <section><h2>Your bolões</h2>{boloes.map((bolao) => <p key={bolao.id}>{bolao.name}</p>)}</section> }))

const group = { id: "friends", name: "Friends", year: 2026 } as Bolao

describe("signed-in homepage states", () => {
  beforeEach(() => vi.resetAllMocks())
  afterEach(() => cleanup())

  it("replaces prediction and bolão sections with onboarding for users without memberships", async () => {
    vi.mocked(fetchBoloesByUserId).mockResolvedValue([])
    render(await SignedInHome({ userId: "new-user" }))
    expect(fetchBoloesByUserId).toHaveBeenCalledExactlyOnceWith("new-user")
    expect(screen.getByRole("heading", { name: "Start your first bolão" })).toBeInTheDocument()
    expect(screen.queryByRole("heading", { name: "Predictions to make" })).not.toBeInTheDocument()
    expect(screen.queryByRole("heading", { name: "Your bolões" })).not.toBeInTheDocument()
    expect(screen.queryByRole("link", { name: "Create bolão" })).not.toBeInTheDocument()
  })

  it("shows the normal sections after creating or joining a bolão", async () => {
    vi.mocked(fetchBoloesByUserId).mockResolvedValueOnce([]).mockResolvedValueOnce([group])
    render(await SignedInHome({ userId: "new-user" }))
    expect(screen.getByRole("heading", { name: "Start your first bolão" })).toBeInTheDocument()
    cleanup()
    render(await SignedInHome({ userId: "new-user" }))
    expect(screen.getByRole("heading", { name: "Predictions to make" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Your bolões" })).toBeInTheDocument()
    expect(screen.getByText("Friends")).toBeInTheDocument()
    expect(screen.queryByRole("heading", { name: "Start your first bolão" })).not.toBeInTheDocument()
  })

  it("keeps users with only past bolões in the normal home view", async () => {
    vi.mocked(fetchBoloesByUserId).mockResolvedValue([{ ...group, year: 2020 }])
    render(await SignedInHome({ userId: "returning-user" }))
    expect(screen.getByRole("heading", { name: "Your bolões" })).toBeInTheDocument()
    expect(screen.queryByRole("heading", { name: "Start your first bolão" })).not.toBeInTheDocument()
  })

  it("does not mistake a membership-loading failure for a new user", async () => {
    vi.mocked(fetchBoloesByUserId).mockRejectedValue(new Error("database unavailable"))
    render(await SignedInHome({ userId: "user" }))
    expect(screen.getByText(/couldn’t load match details/)).toBeInTheDocument()
    expect(screen.queryByRole("heading", { name: "Start your first bolão" })).not.toBeInTheDocument()
  })
})
