import { render, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import InviteButton from "../inviteButton"

const mockToast = vi.fn()
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: mockToast }),
}))

describe("InviteButton", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.defineProperty(navigator, "userAgent", {
      value: "Mozilla/5.0 (iPhone)",
      configurable: true,
    })
  })

  it("passes the invite URL once through the native share payload", async () => {
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
        text: "Join my bolão Test Bolao on Bolão.io and make your predictions:",
        url: "http://localhost:3000/bolao/bolao-123/invite",
      })
    })
    expect(share.mock.calls[0][0].text).not.toContain("http")
  })
})
