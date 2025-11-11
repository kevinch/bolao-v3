import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { vi } from "vitest"
import CopyToClipboard from "../copyToClipboard"

// Mock toast hook
const mockToast = vi.fn()
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: mockToast }),
}))

describe("CopyToClipboard", () => {
  const mockBolaoId = "bolao-123"

  beforeEach(() => {
    vi.clearAllMocks()

    // Mock window.location
    Object.defineProperty(window, "location", {
      value: { href: "http://localhost:3000/" },
      writable: true,
      configurable: true,
    })
  })

  it("should render button with correct text", () => {
    render(<CopyToClipboard bolaoId={mockBolaoId} />)

    const button = screen.getByRole("button", { name: /copy invite link/i })
    expect(button).toBeInTheDocument()
  })

  it("should show success toast when copy is successful", async () => {
    const user = userEvent.setup()
    const mockWriteText = vi.fn().mockResolvedValue(undefined)

    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: mockWriteText },
      writable: true,
      configurable: true,
    })

    render(<CopyToClipboard bolaoId={mockBolaoId} />)

    const button = screen.getByRole("button", { name: /copy invite link/i })
    await user.click(button)

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "Success",
        description: "The link was copied to the clipboard.",
        variant: "success",
      })
    })
  })

  it("should show error toast when copy fails", async () => {
    const user = userEvent.setup()
    const mockWriteText = vi
      .fn()
      .mockRejectedValue(new Error("Clipboard error"))

    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: mockWriteText },
      writable: true,
      configurable: true,
    })

    render(<CopyToClipboard bolaoId={mockBolaoId} />)

    const button = screen.getByRole("button", { name: /copy invite link/i })
    await user.click(button)

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        description: "Failed to copy the link to the clipboard.",
        variant: "destructive",
      })
    })
  })

  it("should be clickable multiple times", async () => {
    const user = userEvent.setup()
    const mockWriteText = vi.fn().mockResolvedValue(undefined)

    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: mockWriteText },
      writable: true,
      configurable: true,
    })

    render(<CopyToClipboard bolaoId={mockBolaoId} />)

    const button = screen.getByRole("button", { name: /copy invite link/i })

    // Click multiple times
    await user.click(button)
    await user.click(button)
    await user.click(button)

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledTimes(3)
    })
  })
})
