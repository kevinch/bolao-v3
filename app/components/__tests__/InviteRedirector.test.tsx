import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render } from "@testing-library/react"
import InviteRedirector from "../InviteRedirector"
import { SESSION_STORAGE_INVITE_KEY } from "@/app/lib/utils"

// Mock next/navigation
const mockReplace = vi.fn()
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}))

describe("InviteRedirector", () => {
  let originalWindow: typeof window
  let sessionStorageMock: Record<string, string>

  beforeEach(() => {
    // Reset mocks
    mockReplace.mockClear()
    sessionStorageMock = {}

    // Mock sessionStorage
    Object.defineProperty(window, "sessionStorage", {
      value: {
        getItem: vi.fn((key: string) => sessionStorageMock[key] || null),
        setItem: vi.fn((key: string, value: string) => {
          sessionStorageMock[key] = value
        }),
        removeItem: vi.fn((key: string) => {
          delete sessionStorageMock[key]
        }),
        clear: vi.fn(() => {
          sessionStorageMock = {}
        }),
      },
      writable: true,
    })

    // Store original window
    originalWindow = window
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it("should render without crashing", () => {
    const { container } = render(<InviteRedirector />)
    expect(container.firstChild).toBeNull() // Component returns null
  })

  it("should return null (not render anything)", () => {
    const { container } = render(<InviteRedirector />)
    expect(container.innerHTML).toBe("")
  })

  it("should not redirect when on localhost", () => {
    // Mock window.location
    Object.defineProperty(window, "location", {
      value: {
        hostname: "localhost",
      },
      writable: true,
    })

    sessionStorageMock[SESSION_STORAGE_INVITE_KEY] = "https://example.com/invite"

    render(<InviteRedirector />)

    expect(mockReplace).not.toHaveBeenCalled()
    expect(window.sessionStorage.removeItem).not.toHaveBeenCalled()
  })

  it("should not redirect when on 127.0.0.1", () => {
    Object.defineProperty(window, "location", {
      value: {
        hostname: "127.0.0.1",
      },
      writable: true,
    })

    sessionStorageMock[SESSION_STORAGE_INVITE_KEY] = "https://example.com/invite"

    render(<InviteRedirector />)

    expect(mockReplace).not.toHaveBeenCalled()
    expect(window.sessionStorage.removeItem).not.toHaveBeenCalled()
  })

  it("should redirect when on production domain with valid invite link", () => {
    Object.defineProperty(window, "location", {
      value: {
        hostname: "bolaov3.com",
      },
      writable: true,
    })

    const inviteUrl = "https://example.com/invite/123"
    sessionStorageMock[SESSION_STORAGE_INVITE_KEY] = inviteUrl

    render(<InviteRedirector />)

    expect(window.sessionStorage.getItem).toHaveBeenCalledWith(
      SESSION_STORAGE_INVITE_KEY
    )
    expect(window.sessionStorage.removeItem).toHaveBeenCalledWith(
      SESSION_STORAGE_INVITE_KEY
    )
    expect(mockReplace).toHaveBeenCalledWith(inviteUrl)
  })

  it("should redirect with http protocol", () => {
    Object.defineProperty(window, "location", {
      value: {
        hostname: "bolaov3.com",
      },
      writable: true,
    })

    const inviteUrl = "http://example.com/invite/123"
    sessionStorageMock[SESSION_STORAGE_INVITE_KEY] = inviteUrl

    render(<InviteRedirector />)

    expect(mockReplace).toHaveBeenCalledWith(inviteUrl)
    expect(window.sessionStorage.removeItem).toHaveBeenCalledWith(
      SESSION_STORAGE_INVITE_KEY
    )
  })

  it("should redirect with https protocol", () => {
    Object.defineProperty(window, "location", {
      value: {
        hostname: "bolaov3.com",
      },
      writable: true,
    })

    const inviteUrl = "https://secure.example.com/invite/123"
    sessionStorageMock[SESSION_STORAGE_INVITE_KEY] = inviteUrl

    render(<InviteRedirector />)

    expect(mockReplace).toHaveBeenCalledWith(inviteUrl)
    expect(window.sessionStorage.removeItem).toHaveBeenCalledWith(
      SESSION_STORAGE_INVITE_KEY
    )
  })

  it("should not redirect when invite link is missing", () => {
    Object.defineProperty(window, "location", {
      value: {
        hostname: "bolaov3.com",
      },
      writable: true,
    })

    // No invite link in sessionStorage

    render(<InviteRedirector />)

    expect(window.sessionStorage.getItem).toHaveBeenCalledWith(
      SESSION_STORAGE_INVITE_KEY
    )
    expect(mockReplace).not.toHaveBeenCalled()
    expect(window.sessionStorage.removeItem).not.toHaveBeenCalled()
  })

  it("should not redirect when invite link is invalid (no protocol)", () => {
    Object.defineProperty(window, "location", {
      value: {
        hostname: "bolaov3.com",
      },
      writable: true,
    })

    sessionStorageMock[SESSION_STORAGE_INVITE_KEY] = "example.com/invite"

    render(<InviteRedirector />)

    expect(window.sessionStorage.getItem).toHaveBeenCalledWith(
      SESSION_STORAGE_INVITE_KEY
    )
    expect(mockReplace).not.toHaveBeenCalled()
    expect(window.sessionStorage.removeItem).not.toHaveBeenCalled()
  })

  it("should not redirect when invite link is invalid (wrong protocol)", () => {
    Object.defineProperty(window, "location", {
      value: {
        hostname: "bolaov3.com",
      },
      writable: true,
    })

    sessionStorageMock[SESSION_STORAGE_INVITE_KEY] = "ftp://example.com/invite"

    render(<InviteRedirector />)

    expect(mockReplace).not.toHaveBeenCalled()
    expect(window.sessionStorage.removeItem).not.toHaveBeenCalled()
  })

  it("should not redirect when invite link is empty string", () => {
    Object.defineProperty(window, "location", {
      value: {
        hostname: "bolaov3.com",
      },
      writable: true,
    })

    sessionStorageMock[SESSION_STORAGE_INVITE_KEY] = ""

    render(<InviteRedirector />)

    expect(mockReplace).not.toHaveBeenCalled()
    expect(window.sessionStorage.removeItem).not.toHaveBeenCalled()
  })

  it("should not redirect when invite link is just protocol", () => {
    Object.defineProperty(window, "location", {
      value: {
        hostname: "bolaov3.com",
      },
      writable: true,
    })

    sessionStorageMock[SESSION_STORAGE_INVITE_KEY] = "https://"

    render(<InviteRedirector />)

    expect(mockReplace).not.toHaveBeenCalled()
    expect(window.sessionStorage.removeItem).not.toHaveBeenCalled()
  })

  it("should handle complex invite URLs with query params", () => {
    Object.defineProperty(window, "location", {
      value: {
        hostname: "bolaov3.com",
      },
      writable: true,
    })

    const inviteUrl =
      "https://example.com/invite/123?ref=user456&source=email"
    sessionStorageMock[SESSION_STORAGE_INVITE_KEY] = inviteUrl

    render(<InviteRedirector />)

    expect(mockReplace).toHaveBeenCalledWith(inviteUrl)
    expect(window.sessionStorage.removeItem).toHaveBeenCalledWith(
      SESSION_STORAGE_INVITE_KEY
    )
  })

  it("should handle invite URLs with hash fragments", () => {
    Object.defineProperty(window, "location", {
      value: {
        hostname: "bolaov3.com",
      },
      writable: true,
    })

    const inviteUrl = "https://example.com/invite/123#section"
    sessionStorageMock[SESSION_STORAGE_INVITE_KEY] = inviteUrl

    render(<InviteRedirector />)

    expect(mockReplace).toHaveBeenCalledWith(inviteUrl)
    expect(window.sessionStorage.removeItem).toHaveBeenCalledWith(
      SESSION_STORAGE_INVITE_KEY
    )
  })

  it("should handle invite URLs with ports", () => {
    Object.defineProperty(window, "location", {
      value: {
        hostname: "bolaov3.com",
      },
      writable: true,
    })

    const inviteUrl = "https://example.com:8080/invite/123"
    sessionStorageMock[SESSION_STORAGE_INVITE_KEY] = inviteUrl

    render(<InviteRedirector />)

    expect(mockReplace).toHaveBeenCalledWith(inviteUrl)
    expect(window.sessionStorage.removeItem).toHaveBeenCalledWith(
      SESSION_STORAGE_INVITE_KEY
    )
  })

  it("should only run effect once on mount", () => {
    Object.defineProperty(window, "location", {
      value: {
        hostname: "bolaov3.com",
      },
      writable: true,
    })

    const inviteUrl = "https://example.com/invite/123"
    sessionStorageMock[SESSION_STORAGE_INVITE_KEY] = inviteUrl

    const { rerender } = render(<InviteRedirector />)

    expect(mockReplace).toHaveBeenCalledTimes(1)

    // Rerender should not trigger another redirect
    rerender(<InviteRedirector />)

    // Still only called once
    expect(mockReplace).toHaveBeenCalledTimes(1)
  })

  it("should work with different production hostnames", () => {
    const productionDomains = [
      "app.bolaov3.com",
      "bolaov3.vercel.app",
      "example.com",
      "subdomain.example.com",
    ]

    productionDomains.forEach((hostname) => {
      mockReplace.mockClear()
      vi.mocked(window.sessionStorage.removeItem).mockClear()

      Object.defineProperty(window, "location", {
        value: { hostname },
        writable: true,
      })

      const inviteUrl = "https://example.com/invite/123"
      sessionStorageMock[SESSION_STORAGE_INVITE_KEY] = inviteUrl

      render(<InviteRedirector />)

      expect(mockReplace).toHaveBeenCalledWith(inviteUrl)
      expect(window.sessionStorage.removeItem).toHaveBeenCalledWith(
        SESSION_STORAGE_INVITE_KEY
      )
    })
  })

  it("should remove invite link from sessionStorage after redirect", () => {
    Object.defineProperty(window, "location", {
      value: {
        hostname: "bolaov3.com",
      },
      writable: true,
    })

    const inviteUrl = "https://example.com/invite/123"
    sessionStorageMock[SESSION_STORAGE_INVITE_KEY] = inviteUrl

    render(<InviteRedirector />)

    expect(window.sessionStorage.removeItem).toHaveBeenCalledWith(
      SESSION_STORAGE_INVITE_KEY
    )
    expect(sessionStorageMock[SESSION_STORAGE_INVITE_KEY]).toBeUndefined()
  })

  it("should validate URL format correctly with regex", () => {
    Object.defineProperty(window, "location", {
      value: {
        hostname: "bolaov3.com",
      },
      writable: true,
    })

    const validUrls = [
      "https://example.com",
      "http://example.com",
      "https://example.com/path",
      "https://sub.example.com",
      "https://example.com:3000",
    ]

    validUrls.forEach((url) => {
      mockReplace.mockClear()
      sessionStorageMock[SESSION_STORAGE_INVITE_KEY] = url
      render(<InviteRedirector />)
      expect(mockReplace).toHaveBeenCalledWith(url)
    })
  })

  it("should reject invalid URL formats", () => {
    Object.defineProperty(window, "location", {
      value: {
        hostname: "bolaov3.com",
      },
      writable: true,
    })

    const invalidUrls = [
      "not-a-url",
      "//example.com",
      "file://example.com",
      "javascript:alert(1)",
      "data:text/html,<script>alert(1)</script>",
    ]

    invalidUrls.forEach((url) => {
      mockReplace.mockClear()
      sessionStorageMock[SESSION_STORAGE_INVITE_KEY] = url
      render(<InviteRedirector />)
      expect(mockReplace).not.toHaveBeenCalled()
    })
  })
})

