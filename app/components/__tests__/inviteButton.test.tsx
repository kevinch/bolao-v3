import { render, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import InviteButton from "../inviteButton"
import { createInviteLink } from "@/app/lib/actions"

const mockToast = vi.fn()
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: mockToast }),
}))

vi.mock("@/app/lib/actions", () => ({
  createInviteLink: vi.fn(),
}))

describe("InviteButton", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.defineProperty(navigator, "userAgent", {
      value: "Mozilla/5.0 (iPhone)",
      configurable: true,
    })
    vi.mocked(createInviteLink).mockResolvedValue({
      success: true,
      token: "tok-xyz",
    })
  })

  it("shares a signed invite URL (with token) once through the native share payload", async () => {
    const user = userEvent.setup()
    const share = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, "share", {
      value: share,
      configurable: true,
    })

    const { getByRole } = render(
      <InviteButton bolaoId="bolao-123" bolaoName="Test Bolao" />
    )

    await user.click(getByRole("button", { name: "Invite" }))

    await waitFor(() => {
      expect(share).toHaveBeenCalledWith({
        title: "Test Bolao",
        text: "Join my bolão \"Test Bolao\" on Bolão.io and make your predictions:",
        url: "http://localhost:3000/bolao/bolao-123/invite?t=tok-xyz",
      })
    })
    expect(createInviteLink).toHaveBeenCalledWith("bolao-123")
    expect(share.mock.calls[0][0].text).not.toContain("http")
  })

  it("shows an error and does not share when the link cannot be minted", async () => {
    const user = userEvent.setup()
    const share = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, "share", {
      value: share,
      configurable: true,
    })
    vi.mocked(createInviteLink).mockResolvedValue({
      success: false,
      message: "Forbidden.",
    })

    const { getByRole } = render(
      <InviteButton bolaoId="bolao-123" bolaoName="Test Bolao" />
    )

    await user.click(getByRole("button", { name: "Invite" }))

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({ variant: "destructive" })
      )
    })
    expect(share).not.toHaveBeenCalled()
  })
})
