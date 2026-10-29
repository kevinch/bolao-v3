import { render, cleanup, fireEvent } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import InviteRedirector from "../InviteRedirector"
import CompetitionIntentCapture from "../CompetitionIntentCapture"
import ChampionshipCreateLink from "@/app/ui/home/championshipCreateLink"
import { COMPETITION_INTENT_KEY, rememberCompetition, consumeCompetition } from "@/app/lib/competitionIntent"
import { SESSION_STORAGE_INVITE_KEY } from "@/app/lib/utils"
const { replace, get } = vi.hoisted(() => ({ replace: vi.fn(), get: vi.fn() }))
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }), useSearchParams: () => ({ get }) }))

describe("championship signup journey", () => {
  beforeEach(() => { sessionStorage.clear(); vi.clearAllMocks() })
  afterEach(() => cleanup())

  it("captures a championship card click and a directly opened signup URL", () => {
    const view = render(<ChampionshipCreateLink competitionId={71} name="Serie A">Create</ChampionshipCreateLink>)
    fireEvent.click(view.getByRole("link"), { ctrlKey: true })
    expect(consumeCompetition()).toBe("71")
    cleanup()
    get.mockReturnValue("39")
    render(<CompetitionIntentCapture />)
    expect(consumeCompetition()).toBe("39")
  })

  it("waits until signed in, then opens creation with the selected championship once", () => {
    rememberCompetition("71")
    const view = render(<InviteRedirector />)
    expect(replace).not.toHaveBeenCalled()
    view.rerender(<InviteRedirector signedIn />)
    expect(replace).toHaveBeenCalledExactlyOnceWith("/bolao/create?competitionId=71")
    expect(sessionStorage.getItem(COMPETITION_INTENT_KEY)).toBeNull()
  })

  it("sends signed-in members directly to creation without saving signup intent", () => {
    const view = render(<ChampionshipCreateLink competitionId={71} name="Serie A" signedIn>Create</ChampionshipCreateLink>)
    const link = view.getByRole("link")
    expect(link).toHaveAttribute("href", "/bolao/create?competitionId=71")
    fireEvent.click(link, { ctrlKey: true })
    expect(consumeCompetition()).toBeUndefined()
  })

  it("discards championship intent when an invite is pending", () => {
    rememberCompetition("71")
    sessionStorage.setItem(SESSION_STORAGE_INVITE_KEY, "https://bolao.io/bolao/friends/invite")
    render(<InviteRedirector signedIn />)
    expect(replace).not.toHaveBeenCalledWith("/bolao/create?competitionId=71")
    expect(sessionStorage.getItem(COMPETITION_INTENT_KEY)).toBeNull()
  })
})
